import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type GroupByDimension = 'city' | 'wallMaterial'

// Verified by Latvijas Banka Working Paper DP 3/2025 (Romanovs, Jaunzems).
// National average for Latvia; Riga-specific premium is higher (~13%).
// Applied as fallback when renovated transaction sample is too small.
const LB_RENOVATION_PREMIUM = 0.11

// Minimum unique buildings required in the renovated group.
// Below this threshold the measured premium is noise, not signal
// (e.g. Jelgava had 11 buildings → -13% artefact).
const MIN_RENOVATED_BUILDINGS = 20

const MIN_TRANSACTIONS = 5

export interface PriceBenchmarkParams {
  city?: string
  cadastralCode?: string
  yearFrom?: number
  yearTo?: number
  /** Transaction window in months (default 12 — avoids mixing different market cycles) */
  txMonths?: number
  minArea?: number
  maxArea?: number
  groupBy?: GroupByDimension
}

export interface GroupStats {
  p25: number
  p50: number
  p75: number
  count: number
  uniqueBuildings?: number
}

export interface ComparisonEntry {
  renovated: GroupStats | null
  notRenovated: GroupStats | null
  /** Measured from transaction data, or null if insufficient renovated buildings */
  premiumPct: number | null
  /**
   * True when renovated sample had fewer than MIN_RENOVATED_BUILDINGS unique buildings.
   * In this case premiumPct is estimated from Latvijas Banka DP 3/2025 (+11%),
   * not measured directly.
   */
  premiumEstimated: boolean
}

export interface PriceBenchmarkResult extends ComparisonEntry {
  currency: 'EUR/m2'
  periodFrom: string
  periodTo: string
  filters: {
    city?: string
    cadastralCode?: string
    buildingYearFrom?: number
    buildingYearTo?: number
    txMonths: number
  }
}

export interface PriceBenchmarkBreakdown {
  groupBy: GroupByDimension
  segments: Array<ComparisonEntry & { label: string }>
  currency: 'EUR/m2'
  periodFrom: string
  periodTo: string
  filters: {
    city?: string
    buildingYearFrom?: number
    buildingYearTo?: number
    txMonths: number
  }
}

type RawGroupRow = {
  renovation_group: string
  p25: number | null
  p50: number | null
  p75: number | null
  count: bigint
  unique_buildings: bigint
}

type RawBreakdownRow = RawGroupRow & { segment_label: string }

function toStats(row: RawGroupRow): GroupStats | null {
  const count = Number(row.count)
  if (count < MIN_TRANSACTIONS || row.p50 == null) return null
  return {
    p25:             Math.round(row.p25!),
    p50:             Math.round(row.p50),
    p75:             Math.round(row.p75!),
    count,
    uniqueBuildings: Number(row.unique_buildings),
  }
}

function buildComparison(rows: RawGroupRow[]): ComparisonEntry {
  const rRow  = rows.find(r => r.renovation_group === 'renovated')
  const nrRow = rows.find(r => r.renovation_group === 'not_renovated')

  const renovated    = rRow  ? toStats(rRow)  : null
  const notRenovated = nrRow ? toStats(nrRow) : null

  const enoughRenovatedBuildings =
    renovated != null &&
    (renovated.uniqueBuildings ?? 0) >= MIN_RENOVATED_BUILDINGS

  let premiumPct: number | null = null
  let premiumEstimated = false

  if (enoughRenovatedBuildings && notRenovated) {
    // Measured from transaction data
    premiumPct = Math.round((renovated!.p50 / notRenovated.p50 - 1) * 100)
  } else if (notRenovated) {
    // Fallback: Latvijas Banka DP 3/2025 national average
    premiumPct = Math.round(LB_RENOVATION_PREMIUM * 100)
    premiumEstimated = true
  }

  return { renovated, notRenovated, premiumPct, premiumEstimated }
}

