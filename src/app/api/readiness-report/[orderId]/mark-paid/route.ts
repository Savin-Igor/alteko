/**
 * POST /api/readiness-report/[orderId]/mark-paid
 *
 * Admin endpoint: confirm manual bank transfer payment and trigger PDF generation.
 * Requires PLATFORM_ADMIN role.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateAndDeliverReport } from '@/lib/readiness-report/generate-and-deliver'

export const runtime = 'nodejs'

const schema = z.object({
  note: z.string().max(500).optional(),
})

interface RouteParams {
  params: Promise<{ orderId: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (user?.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Forbidden — PLATFORM_ADMIN role required' }, { status: 403 })
  }

  const { orderId } = await params

  const order = await prisma.readinessReportOrder.findUnique({
    where: { id: orderId },
    select: { id: true, paymentStatus: true, orderedByEmail: true, amountEur: true },
  })
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (order.paymentStatus === 'succeeded') {
    return NextResponse.json({ error: 'Order is already marked as paid' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  schema.safeParse(body)

  await prisma.readinessReportOrder.update({
    where: { id: orderId },
    data: { paymentStatus: 'succeeded', paidAt: new Date() },
  })

  await generateAndDeliverReport(orderId)

  return NextResponse.json({
    orderId,
    paymentStatus: 'succeeded',
    paidAt: new Date().toISOString(),
  })
}
