/**
 * POST /api/readiness-report
 *
 * Creates a ReadinessReportOrder. Payment is processed separately:
 * - paymentStatus starts as "pending"
 * - Stripe Checkout URL is returned when STRIPE_SECRET_KEY is configured
 * - Without Stripe: returns order ID and manual contact instructions
 *
 * Price tiers (from monetization.md):
 *   < 30 apartments: €300
 *   30-60 apartments: €600
 *   > 60 apartments: €900
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({
  cadastralCode: z.string().min(10),
  email: z.string().email(),
  language: z.enum(['LV', 'RU']).default('LV'),
})

function calculatePrice(apartmentCount: number | null): number {
  if (!apartmentCount || apartmentCount < 30) return 300
  if (apartmentCount <= 60) return 600
  return 900
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { cadastralCode, email, language } = parsed.data

  const building = await prisma.building.findUnique({
    where: { cadastralCode },
    select: { id: true, apartmentCount: true },
  })
  if (!building) {
    return NextResponse.json({ error: 'Building not found' }, { status: 404 })
  }

  const amountEur = calculatePrice(building.apartmentCount)

  const order = await prisma.readinessReportOrder.create({
    data: {
      buildingId: building.id,
      orderedByEmail: email,
      amountEur,
      language: language as 'LV' | 'RU',
      paymentStatus: 'pending',
    },
  })

  // Stripe Checkout — available when STRIPE_SECRET_KEY is configured
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (stripeKey) {
    try {
      const { createStripeCheckout } = await import('@/lib/payments/stripe')
      const checkoutUrl = await createStripeCheckout(order.id, amountEur, email, language)
      return NextResponse.json({ orderId: order.id, amountEur, checkoutUrl })
    } catch {
      // Fall through to manual flow if Stripe fails
    }
  }

  // Manual flow: mark as awaiting payment confirmation
  return NextResponse.json({
    orderId: order.id,
    amountEur,
    checkoutUrl: null,
    message: 'Order created. Payment instructions will be sent to your email.',
  })
}
