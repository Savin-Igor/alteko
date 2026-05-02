import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export interface PriceBenchmarkParams {
  /** Building cadastral code — narrows to transactions for this specific building */
  cadastralCode?: string
  /** City name (Latvian), e.g. "Rīga", "Daugavpils" */
  city?: string
  /** Building construction year range */
  yearFrom?: number
  yearTo?: number
  /** Include transactions from the last N years (default: 5) */
  txYears?: number
  /** Apartment area filter */
  minArea?: number
  maxArea?: number
}

export interface PriceBenchmarkResult {
  p25: number
  p50: number
  p75: number
  count: number
  currency: 'EUR/m2'
  periodFrom: string
  periodTo: string
  filters: {
    cadastralCode?: string
    city?: string
    buildingYearFrom?: number
    buildingYearTo?: number
    txYears: number
  }
}

const MIN_TRANSACTIONS = 5

type OutlierRow = { low: number | null; high: number | null }
type BenchmarkRow = { p25: number | null; p50: number | null; p75: number | null; count: bigint }

export async function getPriceBenchmark(
  params: PriceBenchmarkParams,
): Promise<PriceBenchmarkResult | null> {
  const {
    cadastralCode,
    city,
    yearFrom,
    yearTo,
    txYears = 5,
    minArea,
    maxArea,
  } = params

  const periodStart = new Date()
  periodStart.setFullYear(periodStart.getFullYear() - txYears)

  // All values bound as Prisma parameters — no SQL injection risk.
  // Nullable checks: (NULL::type IS NULL OR col = NULL) always passes when param is null,
  // effectively making each filter optional.
  const baseSubquery = Prisma.sql`
    SELECT "priceEur"::float / "apartmentAreaM2"::float AS price_per_m2
    FROM "ApartmentTransaction"
    WHERE
      "apartmentAreaM2" > 10
      AND "priceEur" > 500
      AND "transactionDate" >= ${periodStart}
      AND (${cadastralCode ?? null}::text IS NULL OR "buildingCadNr" = ${cadastralCode ?? null})
      AND (${city ?? null}::text IS NULL OR "city" = ${city ?? null})
      AND (${yearFrom ?? null}::int IS NULL OR "buildingYear" >= ${yearFrom ?? null})
      AND (${yearTo ?? null}::int IS NULL OR "buildingYear" <= ${yearTo ?? null})
      AND (${minArea ?? null}::float IS NULL OR "apartmentAreaM2" >= ${minArea ?? null})
      AND (${maxArea ?? null}::float IS NULL OR "apartmentAreaM2" <= ${maxArea ?? null})
  `

  // Pass 1: compute p5/p95 for outlier trimming
  const outliers = await prisma.$queryRaw<OutlierRow[]>`
    SELECT
      percentile_cont(0.05) WITHIN GROUP (ORDER BY price_per_m2) AS low,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY price_per_m2) AS high
    FROM (${baseSubquery}) base
  `

  const { low, high } = outliers[0] ?? {}
  if (low == null || high == null) return null

  // Pass 2: percentiles on trimmed set
  const rows = await prisma.$queryRaw<BenchmarkRow[]>`
    SELECT
      percentile_cont(0.25) WITHIN GROUP (ORDER BY price_per_m2) AS p25,
      percentile_cont(0.50) WITHIN GROUP (ORDER BY price_per_m2) AS p50,
      percentile_cont(0.75) WITHIN GROUP (ORDER BY price_per_m2) AS p75,
      COUNT(*) AS count
    FROM (${baseSubquery}) base
    WHERE price_per_m2 BETWEEN ${low} AND ${high}
  `

  const row = rows[0]
  if (!row || row.p50 == null) return null

  const count = Number(row.count)
  if (count < MIN_TRANSACTIONS) return null

  const latest = await prisma.apartmentTransaction.findFirst({
    orderBy: { transactionDate: 'desc' },
    select: { transactionDate: true },
  })

  return {
    p25:      Math.round(row.p25!),
    p50:      Math.round(row.p50),
    p75:      Math.round(row.p75!),
    count,
    currency: 'EUR/m2',
    periodFrom: periodStart.toISOString().slice(0, 10),
    periodTo:   (latest?.transactionDate ?? new Date()).toISOString().slice(0, 10),
    filters: {
      cadastralCode,
      city,
      buildingYearFrom: yearFrom,
      buildingYearTo:   yearTo,
      txYears,
    },
  }
}
