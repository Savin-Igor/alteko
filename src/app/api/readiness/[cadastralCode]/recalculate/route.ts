import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { computeReadinessScore } from '@/lib/readiness/score'
import { computeNextBestAction } from '@/lib/readiness/next-action'
import { DataConfidence, DecisionType, FundingWindowStatus } from '@prisma/client'

export const runtime = 'nodejs'

const CURRENT_RULES_ENGINE_VERSION = 'v0.1-2026-05'

interface RouteParams {
  params: Promise<{ cadastralCode: string }>
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { cadastralCode } = await params

  const building = await prisma.building.findUnique({
    where: { cadastralCode },
    include: {
      decisionCampaigns: {
        where: { status: 'COMPLETED' },
        select: { decisionType: true },
      },
      scenarios: {
        select: { scenarioType: true, windowStatus: true, eligibility: true },
      },
    },
  })

  if (!building) {
    return NextResponse.json({ error: 'Building not found' }, { status: 404 })
  }

  const components = await computeReadinessScore(building.id)

  const passedDecisionTypes = building.decisionCampaigns.map((c) => c.decisionType as DecisionType)

  const scfScenario = building.scenarios.find((s) => s.scenarioType === 'SCF_2026_2032')
  const scfWindowStatus = (scfScenario?.windowStatus ?? 'UNKNOWN') as FundingWindowStatus
  const altumScenario = building.scenarios.find((s) => s.scenarioType === 'ALTUM_REMONTA_AIZDEVUMS')
  const altumLoanEligible =
    altumScenario?.eligibility === 'ELIGIBLE' || altumScenario?.eligibility === 'LIKELY_ELIGIBLE'

  const nextAction = computeNextBestAction({
    dataConfidenceStatus: components.dataConfidenceStatus as DataConfidence,
    energyScore: components.energyScore,
    documentReadinessScore: components.documentReadinessScore,
    ownerDecisionReadinessScore: components.ownerDecisionReadinessScore,
    passedDecisionTypes,
    scfWindowStatus: scfWindowStatus as 'CLOSED' | 'EXPECTED' | 'OPEN' | 'UNKNOWN',
    altumLoanEligible: altumLoanEligible ?? false,
    supplierSelectionStatus: components.supplierSelectionStatus,
  })

  const score = await prisma.buildingReadinessScore.upsert({
    where: { buildingId: building.id },
    create: {
      buildingId: building.id,
      ...components,
      nextBestAction: nextAction.lv,
      nextBestActionRu: nextAction.ru,
      rulesEngineVersion: CURRENT_RULES_ENGINE_VERSION,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    update: {
      ...components,
      nextBestAction: nextAction.lv,
      nextBestActionRu: nextAction.ru,
      rulesEngineVersion: CURRENT_RULES_ENGINE_VERSION,
      computedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  return NextResponse.json({ buildingId: building.id, cadastralCode, score })
}
