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
    select: {
      id: true,
      paymentStatus: true,
      amountEur: true,
      language: true,
      reportFileKey: true,
      emailSentAt: true,
      orderedByEmail: true,
      createdAt: true,
      building: {
        select: {
          address: true,
          cadastralCode: true,
          energyClass: true,
          constructionYear: true,
          series: true,
        },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const downloadUrl = order.reportFileKey
    ? await getPresignedDownloadUrl(order.reportFileKey, 3600)
    : null

  return NextResponse.json({ ...order, downloadUrl })
}
