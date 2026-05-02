import { NextRequest, NextResponse } from 'next/server'
import { compareWithBenchmark } from '@/lib/benchmarks/compare'
import { detectAnomalies } from '@/lib/benchmarks/anomaly'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const reportId = req.nextUrl.searchParams.get('reportId')
  if (!reportId) {
    return NextResponse.json({ error: 'reportId required' }, { status: 400 })
  }

  const [benchmark, anomalies] = await Promise.all([
    compareWithBenchmark(reportId),
    detectAnomalies('', reportId), // buildingId resolved inside
  ])

  if (!benchmark) {
    return NextResponse.json({ error: 'Report not found or not processed' }, { status: 404 })
  }

  return NextResponse.json({ benchmark, anomalies })
}
