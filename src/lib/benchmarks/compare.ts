import { prisma } from '@/lib/prisma'
import type { ExpenseCategory } from '@prisma/client'

export interface CategoryBenchmark {
  category: ExpenseCategory
  value: number
  p25: number
  p50: number
  p75: number
  deviationPct: number
  buildingCount: number
  hasEnoughData: boolean
}

export interface BenchmarkResult {
  overallDeviationPct: number
  categories: CategoryBenchmark[]
  segmentInfo: {
    series: string | null
    district: string | null
    areaRange: string
    periodYear: number
    periodMonth: number
  }
}

const MIN_BUILDINGS_FOR_BENCHMARK = 10

function getAreaRange(totalAreaM2: number | null): string {
  if (!totalAreaM2) return 'MEDIUM'
  if (totalAreaM2 < 2000) return 'SMALL'
  if (totalAreaM2 <= 5000) return 'MEDIUM'
  return 'LARGE'
}

export async function compareWithBenchmark(
  reportId: string,
): Promise<BenchmarkResult | null> {
  const report = await prisma.expenseReport.findUnique({
    where: { id: reportId },
    include: {
      building: true,
      items: true,
    },
  })

  if (!report || report.items.length === 0) return null

  const { building, items, periodYear, periodMonth } = report
  const areaRange = getAreaRange(Number(building.totalAreaM2))

  const categories = items.map((item) => item.category) as ExpenseCategory[]
  const segments = await prisma.benchmarkSegment.findMany({
    where: {
      series: building.series ?? '',
      district: building.district ?? '',
      areaRange,
      category: { in: categories },
      periodYear,
      periodMonth,
    },
  })

  const segmentByCategory = new Map(segments.map((s) => [s.category, s]))

  const categoryResults: CategoryBenchmark[] = items.map((item) => {
    const seg = segmentByCategory.get(item.category as ExpenseCategory)
    const value = Number(item.amountPerM2)
    const p50 = seg ? Number(seg.p50) : 0
    const deviationPct = p50 > 0 ? ((value - p50) / p50) * 100 : 0

    return {
      category: item.category as ExpenseCategory,
      value,
      p25: seg ? Number(seg.p25) : 0,
      p50,
      p75: seg ? Number(seg.p75) : 0,
      deviationPct: Math.round(deviationPct),
      buildingCount: seg?.buildingCount ?? 0,
      hasEnoughData: (seg?.buildingCount ?? 0) >= MIN_BUILDINGS_FOR_BENCHMARK,
    }
  })

  const heatingItem = categoryResults.find((c) => c.category === 'HEATING')
  const overallDeviationPct = heatingItem
    ? heatingItem.deviationPct
    : categoryResults.length > 0
      ? Math.round(
          categoryResults.reduce((sum, c) => sum + c.deviationPct, 0) / categoryResults.length,
        )
      : 0

  return {
    overallDeviationPct,
    categories: categoryResults,
    segmentInfo: {
      series: building.series,
      district: building.district,
      areaRange,
      periodYear,
      periodMonth,
    },
  }
}
