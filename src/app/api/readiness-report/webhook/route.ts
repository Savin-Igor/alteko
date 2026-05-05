/**
 * POST /api/readiness-report/webhook
 *
 * Stripe webhook handler for payment confirmation.
 * Requires STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in env.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const rawBody = await req.text()

  const { handleStripeWebhook } = await import('@/lib/payments/stripe')
  const result = await handleStripeWebhook(rawBody, signature)

  if (!result) {
    return NextResponse.json({ received: true })
  }

  if (result.succeeded) {
    await prisma.readinessReportOrder.update({
      where: { id: result.orderId },
      data: {
        paymentStatus: 'succeeded',
        paidAt: new Date(),
        paymentProviderRef: result.orderId,
      },
    })
  }

  return NextResponse.json({ received: true })
}
