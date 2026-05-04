/**
 * Heating benchmark comparison by building series.
 * Uses BuildingSeriesBenchmark table (seeded from verified research data).
 */

import { prisma } from '@/lib/prisma'

export interface HeatingBenchmarkResult {
  seriesCode: string
  normKwhM2Year: number
  actualKwhM2Year: number | null
  deviationPct: number | null
  isFallback: boolean
  sourceDescription: string
}

export async function getHeatingBenchmark(
  series: string | null,
  actualKwhM2Year: number | null
): Promise<HeatingBenchmarkResult | null> {
  const lookup = series ?? 'NATIONAL_AVERAGE'

  let benchmark = await prisma.buildingSeriesBenchmark.findUnique({
    where: { seriesCode: lookup },
  })

  const isFallback = !series || !benchmark

  if (!benchmark) {
    benchmark = await prisma.buildingSeriesBenchmark.findUnique({
      where: { seriesCode: 'NATIONAL_AVERAGE' },
    })
  }

  if (!benchmark) return null

  const norm = Number(benchmark.heatingKwhM2Year)
  const deviation =
    actualKwhM2Year !== null
      ? Math.round(((actualKwhM2Year - norm) / norm) * 100)
      : null

  return {
    seriesCode: benchmark.seriesCode,
    normKwhM2Year: norm,
    actualKwhM2Year,
    deviationPct: deviation,
    isFallback,
    sourceDescription: benchmark.sourceDescription,
  }
}

export function deviationBadgeClass(deviationPct: number | null): string {
  if (deviationPct === null) return 'text-gray-500'
  if (deviationPct > 20) return 'text-danger'
  if (deviationPct > 5) return 'text-warning'
  return 'text-success'
}
