import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({
  projectId: z.string().uuid(),
  contractorId: z.string().uuid(),
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
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { projectId, contractorId } = parsed.data

  const project = await prisma.renovationProject.findUnique({
    where: { id: projectId },
    select: { status: true, contractValue: true },
  })
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  // v2: no success fee. See docs/business/monetization.md.
  const updated = await prisma.renovationProject.update({
    where: { id: projectId },
    data: {
      contractorId,
      status: 'CONTRACTED',
    },
  })

  return NextResponse.json({
    projectId,
    contractorId,
    status: updated.status,
  })
}
