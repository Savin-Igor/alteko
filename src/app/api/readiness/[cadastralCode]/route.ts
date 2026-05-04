import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

interface RouteParams {
  params: Promise<{ cadastralCode: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { cadastralCode } = await params

  const building = await prisma.building.findUnique({
    where: { cadastralCode },
    include: {
      readinessScore: true,
    },
  })

  if (!building) {
    return NextResponse.json({ error: 'Building not found' }, { status: 404 })
  }

  if (!building.readinessScore) {
    return NextResponse.json(
      {
        buildingId: building.id,
        cadastralCode,
        score: null,
        message: 'Score not yet computed. POST /api/readiness/{cadastralCode}/recalculate to compute.',
      },
      { status: 200 }
    )
  }

  return NextResponse.json({
    buildingId: building.id,
    cadastralCode,
    score: building.readinessScore,
  })
}
