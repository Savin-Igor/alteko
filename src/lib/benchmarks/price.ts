import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type GroupByDimension = 'city' | 'wallMaterial'

export interface PriceBenchmarkParams {
  city?: string
  cadastralCode?: string
  yearFrom?: number
  yearTo?: number
  txYears?: number
  minArea?: number
  maxArea?: number
  /** When set, returns a breakdown per city or wallMaterial instead of a single result */
  groupBy?: GroupByDimension
}

export interface GroupStats {
  p25: number
  p50: number
  p75: number
  count: number
}

export interface ComparisonEntry {
  renovated: GroupStats | null
  notRenovated: GroupStats | null
  premiumPct: number | null
}

/** Single-segment result (no groupBy) */
export interface PriceBenchmarkResult extends ComparisonEntry {
  currency: 'EUR/m2'
  periodFrom: string
  periodTo: string
  filters: {
    city?: string
    cadastralCode?: string
    buildingYearFrom?: number
    buildingYearTo?: number
    txYears: number
  }
  lowDataWarning: boolean
}

/** Multi-segment result (groupBy=city or groupBy=wallMaterial) */
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
    txYears: number
  }
}

const MIN_TRANSACTIONS = 5

type RawCompareRow = {
  renovation_group: string
  p25: number | null
  p50: number | null
  p75: number | null
  count: bigint
}

type RawBreakdownRow = RawCompareRow & { segment_label: string }

function toStats(p25: number | null, p50: number | null, p75: number | null, count: bigint): GroupStats | null {
  const n = Number(count)
  if (n < MIN_TRANSACTIONS || p50 == null) return null
  return { p25: Math.round(p25!), p50: Math.round(p50), p75: Math.round(p75!), count: n }
}

function buildComparison(rows: RawCompareRow[]): ComparisonEntry {
  const rRow  = rows.find(r => r.renovation_group === 'renovated')
  const nrRow = rows.find(r => r.renovation_group === 'not_renovated')
  const renovated    = rRow  ? toStats(rRow.p25,  rRow.p50,  rRow.p75,  rRow.count)  : null
  const notRenovated = nrRow ? toStats(nrRow.p25, nrRow.p50, nrRow.p75, nrRow.count) : null
  const premiumPct   = renovated && notRenovated
    ? Math.round((renovated.p50 / notRenovated.p50 - 1) * 100)
    : null
  return { renovated, notRenovated, premiumPct }
}

