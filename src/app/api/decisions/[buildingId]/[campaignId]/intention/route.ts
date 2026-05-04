import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { recordIntention } from '@/lib/decisions/campaigns'

export const runtime = 'nodejs'

const schema = z.object({
  decision: z.enum(['YES', 'NO', 'ABSTAIN']),
})

interface RouteParams {
  params: Promise<{ buildingId: string; campaignId: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { campaignId } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  try {
    const campaign = await recordIntention({ campaignId, decision: parsed.data.decision })
    return NextResponse.json(campaign)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 409 }
    )
  }
}
