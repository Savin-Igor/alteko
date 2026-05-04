import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({
  projectId: z.string().uuid(),
  priceEur: z.number().positive(),
  timelineWeeks: z.number().int().positive(),
  conditions: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contractor = await prisma.contractor.findUnique({
    where: { userId: session.user.id, active: true },
    select: { id: true, luroftVerified: true },
  })
  if (!contractor) {
    return NextResponse.json({ error: 'Active contractor account required' }, { status: 403 })
  }
  if (!contractor.luroftVerified) {
    return NextResponse.json({ error: 'Lursoft verification required before bidding' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { projectId, priceEur, timelineWeeks, conditions } = parsed.data

  const project = await prisma.renovationProject.findUnique({
    where: { id: projectId },
    select: { status: true, building: { select: { address: true } } },
  })
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  if (project.status !== 'VOTING' && project.status !== 'INITIATED') {
    return NextResponse.json({ error: 'Project is not accepting bids' }, { status: 409 })
  }

  // v2 (Readiness Platform): no success fee from contractor.
  // Contractors pay a fixed subscription (Basic / Plus). The 1.5% commission
  // hardcode was removed because it created a conflict of interest with
  // ALTUM supplier-selection rules. See docs/business/monetization.md.
  // RenovationProject.commissionAmount column will be dropped in Sprint 2.
  await prisma.renovationProject.update({
    where: { id: projectId },
    data: {
      contractValue: priceEur,
      contractorId: contractor.id,
    },
  })

  return NextResponse.json({
    projectId,
    priceEur,
    timelineWeeks,
    conditions,
    contractorId: contractor.id,
  }, { status: 201 })
}
