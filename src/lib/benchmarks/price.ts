import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export interface PriceBenchmarkParams {
  city?: string
  cadastralCode?: string
  yearFrom?: number
  yearTo?: number
  txYears?: number
  minArea?: number
  maxArea?: number
}

interface GroupStats {
  p25: number
  p50: number
  p75: number
  count: number
}

export interface PriceBenchmarkResult {
  /** Apartments in buildings with energy class A or B (renovated) */
  renovated: GroupStats | null
  /** Apartments in buildings with energy class C–G (not renovated) */
  notRenovated: GroupStats | null
  /** (renovated.p50 / notRenovated.p50 - 1) × 100, rounded */
  premiumPct: number | null
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
  /** True when one or both groups had too few transactions (<5) */
  lowDataWarning: boolean
}

const MIN_TRANSACTIONS = 5

type RawRow = {
  group: string
  p25: number | null
  p50: number | null
  p75: number | null
  count: bigint
}

export async function getPriceBenchmark(
  params: PriceBenchmarkParams,
): Promise<PriceBenchmarkResult | null> {
  const { city, cadastralCode, yearFrom, yearTo, txYears = 5, minArea, maxArea } = params

  const periodStart = new Date()
  periodStart.setFullYear(periodStart.getFullYear() - txYears)

  // Base subquery: JOIN ApartmentTransaction with Building to get energyClass.
  // energyClass is the key: A/B = renovated, C–G = not renovated.
  // Only transactions where the building has a known energyClass are included —
  // this is the correct comparison (apples to apples, same filters, different class).
  const baseSubquery = Prisma.sql`
    SELECT
      CASE
        WHEN b."energyClass" IN ('A', 'B') THEN 'renovated'
        ELSE 'not_renovated'
      END AS grp,
      t."priceEur"::float / t."apartmentAreaM2"::float AS price_per_m2
    FROM "ApartmentTransaction" t
    JOIN "Building" b ON b."cadastralCode" = t."buildingCadNr"
    WHERE
      t."apartmentAreaM2" > 10
      AND t."priceEur" > 500
      AND t."transactionDate" >= ${periodStart}
      AND b."energyClass" IS NOT NULL
      AND (${city ?? null}::text        IS NULL OR t."city"         = ${city ?? null})
      AND (${cadastralCode ?? null}::text IS NULL OR t."buildingCadNr" = ${cadastralCode ?? null})
      AND (${yearFrom ?? null}::int     IS NULL OR t."buildingYear" >= ${yearFrom ?? null})
      AND (${yearTo ?? null}::int       IS NULL OR t."buildingYear" <= ${yearTo ?? null})
      AND (${minArea ?? null}::float    IS NULL OR t."apartmentAreaM2" >= ${minArea ?? null})
      AND (${maxArea ?? null}::float    IS NULL OR t."apartmentAreaM2" <= ${maxArea ?? null})
  `

  // Pass 1: outlier bounds (p5/p95) across both groups combined
  const outliers = await prisma.$queryRaw<{ low: number | null; high: number | null }[]>`
    SELECT
      percentile_cont(0.05) WITHIN GROUP (ORDER BY price_per_m2) AS low,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY price_per_m2) AS high
    FROM (${baseSubquery}) base
  `

  const { low, high } = outliers[0] ?? {}
  if (low == null || high == null) return null

  // Pass 2: p25/p50/p75 per group on trimmed set
  const rows = await prisma.$queryRaw<RawRow[]>`
    SELECT
      grp AS group,
      percentile_cont(0.25) WITHIN GROUP (ORDER BY price_per_m2) AS p25,
      percentile_cont(0.50) WITHIN GROUP (ORDER BY price_per_m2) AS p50,
      percentile_cont(0.75) WITHIN GROUP (ORDER BY price_per_m2) AS p75,
      COUNT(*) AS count
    FROM (${baseSubquery}) base
    WHERE price_per_m2 BETWEEN ${low} AND ${high}
    GROUP BY grp
  `

  if (rows.length === 0) return null

  const toStats = (row: RawRow): GroupStats | null => {
    const count = Number(row.count)
    if (count < MIN_TRANSACTIONS || row.p50 == null) return null
    return {
      p25:   Math.round(row.p25!),
      p50:   Math.round(row.p50),
      p75:   Math.round(row.p75!),
      count,
    }
  }

  const renovatedRow    = rows.find(r => r.group === 'renovated')
  const notRenovatedRow = rows.find(r => r.group === 'not_renovated')

  const renovated    = renovatedRow    ? toStats(renovatedRow)    : null
  const notRenovated = notRenovatedRow ? toStats(notRenovatedRow) : null

  // Need at least one group with data
  if (!renovated && !notRenovated) return null

  const premiumPct =
    renovated && notRenovated
      ? Math.round((renovated.p50 / notRenovated.p50 - 1) * 100)
      : null

  const latest = await prisma.apartmentTransaction.findFirst({
    orderBy: { transactionDate: 'desc' },
    select: { transactionDate: true },
  })

  return {
    renovated,
    notRenovated,
    premiumPct,
    currency: 'EUR/m2',
    periodFrom: periodStart.toISOString().slice(0, 10),
    periodTo:   (latest?.transactionDate ?? new Date()).toISOString().slice(0, 10),
    filters: { city, cadastralCode, buildingYearFrom: yearFrom, buildingYearTo: yearTo, txYears },
    lowDataWarning: !renovated || !notRenovated,
  }
}