function buildWhereClause(params: {
  city: string | null
  cadastralCode: string | null
  yearFrom: number | null
  yearTo: number | null
  minArea: number | null
  maxArea: number | null
  periodStart: Date
}): Prisma.Sql {
  const { city, cadastralCode, yearFrom, yearTo, minArea, maxArea, periodStart } = params
  return Prisma.sql`
    t."apartmentAreaM2" > 10
    AND t."priceEur" > 500
    AND t."transactionDate" >= ${periodStart}
    AND b."energyClass" IS NOT NULL
    AND (${city}::text          IS NULL OR t."city"            = ${city})
    AND (${cadastralCode}::text IS NULL OR t."buildingCadNr"   = ${cadastralCode})
    AND (${yearFrom}::int       IS NULL OR t."buildingYear"   >= ${yearFrom})
    AND (${yearTo}::int         IS NULL OR t."buildingYear"   <= ${yearTo})
    AND (${minArea}::float      IS NULL OR t."apartmentAreaM2" >= ${minArea})
    AND (${maxArea}::float      IS NULL OR t."apartmentAreaM2" <= ${maxArea})
  `
}

async function getLatestTransactionDate(): Promise<string> {
  const latest = await prisma.apartmentTransaction.findFirst({
    orderBy: { transactionDate: 'desc' },
    select: { transactionDate: true },
  })
  return (latest?.transactionDate ?? new Date()).toISOString().slice(0, 10)
}

// ─── Single-segment ───────────────────────────────────────────────────────────

export async function getPriceBenchmark(
  params: PriceBenchmarkParams,
): Promise<PriceBenchmarkResult | null> {
  const { city, cadastralCode, yearFrom, yearTo, txMonths = 12, minArea, maxArea } = params

  const periodStart = new Date()
  periodStart.setMonth(periodStart.getMonth() - txMonths)

  const where = buildWhereClause({
    city: city ?? null,
    cadastralCode: cadastralCode ?? null,
    yearFrom: yearFrom ?? null,
    yearTo: yearTo ?? null,
    minArea: minArea ?? null,
    maxArea: maxArea ?? null,
    periodStart,
  })

  const base = Prisma.sql`
    SELECT
      CASE WHEN b."energyClass" IN ('A','B') THEN 'renovated' ELSE 'not_renovated' END AS renovation_group,
      t."buildingCadNr",
      t."priceEur"::float / t."apartmentAreaM2"::float AS price_per_m2
    FROM "ApartmentTransaction" t
    JOIN "Building" b ON b."cadastralCode" = t."buildingCadNr"
    WHERE ${where}
  `

  const outliers = await prisma.$queryRaw<{ low: number | null; high: number | null }[]>`
    SELECT
      percentile_cont(0.05) WITHIN GROUP (ORDER BY price_per_m2) AS low,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY price_per_m2) AS high
    FROM (${base}) s
  `

  const { low, high } = outliers[0] ?? {}
  if (low == null || high == null) return null

  const rows = await prisma.$queryRaw<RawGroupRow[]>`
    SELECT
      renovation_group,
      percentile_cont(0.25) WITHIN GROUP (ORDER BY price_per_m2) AS p25,
      percentile_cont(0.50) WITHIN GROUP (ORDER BY price_per_m2) AS p50,
      percentile_cont(0.75) WITHIN GROUP (ORDER BY price_per_m2) AS p75,
      COUNT(*)                                                    AS count,
      COUNT(DISTINCT "buildingCadNr")                             AS unique_buildings
    FROM (${base}) s
    WHERE price_per_m2 BETWEEN ${low} AND ${high}
    GROUP BY renovation_group
  `

  if (rows.length === 0) return null

  const { renovated, notRenovated, premiumPct, premiumEstimated } = buildComparison(rows)
  if (!renovated && !notRenovated) return null

  return {
    renovated,
    notRenovated,
    premiumPct,
    premiumEstimated,
    currency:   'EUR/m2',
    periodFrom: periodStart.toISOString().slice(0, 10),
    periodTo:   await getLatestTransactionDate(),
    filters: { city, cadastralCode, buildingYearFrom: yearFrom, buildingYearTo: yearTo, txMonths },
  }
}

