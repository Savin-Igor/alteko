/**
 * Backfills BuildingReadinessScore for all buildings that don't have one yet.
 *
 * Run after Sprint 2 migration and seed-rules.ts.
 * Safe to re-run — skips buildings that already have a score.
 *
 * Usage: npx ts-node scripts/backfill-readiness.ts
 */

import { PrismaClient, DataConfidence, DecisionType, FundingWindowStatus } from '@prisma/client'
import { computeReadinessScore } from '../src/lib/readiness/score'
import { computeNextBestAction } from '../src/lib/readiness/next-action'

const prisma = new PrismaClient()
const RULES_VERSION = 'v0.1-2026-05'

async function main() {
  const buildings = await prisma.building.findMany({
    where: { readinessScore: null },
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

  console.log(`Found ${buildings.length} buildings without a readiness score.`)

  let created = 0
  let failed = 0

  for (const building of buildings) {
    try {
      const components = await computeReadinessScore(building.id)

      const passedDecisionTypes = building.decisionCampaigns.map(
        (c) => c.decisionType as DecisionType
      )

      const scfScenario = building.scenarios.find((s) => s.scenarioType === 'SCF_2026_2032')
      const scfWindowStatus = (scfScenario?.windowStatus ?? 'UNKNOWN') as FundingWindowStatus
      const altumScenario = building.scenarios.find(
        (s) => s.scenarioType === 'ALTUM_REMONTA_AIZDEVUMS'
      )
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

      await prisma.buildingReadinessScore.create({
        data: {
          buildingId: building.id,
          ...components,
          nextBestAction: nextAction.lv,
          nextBestActionRu: nextAction.ru,
          rulesEngineVersion: RULES_VERSION,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })

      created++
      process.stdout.write('.')
    } catch (err) {
      failed++
      console.error(`\n  ✗ Building ${building.id} (${building.cadastralCode}): ${err}`)
    }
  }

  console.log(`\nDone. Created: ${created}, failed: ${failed}.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
