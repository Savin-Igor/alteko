import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const cadastralCode = req.nextUrl.searchParams.get('cadastralCode')
  if (!cadastralCode) {
    return NextResponse.json({ error: 'cadastralCode is required' }, { status: 400 })
  }

  try {
    const building = await prisma.building.findUnique({
      where: { cadastralCode },
      select: { id: true },
    })

    if (!building) {
      return NextResponse.json({ campaign: null })
    }

    const campaign = await prisma.votingCampaign.findFirst({
      where: {
        buildingId: building.id,
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        currentYesShare: true,
        requiredThreshold: true,
        deadline: true,
      },
    })

    if (!campaign) {
      return NextResponse.json({ campaign: null })
    }

    const yesShare = Number(campaign.currentYesShare)
    const required = Number(campaign.requiredThreshold)

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        status: campaign.status,
        yesSharePct: Math.round(yesShare * 100),
        requiredPct: Math.round(required * 100),
        thresholdReached: yesShare >= required,
        deadline: campaign.deadline?.toISOString() ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
