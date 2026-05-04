import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      createdAt: true,
      building: { select: { address: true, cadastralCode: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json(order)
}
