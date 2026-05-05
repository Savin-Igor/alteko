/**
 * GET /api/readiness-report/[orderId]/download
 *
 * Returns a 302 redirect to a time-limited S3 presigned URL for the report PDF.
 * No authentication required — the UUID orderId provides sufficient security.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPresignedDownloadUrl } from '@/lib/s3'

export const runtime = 'nodejs'

interface RouteParams {
  params: Promise<{ orderId: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { orderId } = await params

  const order = await prisma.readinessReportOrder.findUnique({
    where: { id: orderId },
    select: { reportFileKey: true, paymentStatus: true },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (order.paymentStatus !== 'succeeded') {
    return NextResponse.json({ error: 'Report not available — payment not confirmed' }, { status: 402 })
  }
  if (!order.reportFileKey) {
    return NextResponse.json({ error: 'Report is being prepared — please check back later' }, { status: 202 })
  }

  const url = await getPresignedDownloadUrl(order.reportFileKey, 3600)
  return NextResponse.redirect(url, 302)
}
