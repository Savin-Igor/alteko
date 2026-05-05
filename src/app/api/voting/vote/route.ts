import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

export const runtime = 'nodejs'

// ownerId is NOT accepted from the request body — it must come from the authenticated session.
// Smart-ID / eParaksts flows set a signed HttpOnly cookie at verification time; the cookie
// contains the verified ownerId and is read server-side. Until that cookie flow is wired,
// we require a valid session and use session.user.id.
const schema = z.object({
  campaignId: z.string().uuid(),
  apartmentId: z.string().uuid(),
  decision: z.enum(['YES', 'NO', 'ABSTAIN']),
  signature: z.string().min(1),
  signedAt: z.string().datetime(),
  authMethod: z.enum(['SMART_ID', 'EPARAKSTS']),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // ownerId comes from the verified session — not from the request body
  const ownerId = session.user.id
  const { campaignId, apartmentId, decision, signature, signedAt, authMethod } = parsed.data

  const campaign = await prisma.votingCampaign.findUnique({
    where: { id: campaignId },
    select: { status: true, deadline: true, requiredThreshold: true },
  })
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  if (campaign.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Campaign is not active' }, { status: 409 })
  }
  if (campaign.deadline && new Date() > campaign.deadline) {
    return NextResponse.json({ error: 'Voting deadline has passed' }, { status: 409 })
  }

  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { buildingId: true, ownershipShare: true, ownerId: true },
  })
  if (!apartment) return NextResponse.json({ error: 'Apartment not found' }, { status: 404 })

  // Verify the authenticated user owns this apartment
  if (apartment.ownerId !== ownerId) {
    return NextResponse.json({ error: 'Forbidden — not the apartment owner' }, { status: 403 })
  }

  // Snapshot ownership share at vote time — immutable
  const ownershipShare = apartment.ownershipShare

  try {
    const vote = await prisma.vote.create({
      data: {
        campaignId,
        apartmentId,
        ownerId,
        decision,
        ownershipShare,
        signature,
        signedAt: new Date(signedAt),
        authMethod,
      },
    })

    // Recalculate currentYesShare
    const allVotes = await prisma.vote.findMany({
      where: { campaignId },
      select: { decision: true, ownershipShare: true },
    })
    const totalShare = allVotes.reduce((s, v) => s + Number(v.ownershipShare), 0)
    const yesShare = allVotes
      .filter((v) => v.decision === 'YES')
      .reduce((s, v) => s + Number(v.ownershipShare), 0)
    const currentYesShare = totalShare > 0 ? yesShare / totalShare : 0

    await prisma.votingCampaign.update({
      where: { id: campaignId },
      data: {
        currentYesShare,
        ...(currentYesShare >= Number(campaign.requiredThreshold) ? { status: 'COMPLETED' } : {}),
      },
    })

    return NextResponse.json({
      voteId: vote.id,
      currentYesShare: Math.round(currentYesShare * 100),
      thresholdReached: currentYesShare >= Number(campaign.requiredThreshold),
    }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Вы уже проголосовали' }, { status: 409 })
    }
    throw err
  }
}
