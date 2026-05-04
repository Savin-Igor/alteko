/**
 * Stripe Checkout integration for ReadinessReportOrder payments.
 *
 * Only called when STRIPE_SECRET_KEY is set in env.
 * Install stripe package before enabling: npm install stripe
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY   — Stripe secret key (sk_test_... or sk_live_...)
 *   NEXT_PUBLIC_BASE_URL — Base URL for success/cancel redirects
 */

export async function createStripeCheckout(
  orderId: string,
  amountEur: number,
  customerEmail: string,
  language: string
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Stripe = (await import('stripe' as any)).default
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = new (Stripe as any)(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const locale = language === 'RU' ? '/ru' : ''

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: amountEur * 100,
          product_data: {
            name: 'Gatavības atskaite / Отчёт о готовности',
            description: `ALTEKO — mājas gatavības novērtējums (${amountEur}€)`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { orderId },
    success_url: `${baseUrl}${locale}/readiness-report/order/${orderId}?status=success`,
    cancel_url: `${baseUrl}${locale}/readiness-report/order/${orderId}?status=cancelled`,
  })

  return session.url!
}

export async function handleStripeWebhook(
  rawBody: string,
  signature: string
): Promise<{ orderId: string; succeeded: boolean } | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Stripe = (await import('stripe' as any)).default
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = new (Stripe as any)(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })

  let event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return null
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { metadata?: { orderId?: string }; payment_status?: string }
    const orderId = session.metadata?.orderId
    if (!orderId) return null
    return { orderId, succeeded: session.payment_status === 'paid' }
  }

  return null
}
