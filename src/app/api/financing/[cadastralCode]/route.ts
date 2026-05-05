import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { computeAllScenarios, BuildingInput } from '@/lib/financing/scenarios'

export const runtime = 'nodejs'

const RULES_VERSION = 'v0.1-2026-05'

interface RouteParams {
  params: Promise<{ cadastralCode: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { cadastralCode } = await params

  const building = await prisma.building.findUnique({
    where: { cadastralCode },
    include: { scenarios: true },
  })

  if (!building) {
    return NextResponse.json({ error: 'Building not found' }, { status: 404 })
  }

  return NextResponse.json({
    buildingId: building.id,
    cadastralCode,
    scenarios: building.scenarios,
  })
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { cadastralCode } = await params

  const building = await prisma.building.findUnique({ where: { cadastralCode } })
  if (!building) {
    return NextResponse.json({ error: 'Building not found' }, { status: 404 })
  }

  const input: BuildingInput = {
    totalAreaM2: building.totalAreaM2 ? Number(building.totalAreaM2) : null,
    apartmentCount: building.apartmentCount,
    constructionYear: building.constructionYear,
    energyClass: building.energyClass,
    heatingEnergyKwhM2: building.heatingEnergyKwhM2 ? Number(building.heatingEnergyKwhM2) : null,
    renovationYear: building.renovationYear,
  }

  const results = computeAllScenarios(input)

  const scenarios = await Promise.all(
    results.map((r) =>
      prisma.financingScenario.upsert({
        where: { buildingId_scenarioType: { buildingId: building.id, scenarioType: r.scenarioType } },
        create: { buildingId: building.id, ...r, rulesEngineVersion: RULES_VERSION },
        update: { ...r, rulesEngineVersion: RULES_VERSION, computedAt: new Date() },
      })
    )
  )

  return NextResponse.json({ buildingId: building.id, cadastralCode, scenarios })
}
