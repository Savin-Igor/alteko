import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateBisExportManifest } from '@/lib/decisions/campaigns'

export const runtime = 'nodejs'

const ALLOWED_ROLES = ['BOARD_MEMBER', 'ASSOCIATION_ADMIN', 'PLATFORM_ADMIN']

interface RouteParams {
  params: Promise<{ buildingId: string; campaignId: string }>
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { campaignId } = await params
  const manifest = await generateBisExportManifest(campaignId)

  return NextResponse.json(manifest)
}
