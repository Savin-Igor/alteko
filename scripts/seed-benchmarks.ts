import { prisma } from '../src/lib/prisma'
import type { ExpenseCategory } from '@prisma/client'

// Computes P25/P50/P75 from existing ExpenseItems and upserts BenchmarkSegment records.
// Run after importing a batch of expense reports.

function getAreaRange(totalAreaM2: number | null): string {
  if (!totalAreaM2) return 'MEDIUM'
  if (totalAreaM2 < 2000) return 'SMALL'
  if (totalAreaM2 <= 5000) return 'MEDIUM'
  return 'LARGE'
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(idx)
  const upper = Math.ceil(idx)
  if (lower === upper) return sorted[lower]!
  return sorted[lower]! + (sorted[upper]! - sorted[lower]!) * (idx - lower)
}

interface SegmentAccumulator {
  series: string
  district: string
  areaRange: string
  category: ExpenseCategory
  periodYear: number
  periodMonth: number
  values: number[]
}

async function seedBenchmarks() {
  console.log('Computing benchmark segments...')

  const reports = await prisma.expenseReport.findMany({
    where: { status: 'PROCESSED' },
    include: {
      building: { select: { series: true, district: true, totalAreaM2: true } },
      items: { select: { category: true, amountPerM2: true } },
    },
  })

  const segments = new Map<string, SegmentAccumulator>()

  for (const report of reports) {
    const { building, items, periodYear, periodMonth } = report
    if (!building.series || !building.district) continue
    const areaRange = getAreaRange(Number(building.totalAreaM2))

    for (const item of items) {
      const key = `${building.series}|${building.district}|${areaRange}|${item.category}|${periodYear}|${periodMonth}`
      const existing = segments.get(key)
      if (existing) {
        existing.values.push(Number(item.amountPerM2))
      } else {
        segments.set(key, {
          series: building.series,
          district: building.district,
          areaRange,
          category: item.category,
          periodYear,
          periodMonth,
          values: [Number(item.amountPerM2)],
        })
      }
    }
  }

  let upserted = 0
  for (const seg of Array.from(segments.values())) {
    const sorted = [...seg.values].sort((a, b) => a - b)
    await prisma.benchmarkSegment.upsert({
      where: {
        series_district_areaRange_category_periodYear_periodMonth: {
          series: seg.series,
          district: seg.district,
          areaRange: seg.areaRange,
          category: seg.category,
          periodYear: seg.periodYear,
          periodMonth: seg.periodMonth,
        },
      },
      create: {
        series: seg.series,
        district: seg.district,
        areaRange: seg.areaRange,
        category: seg.category,
        periodYear: seg.periodYear,
        periodMonth: seg.periodMonth,
        buildingCount: seg.values.length,
        p25: percentile(sorted, 25),
        p50: percentile(sorted, 50),
        p75: percentile(sorted, 75),
      },
      update: {
        buildingCount: seg.values.length,
        p25: percentile(sorted, 25),
        p50: percentile(sorted, 50),
        p75: percentile(sorted, 75),
        computedAt: new Date(),
      },
    })
    upserted++
  }

  console.log(`Seeded ${upserted} benchmark segments.`)
  await prisma.$disconnect()
}

seedBenchmarks().catch((e) => {
  console.error(e)
  process.exit(1)
})
