import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({
  buildingId: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  deadline: z.string().datetime().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (user?.role !== 'ASSOCIATION_ADMIN' && user?.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Only association admins can create campaigns' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { buildingId, title, description, deadline } = parsed.data

  const building = await prisma.building.findUnique({ where: { id: buildingId } })
  if (!building) {
    return NextResponse.json({ error: 'Building not found' }, { status: 404 })
  }

  const campaign = await prisma.votingCampaign.create({
    data: {
      buildingId,
      title,
      description,
      status: 'DRAFT',
      deadline: deadline ? new Date(deadline) : null,
    },
  })

  return NextResponse.json({ campaignId: campaign.id }, { status: 201 })
}
