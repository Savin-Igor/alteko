import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { performRiskCheck } from '@/lib/tenders/risk-check'

export const runtime = 'nodejs'

const schema = z.object({
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

  const ALLOWED = ['BOARD_MEMBER', 'ASSOCIATION_ADMIN', 'PROFESSIONAL', 'PLATFORM_ADMIN']
  if (!user || !ALLOWED.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const result = await performRiskCheck(parsed.data.contractorId)
  return NextResponse.json(result)
}
