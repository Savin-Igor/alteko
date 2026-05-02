import { NextRequest, NextResponse } from 'next/server'
import { compareWithBenchmark } from '@/lib/benchmarks/compare'
import { detectAnomalies } from '@/lib/benchmarks/anomaly'
import { IS_STUB, STUB_BENCHMARK } from '@/lib/stubs'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const reportId = req.nextUrl.searchParams.get('reportId')
  if (!reportId) return NextResponse.json({ error: 'reportId required' }, { status: 400 })

  const [benchmark, anomalies] = await Promise.all([
    compareWithBenchmark(reportId),
    detectAnomalies('', reportId),
  ])

  // Fallback to stub when real data has insufficient buildings (< 10)
  const result = benchmark ?? (IS_STUB ? STUB_BENCHMARK : null)

  if (!result) {
    return NextResponse.json({ error: 'Report not found or not processed' }, { status: 404 })
  }

  return NextResponse.json({ benchmark: result, anomalies })
}
