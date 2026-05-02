import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// Token is just the building id — not sensitive since we only show aggregated data
export async function GET(req: NextRequest) {
  const buildingId = req.nextUrl.searchParams.get('buildingId')
  if (!buildingId) {
    return NextResponse.json({ error: 'buildingId required' }, { status: 400 })
  }

  const building = await prisma.building.findUnique({
    where: { id: buildingId },
    select: { id: true, address: true },
  })
  if (!building) {
    return NextResponse.json({ error: 'Building not found' }, { status: 404 })
  }

  return NextResponse.json({ token: building.id })
}
