import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Renovation price premium — Latvijas Banka Working Paper DP 3/2025
// (Romanovs, Jaunzems). National average across Latvia.
// Source: https://datnes.latvijasbanka.lv/papers/DP_3_2025_EN.pdf
export const RENOVATION_PREMIUM_PCT = 11

export type GroupByDimension = 'city' | 'wallMaterial'

export interface PriceBenchmarkParams {
  city?: string
  cadastralCode?: string
  yearFrom?: number
  yearTo?: number
  /** Transaction window in months (default 12) */
  txMonths?: number
  minArea?: number
  maxArea?: number
  groupBy?: GroupByDimension
}

export interface MarketStats {
  p25: number
  p50: number
  p75: number
  count: number
  /** Estimated price after renovation: p50 × (1 + RENOVATION_PREMIUM_PCT/100) */
  estimatedRenovatedP50: number
}

export interface PriceBenchmarkResult {
  market: MarketStats
  /** Always RENOVATION_PREMIUM_PCT — from Latvijas Banka DP 3/2025 */
  renovationPremiumPct: number
  renovationPremiumSource: string
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
  segments: Array<{ label: string } & MarketStats>
  renovationPremiumPct: number
  renovationPremiumSource: string
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

const MIN_TRANSACTIONS = 5

type RawStatsRow = {
  p25: number | null
  p50: number | null
  p75: number | null
  count: bigint
}

type RawBreakdownRow = RawStatsRow & { segment_label: string }

function toMarketStats(row: RawStatsRow): MarketStats | null {
  const count = Number(row.count)
  if (count < MIN_TRANSACTIONS || row.p50 == null) return null
  const p50 = Math.round(row.p50)
  return {
    p25: Math.round(row.p25!),
    p50,
    p75: Math.round(row.p75!),
    count,
    estimatedRenovatedP50: Math.round(p50 * (1 + RENOVATION_PREMIUM_PCT / 100)),
  }
}

function buildWhereClause(p: {
  city: string | null
  cadastralCode: string | null
  yearFrom: number | null
  yearTo: number | null
  minArea: number | null
  maxArea: number | null
  periodStart: Date
}): Prisma.Sql {
  return Prisma.sql`
    "apartmentAreaM2" > 10
    AND "priceEur" > 500
    AND "transactionDate" >= ${p.periodStart}
    AND (${p.city}::text          IS NULL OR "city"            = ${p.city})
    AND (${p.cadastralCode}::text IS NULL OR "buildingCadNr"   = ${p.cadastralCode})
    AND (${p.yearFrom}::int       IS NULL OR "buildingYear"   >= ${p.yearFrom})
    AND (${p.yearTo}::int         IS NULL OR "buildingYear"   <= ${p.yearTo})
    AND (${p.minArea}::float      IS NULL OR "apartmentAreaM2" >= ${p.minArea})
    AND (${p.maxArea}::float      IS NULL OR "apartmentAreaM2" <= ${p.maxArea})
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

  // Pass 1: outlier bounds
  const bounds = await prisma.$queryRaw<{ low: number; high: number }[]>`
    SELECT
      percentile_cont(0.05) WITHIN GROUP (ORDER BY "priceEur"::float / "apartmentAreaM2"::float) AS low,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY "priceEur"::float / "apartmentAreaM2"::float) AS high
    FROM "ApartmentTransaction"
    WHERE ${where}
  `
  const { low, high } = bounds[0] ?? {}
  if (low == null || high == null) return null

  // Pass 2: percentiles on trimmed set
  const rows = await prisma.$queryRaw<RawStatsRow[]>`
    SELECT
      percentile_cont(0.25) WITHIN GROUP (ORDER BY "priceEur"::float / "apartmentAreaM2"::float) AS p25,
      percentile_cont(0.50) WITHIN GROUP (ORDER BY "priceEur"::float / "apartmentAreaM2"::float) AS p50,
      percentile_cont(0.75) WITHIN GROUP (ORDER BY "priceEur"::float / "apartmentAreaM2"::float) AS p75,
      COUNT(*) AS count
    FROM "ApartmentTransaction"
    WHERE ${where}
      AND "priceEur"::float / "apartmentAreaM2"::float BETWEEN ${low} AND ${high}
  `

  const market = rows[0] ? toMarketStats(rows[0]) : null
  if (!market) return null

  return {
    market,
    renovationPremiumPct: RENOVATION_PREMIUM_PCT,
    renovationPremiumSource: 'Latvijas Banka DP 3/2025',
    currency: 'EUR/m2',
    periodFrom: periodStart.toISOString().slice(0, 10),
    periodTo: await getLatestTransactionDate(),
    filters: { city, cadastralCode, buildingYearFrom: yearFrom, buildingYearTo: yearTo, txMonths },
  }
}

// ─── Breakdown by city or wallMaterial ───────────────────────────────────────

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

  // wallMaterial comes from ApartmentTransaction directly (tg_darjumi CSV field)
  const segmentCol = groupBy === 'city'
    ? Prisma.sql`COALESCE("city", 'Unknown')`
    : Prisma.sql`COALESCE("wallMaterial", 'Unknown')`

  // Per-segment outlier bounds
  const segBounds = await prisma.$queryRaw<{ segment_label: string; low: number; high: number }[]>`
    SELECT
      ${segmentCol} AS segment_label,
      percentile_cont(0.05) WITHIN GROUP (ORDER BY "priceEur"::float / "apartmentAreaM2"::float) AS low,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY "priceEur"::float / "apartmentAreaM2"::float) AS high
    FROM "ApartmentTransaction"
    WHERE ${where}
    GROUP BY ${segmentCol}
  `
  if (segBounds.length === 0) return null

  // Percentiles on trimmed set, joined with bounds per segment
  const rows = await prisma.$queryRaw<RawBreakdownRow[]>`
    SELECT
      ${segmentCol} AS segment_label,
      percentile_cont(0.25) WITHIN GROUP (ORDER BY t."priceEur"::float / t."apartmentAreaM2"::float) AS p25,
      percentile_cont(0.50) WITHIN GROUP (ORDER BY t."priceEur"::float / t."apartmentAreaM2"::float) AS p50,
      percentile_cont(0.75) WITHIN GROUP (ORDER BY t."priceEur"::float / t."apartmentAreaM2"::float) AS p75,
      COUNT(*) AS count
    FROM "ApartmentTransaction" t
    JOIN (
      SELECT
        ${segmentCol} AS seg,
        percentile_cont(0.05) WITHIN GROUP (ORDER BY "priceEur"::float / "apartmentAreaM2"::float) AS low,
        percentile_cont(0.95) WITHIN GROUP (ORDER BY "priceEur"::float / "apartmentAreaM2"::float) AS high
      FROM "ApartmentTransaction"
      WHERE ${where}
      GROUP BY ${segmentCol}
    ) bounds ON ${segmentCol} = bounds.seg
    WHERE ${where}
      AND t."priceEur"::float / t."apartmentAreaM2"::float BETWEEN bounds.low AND bounds.high
    GROUP BY ${segmentCol}
    ORDER BY p50 DESC NULLS LAST
  `

  if (rows.length === 0) return null

  const segments = rows
    .map(r => {
      const stats = toMarketStats(r)
      return stats ? { label: r.segment_label, ...stats } : null
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)

  if (segments.length === 0) return null

  return {
    groupBy,
    segments,
    renovationPremiumPct: RENOVATION_PREMIUM_PCT,
    renovationPremiumSource: 'Latvijas Banka DP 3/2025',
    currency: 'EUR/m2',
    periodFrom: periodStart.toISOString().slice(0, 10),
    periodTo: await getLatestTransactionDate(),
    filters: { city, buildingYearFrom: yearFrom, buildingYearTo: yearTo, txMonths },
  }
}
