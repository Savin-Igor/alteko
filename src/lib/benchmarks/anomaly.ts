import { prisma } from '@/lib/prisma'
import type { ExpenseCategory } from '@prisma/client'

export interface Anomaly {
  category: ExpenseCategory
  type: 'TREND_INCREASE' | 'SPIKE' | 'ABOVE_P75'
  description: string
  deviationPct: number
}

function getAreaRange(totalAreaM2: number | null): string {
  if (!totalAreaM2) return 'MEDIUM'
  if (totalAreaM2 < 2000) return 'SMALL'
  if (totalAreaM2 <= 5000) return 'MEDIUM'
  return 'LARGE'
}

export async function detectAnomalies(
  buildingId: string,
  currentReportId: string,
): Promise<Anomaly[]> {
  const current = await prisma.expenseReport.findUnique({
    where: { id: currentReportId },
    include: {
      items: true,
      building: { select: { series: true, district: true, totalAreaM2: true } },
    },
  })
  if (!current) return []

  // Load last 3 reports for time-series trend detection
  const recentReports = await prisma.expenseReport.findMany({
    where: {
      buildingId,
      status: 'PROCESSED',
      id: { not: currentReportId },
    },
    orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    take: 3,
    include: { items: true },
  })

  const anomalies: Anomaly[] = []

  // ── Time-series anomaly detection (within-building trends) ──────────────────
  for (const currentItem of current.items) {
    const category = currentItem.category as ExpenseCategory
    const currentVal = Number(currentItem.amountPerM2)

    const history = recentReports
      .map((r) => {
        const item = r.items.find((i) => i.category === category)
        return item ? Number(item.amountPerM2) : null
      })
      .filter((v): v is number => v !== null)

    if (history.length >= 2) {
      // Trend: consistently increasing over 3+ consecutive periods
      const allIncreasing = history.every((v, i) => {
        if (i === 0) return currentVal > v
        return history[i - 1]! > v
      })

      if (allIncreasing && history[0]) {
        const oldest = history[history.length - 1]!
        const trend = ((currentVal - oldest) / oldest) * 100
        if (trend > 15) {
          anomalies.push({
            category,
            type: 'TREND_INCREASE',
            description: `Расходы растут ${history.length + 1} периода подряд (+${Math.round(trend)}%)`,
            deviationPct: Math.round(trend),
          })
        }
      }
    }

    if (history.length >= 1) {
      const prev = history[0]!
      const spike = ((currentVal - prev) / prev) * 100
      if (spike > 30) {
        anomalies.push({
          category,
          type: 'SPIKE',
          description: `Резкий рост по сравнению с прошлым периодом (+${Math.round(spike)}%)`,
          deviationPct: Math.round(spike),
        })
      }
    }
  }

  // ── Cross-building anomaly detection: compare against segment P75 ───────────
  // Only runs when the building belongs to a known series and district
  // with sufficient benchmark data (≥10 buildings in segment).
  const building = current.building
  if (building?.series && building?.district) {
    const areaRange = getAreaRange(Number(building.totalAreaM2))
    const flaggedCategories = new Set(anomalies.map((a) => a.category))

    const segments = await prisma.benchmarkSegment.findMany({
      where: {
        series: building.series,
        district: building.district,
        areaRange,
        periodYear: current.periodYear,
        periodMonth: current.periodMonth,
        buildingCount: { gte: 10 },
      },
    })

    const segmentByCategory = new Map(segments.map((s) => [s.category, s]))

    for (const currentItem of current.items) {
      const category = currentItem.category as ExpenseCategory
      // Skip categories already flagged by time-series checks
      if (flaggedCategories.has(category)) continue

      const seg = segmentByCategory.get(category)
      if (!seg) continue

      const currentVal = Number(currentItem.amountPerM2)
      const p75 = Number(seg.p75)
      if (p75 > 0 && currentVal > p75) {
        const deviation = ((currentVal - p75) / p75) * 100
        anomalies.push({
          category,
          type: 'ABOVE_P75',
          description: `Выше верхнего квартиля похожих домов (+${Math.round(deviation)}%)`,
          deviationPct: Math.round(deviation),
        })
      }
    }
  }

  return anomalies
}
