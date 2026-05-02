import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const campaignId = req.nextUrl.searchParams.get('campaignId')
  if (!campaignId) {
    return NextResponse.json({ error: 'campaignId required' }, { status: 400 })
  }

  const campaign = await prisma.votingCampaign.findUnique({
    where: { id: campaignId },
    select: {
      id: true,
      title: true,
      status: true,
      requiredThreshold: true,
      currentYesShare: true,
      deadline: true,
      building: { select: { address: true, apartmentCount: true } },
    },
  })
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

  const votes = await prisma.vote.groupBy({
    by: ['decision'],
    where: { campaignId },
    _count: { decision: true },
    _sum: { ownershipShare: true },
  })

  const voteCounts = { YES: 0, NO: 0, ABSTAIN: 0 }
  const voteShares = { YES: 0, NO: 0, ABSTAIN: 0 }
  let totalVoted = 0

  for (const v of votes) {
    voteCounts[v.decision] = v._count.decision
    voteShares[v.decision] = Number(v._sum.ownershipShare ?? 0)
    totalVoted += v._count.decision
  }

  return NextResponse.json({
    campaignId,
    title: campaign.title,
    status: campaign.status,
    building: campaign.building,
    requiredThreshold: Number(campaign.requiredThreshold),
    currentYesShare: Number(campaign.currentYesShare),
    deadline: campaign.deadline?.toISOString() ?? null,
    votes: { counts: voteCounts, shares: voteShares },
    totalVoted,
    thresholdReached: Number(campaign.currentYesShare) >= Number(campaign.requiredThreshold),
  })
}
