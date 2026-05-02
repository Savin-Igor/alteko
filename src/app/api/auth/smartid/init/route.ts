import { NextRequest, NextResponse } from 'next/server'
import { initiateSmartIdSession } from '@/lib/auth/smartid'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({
  personalCode: z.string().min(5).max(20),
  countryCode: z.string().length(2).default('LV'),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  try {
    const session = await initiateSmartIdSession(
      parsed.data.personalCode,
      parsed.data.countryCode,
    )
    return NextResponse.json(session)
  } catch (err) {
    console.error('Smart-ID init error:', err)
    return NextResponse.json(
      { error: 'Smart-ID временно недоступен. Попробуйте eParaksts или повторите через несколько минут.' },
      { status: 503 },
    )
  }
}