// Shared WHERE clause — all user filters applied here.
// All values are Prisma-bound parameters: no SQL injection risk.
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
    AND (${city}::text          IS NULL OR t."city"             = ${city})
    AND (${cadastralCode}::text IS NULL OR t."buildingCadNr"    = ${cadastralCode})
    AND (${yearFrom}::int       IS NULL OR t."buildingYear"     >= ${yearFrom})
    AND (${yearTo}::int         IS NULL OR t."buildingYear"     <= ${yearTo})
    AND (${minArea}::float      IS NULL OR t."apartmentAreaM2"  >= ${minArea})
    AND (${maxArea}::float      IS NULL OR t."apartmentAreaM2"  <= ${maxArea})
  `
}

async function getLatestTransactionDate(): Promise<string> {
  const latest = await prisma.apartmentTransaction.findFirst({
    orderBy: { transactionDate: 'desc' },
    select: { transactionDate: true },
  })
  return (latest?.transactionDate ?? new Date()).toISOString().slice(0, 10)
}

// ─── Single-segment query (no groupBy) ───────────────────────────────────────

export async function getPriceBenchmark(
  params: PriceBenchmarkParams,
): Promise<PriceBenchmarkResult | null> {
  const { city, cadastralCode, yearFrom, yearTo, txYears = 5, minArea, maxArea } = params

  const periodStart = new Date()
  periodStart.setFullYear(periodStart.getFullYear() - txYears)

  const whereClause = buildWhereClause({
    city: city ?? null,
    cadastralCode: cadastralCode ?? null,
    yearFrom: yearFrom ?? null,
    yearTo: yearTo ?? null,
    minArea: minArea ?? null,
    maxArea: maxArea ?? null,
    periodStart,
  })

  const baseSubquery = Prisma.sql`
    SELECT
      CASE WHEN b."energyClass" IN ('A','B') THEN 'renovated' ELSE 'not_renovated' END AS renovation_group,
      t."priceEur"::float / t."apartmentAreaM2"::float AS price_per_m2
    FROM "ApartmentTransaction" t
    JOIN "Building" b ON b."cadastralCode" = t."buildingCadNr"
    WHERE ${whereClause}
  `

  const outliers = await prisma.$queryRaw<{ low: number | null; high: number | null }[]>`
    SELECT
      percentile_cont(0.05) WITHIN GROUP (ORDER BY price_per_m2) AS low,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY price_per_m2) AS high
    FROM (${baseSubquery}) base
  `

  const { low, high } = outliers[0] ?? {}
  if (low == null || high == null) return null

  const rows = await prisma.$queryRaw<RawCompareRow[]>`
    SELECT
      renovation_group,
      percentile_cont(0.25) WITHIN GROUP (ORDER BY price_per_m2) AS p25,
      percentile_cont(0.50) WITHIN GROUP (ORDER BY price_per_m2) AS p50,
      percentile_cont(0.75) WITHIN GROUP (ORDER BY price_per_m2) AS p75,
      COUNT(*) AS count
    FROM (${baseSubquery}) base
    WHERE price_per_m2 BETWEEN ${low} AND ${high}
    GROUP BY renovation_group
  `

  if (rows.length === 0) return null

  const { renovated, notRenovated, premiumPct } = buildComparison(rows)
  if (!renovated && !notRenovated) return null

  return {
    renovated,
    notRenovated,
    premiumPct,
    currency: 'EUR/m2',
    periodFrom: periodStart.toISOString().slice(0, 10),
    periodTo: await getLatestTransactionDate(),
    filters: { city, cadastralCode, buildingYearFrom: yearFrom, buildingYearTo: yearTo, txYears },
    lowDataWarning: !renovated || !notRenovated,
  }
}

// ─── Breakdown query (groupBy=city or groupBy=wallMaterial) ──────────────────

export async function getPriceBenchmarkBreakdown(
  params: PriceBenchmarkParams & { groupBy: GroupByDimension },
): Promise<PriceBenchmarkBreakdown | null> {
  const { city, yearFrom, yearTo, txYears = 5, minArea, maxArea, groupBy } = params

  const periodStart = new Date()
  periodStart.setFullYear(periodStart.getFullYear() - txYears)

  const whereClause = buildWhereClause({
    city: city ?? null,
    cadastralCode: null,
    yearFrom: yearFrom ?? null,
    yearTo: yearTo ?? null,
    minArea: minArea ?? null,
    maxArea: maxArea ?? null,
    periodStart,
  })

  // The segment column: city or wallMaterial (from Building, not transaction)
  const segmentCol = groupBy === 'city'
    ? Prisma.sql`COALESCE(t."city", 'Unknown')`
    : Prisma.sql`COALESCE(b."wallMaterial", 'Unknown')`

  const baseSubquery = Prisma.sql`
    SELECT
      ${segmentCol} AS segment_label,
      CASE WHEN b."energyClass" IN ('A','B') THEN 'renovated' ELSE 'not_renovated' END AS renovation_group,
      t."priceEur"::float / t."apartmentAreaM2"::float AS price_per_m2
    FROM "ApartmentTransaction" t
    JOIN "Building" b ON b."cadastralCode" = t."buildingCadNr"
    WHERE ${whereClause}
  `

  // Outlier bounds per segment (prevents one segment's outliers skewing others)
  const outlierBounds = await prisma.$queryRaw<{ segment_label: string; low: number; high: number }[]>`
    SELECT
      segment_label,
      percentile_cont(0.05) WITHIN GROUP (ORDER BY price_per_m2) AS low,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY price_per_m2) AS high
    FROM (${baseSubquery}) base
    GROUP BY segment_label
  `

  if (outlierBounds.length === 0) return null

  const rows = await prisma.$queryRaw<RawBreakdownRow[]>`
    SELECT
      base.segment_label,
      base.renovation_group,
      percentile_cont(0.25) WITHIN GROUP (ORDER BY base.price_per_m2) AS p25,
      percentile_cont(0.50) WITHIN GROUP (ORDER BY base.price_per_m2) AS p50,
      percentile_cont(0.75) WITHIN GROUP (ORDER BY base.price_per_m2) AS p75,
      COUNT(*) AS count
    FROM (${baseSubquery}) base
    JOIN (
      SELECT
        segment_label,
        percentile_cont(0.05) WITHIN GROUP (ORDER BY price_per_m2) AS low,
        percentile_cont(0.95) WITHIN GROUP (ORDER BY price_per_m2) AS high
      FROM (${baseSubquery}) bounds_base
      GROUP BY segment_label
    ) bounds ON base.segment_label = bounds.segment_label
    WHERE base.price_per_m2 BETWEEN bounds.low AND bounds.high
    GROUP BY base.segment_label, base.renovation_group
    ORDER BY base.segment_label
  `

  if (rows.length === 0) return null

  // Group rows by segment label
  const segmentMap = new Map<string, RawCompareRow[]>()
  for (const row of rows) {
    const key = row.segment_label
    if (!segmentMap.has(key)) segmentMap.set(key, [])
    segmentMap.get(key)!.push(row)
  }

  const segments = Array.from(segmentMap.entries())
    .map(([label, segRows]) => ({ label, ...buildComparison(segRows) }))
    .filter(s => s.renovated || s.notRenovated)
    // Sort by notRenovated p50 descending (most expensive cities first)
    .sort((a, b) => (b.notRenovated?.p50 ?? 0) - (a.notRenovated?.p50 ?? 0))

  if (segments.length === 0) return null

  return {
    groupBy,
    segments,
    currency: 'EUR/m2',
    periodFrom: periodStart.toISOString().slice(0, 10),
    periodTo: await getLatestTransactionDate(),
    filters: { city, buildingYearFrom: yearFrom, buildingYearTo: yearTo, txYears },
  }
}
