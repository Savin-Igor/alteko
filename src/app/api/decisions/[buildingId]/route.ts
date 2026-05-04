import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  createDecisionCampaign,
  getCampaignsByBuilding,
} from '@/lib/decisions/campaigns'
import { DecisionType } from '@prisma/client'

export const runtime = 'nodejs'

const ALLOWED_ROLES = ['BOARD_MEMBER', 'ASSOCIATION_ADMIN', 'PLATFORM_ADMIN']

interface RouteParams {
  params: Promise<{ buildingId: string }>
}

const createSchema = z.object({
  decisionType: z.nativeEnum(DecisionType),
  title: z.string().min(3).max(200),
  questionTextLv: z.string().min(10).max(1000),
  questionTextRu: z.string().max(1000).optional(),
  explanationTextLv: z.string().min(10).max(2000),
  explanationTextRu: z.string().max(2000).optional(),
  deadline: z.string().datetime().optional(),
})

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { buildingId } = await params
  const campaigns = await getCampaignsByBuilding(buildingId)
  return NextResponse.json({ buildingId, campaigns })
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
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { buildingId } = await params
  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const campaign = await createDecisionCampaign({
    buildingId,
    ...parsed.data,
    deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : undefined,
  })

  return NextResponse.json(campaign, { status: 201 })
}
