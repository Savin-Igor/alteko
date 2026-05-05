/**
 * Issue #114 — Board data verification endpoint.
 *
 * Allows board members (BOARD_MEMBER, ASSOCIATION_ADMIN) to mark a building's
 * data as board-verified, upgrading DataConfidence from USER_UPLOADED to
 * BOARD_VERIFIED. Professionals (PROFESSIONAL, PLATFORM_ADMIN) can set
 * professionalVerified.
 *
 * After verification, the caller should trigger a readiness score recalculation
 * via POST /api/readiness/:cadastralCode/recalculate.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const runtime = 'nodejs'

const BOARD_ROLES = ['BOARD_MEMBER', 'ASSOCIATION_ADMIN']
const PROFESSIONAL_ROLES = ['PROFESSIONAL', 'PLATFORM_ADMIN']

const schema = z.object({
  level: z.enum(['board', 'professional']),
})

interface RouteParams {
  params: Promise<{ cadastralCode: string }>
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
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { level } = parsed.data
  const { cadastralCode } = await params

  if (level === 'board' && !BOARD_ROLES.includes(user.role)) {
    return NextResponse.json(
      { error: 'Board verification requires BOARD_MEMBER or ASSOCIATION_ADMIN role' },
      { status: 403 }
    )
  }
  if (level === 'professional' && !PROFESSIONAL_ROLES.includes(user.role)) {
    return NextResponse.json(
      { error: 'Professional verification requires PROFESSIONAL or PLATFORM_ADMIN role' },
      { status: 403 }
    )
  }

  const building = await prisma.building.findUnique({
    where: { cadastralCode },
    select: { id: true },
  })
  if (!building) {
    return NextResponse.json({ error: 'Building not found' }, { status: 404 })
  }

  const updateData =
    level === 'professional'
      ? { professionalVerified: true, boardVerified: true }
      : { boardVerified: true }

  await prisma.building.update({
    where: { id: building.id },
    data: updateData,
  })

  return NextResponse.json({
    cadastralCode,
    level,
    message: 'Data verified. Trigger readiness recalculation to update the score.',
  })
}