// ─── Breakdown (groupBy=city|wallMaterial) ────────────────────────────────────

export async function getPriceBenchmarkBreakdown(
  params: PriceBenchmarkParams & { groupBy: GroupByDimension },
): Promise<PriceBenchmarkBreakdown | null> {
  const { city, yearFrom, yearTo, txMonths = 12, minArea, maxArea, groupBy } = params

  const periodStart = new Date()
  periodStart.setMonth(periodStart.getMonth() - txMonths)

  const where = buildWhereClause({
    city: city ?? null,
    cadastralCode: null,
    yearFrom: yearFrom ?? null,
    yearTo: yearTo ?? null,
    minArea: minArea ?? null,
    maxArea: maxArea ?? null,
    periodStart,
  })

  const segmentCol = groupBy === 'city'
    ? Prisma.sql`COALESCE(t."city", 'Unknown')`
    : Prisma.sql`COALESCE(b."wallMaterial", 'Unknown')`

  const base = Prisma.sql`
    SELECT
      ${segmentCol}                                                                    AS segment_label,
      CASE WHEN b."energyClass" IN ('A','B') THEN 'renovated' ELSE 'not_renovated' END AS renovation_group,
      t."buildingCadNr",
      t."priceEur"::float / t."apartmentAreaM2"::float                                AS price_per_m2
    FROM "ApartmentTransaction" t
    JOIN "Building" b ON b."cadastralCode" = t."buildingCadNr"
    WHERE ${where}
  `

  const rows = await prisma.$queryRaw<RawBreakdownRow[]>`
    SELECT
      trimmed.segment_label,
      trimmed.renovation_group,
      percentile_cont(0.25) WITHIN GROUP (ORDER BY trimmed.price_per_m2) AS p25,
      percentile_cont(0.50) WITHIN GROUP (ORDER BY trimmed.price_per_m2) AS p50,
      percentile_cont(0.75) WITHIN GROUP (ORDER BY trimmed.price_per_m2) AS p75,
      COUNT(*)                                                            AS count,
      COUNT(DISTINCT trimmed."buildingCadNr")                             AS unique_buildings
    FROM (
      SELECT s.*,
        percentile_cont(0.05) WITHIN GROUP (ORDER BY s.price_per_m2)
          OVER (PARTITION BY s.segment_label) AS outlier_low,
        percentile_cont(0.95) WITHIN GROUP (ORDER BY s.price_per_m2)
          OVER (PARTITION BY s.segment_label) AS outlier_high
      FROM (${base}) s
    ) trimmed
    WHERE trimmed.price_per_m2 BETWEEN trimmed.outlier_low AND trimmed.outlier_high
    GROUP BY trimmed.segment_label, trimmed.renovation_group
    ORDER BY trimmed.segment_label
  `

  if (rows.length === 0) return null

  const segmentMap = new Map<string, RawGroupRow[]>()
  for (const row of rows) {
    const key = row.segment_label
    if (!segmentMap.has(key)) segmentMap.set(key, [])
    segmentMap.get(key)!.push(row)
  }

  const segments = Array.from(segmentMap.entries())
    .map(([label, segRows]) => ({ label, ...buildComparison(segRows) }))
    .filter(s => s.renovated || s.notRenovated)
    .sort((a, b) => (b.notRenovated?.p50 ?? 0) - (a.notRenovated?.p50 ?? 0))

  if (segments.length === 0) return null

  return {
    groupBy,
    segments,
    currency:   'EUR/m2',
    periodFrom: periodStart.toISOString().slice(0, 10),
    periodTo:   await getLatestTransactionDate(),
    filters: { city, buildingYearFrom: yearFrom, buildingYearTo: yearTo, txMonths },
  }
}
