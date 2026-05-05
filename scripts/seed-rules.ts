/**
 * Seeds initial RulesEngineVersion records for each FinancingScenarioType.
 *
 * Rules are intentionally conservative (v0.1) — based on verified facts from
 * docs/reference/key-facts.md as of May 2026. Run after schema migration.
 *
 * Usage: npx ts-node scripts/seed-rules.ts
 */

import { PrismaClient, FinancingScenarioType } from '@prisma/client'

const prisma = new PrismaClient()

const RULES_VERSION = 'v0.1-2026-05'

const initialRules: Array<{
  version: string
  scenarioType: FinancingScenarioType
  rulesJson: object
  effectiveFrom: Date
  description: string
}> = [
  {
    version: `scf-2026-${RULES_VERSION}`,
    scenarioType: FinancingScenarioType.SCF_2026_2032,
    effectiveFrom: new Date('2026-01-01'),
    description: 'SCF 2026-2032 rules v0.1 — based on MK rīkojums Nr.393 (02.07.2025). MK noteikumi expected Q4 2026.',
    rulesJson: {
      windowStatus: 'EXPECTED',
      eligibilityRules: {
        minConstructionYear: { max: 1990, reason: 'Pre-1991 Soviet-era buildings are primary target' },
        minFloorCount: { min: 3, reason: 'MFB threshold from programme documents' },
        energyClassRequired: { values: ['D', 'E', 'F', 'G'], reason: 'Energy-inefficient buildings only' },
        notRenovated: { reason: 'Already renovated buildings are ineligible' },
      },
      subsidyRules: {
        maxSubsidyPercent: 0.49,
        source: 'altum.lv — up to 49-50% of eligible costs',
        note: 'SCF subsidy rate to be confirmed in MK noteikumi Q4 2026',
      },
      estimatedWindowOpen: '2027-Q2',
      mkNoteikumiExpected: '2026-Q4',
      source: 'likumi.lv/ta/id/361681',
    },
  },
  {
    version: `altum-loan-${RULES_VERSION}`,
    scenarioType: FinancingScenarioType.ALTUM_REMONTA_AIZDEVUMS,
    effectiveFrom: new Date('2026-01-01'),
    description: 'ALTUM remonta aizdevums rules v0.1 — active programme, valid until 30.06.2031.',
    rulesJson: {
      windowStatus: 'OPEN',
      eligibilityRules: {
        minLoanEur: 10000,
        interestRatePercent: 3.9,
        maxTermYears: 20,
        programValidUntil: '2031-06-30',
        minOwnerDecisionShare: 0.51,
        requiresMinSuppliers: 2,
        requiresMinPolledSuppliers: 5,
      },
      subsidyRules: {
        maxSubsidyPercent: 0,
        note: 'No subsidy — loan product only',
      },
      source: 'altum.lv — Remonta aizdevums',
    },
  },
  {
    version: `bank-${RULES_VERSION}`,
    scenarioType: FinancingScenarioType.COMMERCIAL_BANK,
    effectiveFrom: new Date('2026-01-01'),
    description: 'Commercial bank renovation loan rules v0.1 — indicative rates only.',
    rulesJson: {
      windowStatus: 'OPEN',
      eligibilityRules: {
        note: 'Depends on specific bank — no universal rules. Indicative only.',
        typicalInterestRatePercent: { min: 4.5, max: 7.0 },
        typicalTermYears: { min: 5, max: 20 },
      },
      subsidyRules: {
        maxSubsidyPercent: 0,
        note: 'No subsidy — commercial loan',
      },
      source: 'Market data — indicative',
    },
  },
  {
    version: `own-fund-${RULES_VERSION}`,
    scenarioType: FinancingScenarioType.OWN_FUND,
    effectiveFrom: new Date('2026-01-01'),
    description: 'Own repair fund accumulation rules v0.1.',
    rulesJson: {
      windowStatus: 'OPEN',
      eligibilityRules: {
        note: 'Always available — requires owner decisions and fund management',
        minRepairFundContributionEurM2: 0.5,
      },
      subsidyRules: {
        maxSubsidyPercent: 0,
        note: 'No subsidy — self-financed',
      },
      source: 'Internal — based on typical Latvian practice',
    },
  },
  {
    version: `mixed-${RULES_VERSION}`,
    scenarioType: FinancingScenarioType.MIXED,
    effectiveFrom: new Date('2026-01-01'),
    description: 'Mixed financing scenario rules v0.1 — combination of ALTUM loan + own fund.',
    rulesJson: {
      windowStatus: 'OPEN',
      eligibilityRules: {
        note: 'Combination of available instruments — ALTUM remonta aizdevums + own fund',
        typicalSplit: { altumLoanPercent: 0.7, ownFundPercent: 0.3 },
      },
      subsidyRules: {
        maxSubsidyPercent: 0,
        note: 'No grant subsidy in this scenario; ALTUM loan at 3.9%',
      },
      source: 'Internal composite',
    },
  },
]

async function main() {
  console.log(`Seeding ${initialRules.length} RulesEngineVersion records...`)

  for (const rule of initialRules) {
    await prisma.rulesEngineVersion.upsert({
      where: { version: rule.version },
      update: {},
      create: rule,
    })
    console.log(`  ✓ ${rule.version} (${rule.scenarioType})`)
  }

  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
