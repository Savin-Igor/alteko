import { prisma } from '@/lib/prisma'
import type { ExpenseCategory } from '@prisma/client'

export interface Anomaly {
  category: ExpenseCategory
  type: 'TREND_INCREASE' | 'SPIKE' | 'ABOVE_P75'
  description: string
  deviationPct: number
}

export async function detectAnomalies(
  buildingId: string,
  currentReportId: string,
): Promise<Anomaly[]> {
  const current = await prisma.expenseReport.findUnique({
    where: { id: currentReportId },
    include: { items: true },
  })
  if (!current) return []

  // Load last 3 reports for trend detection
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

  for (const currentItem of current.items) {
    const category = currentItem.category as ExpenseCategory
    const currentVal = Number(currentItem.amountPerM2)

    // Collect historical values for this category
    const history = recentReports
      .map((r) => {
        const item = r.items.find((i) => i.category === category)
        return item ? Number(item.amountPerM2) : null
      })
      .filter((v): v is number => v !== null)

    if (history.length >= 2) {
      // Trend: consistently increasing over last 3 periods
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

  return anomalies
}
