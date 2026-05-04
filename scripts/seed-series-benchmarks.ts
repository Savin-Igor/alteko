/**
 * Seeds BuildingSeriesBenchmark with verified heating norms by building series.
 *
 * Sources:
 * - ALTUM program portfolio (627 buildings)
 * - University of Latvia energy research
 * - Ministry of Economics Latvia, 2023
 * Full references: docs/reference/key-facts.md
 *
 * Usage: npx ts-node scripts/seed-series-benchmarks.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SOURCE = 'ALTUM program portfolio (627 buildings), University of Latvia, Ministry of Economics Latvia 2023'
const NATIONAL_AVERAGE_HOT_WATER = 73.3
const RENOVATION_TARGET = 52.0

const benchmarks = [
  {
    seriesCode: '316',
    heatingKwhM2Year: 132.5,
    hotWaterKwhM2Year: NATIONAL_AVERAGE_HOT_WATER,
    afterRenovationTargetKwhM2Year: RENOVATION_TARGET,
    sourceDescription: SOURCE,
  },
  {
    seriesCode: '318',
    heatingKwhM2Year: 132.5,
    hotWaterKwhM2Year: NATIONAL_AVERAGE_HOT_WATER,
    afterRenovationTargetKwhM2Year: RENOVATION_TARGET,
    sourceDescription: `${SOURCE}. Note: 318 = same era as 316 (Khrushchevka). Separate series by material (see issue #39).`,
  },
  {
    seriesCode: '103',
    heatingKwhM2Year: 128.6,
    hotWaterKwhM2Year: NATIONAL_AVERAGE_HOT_WATER,
    afterRenovationTargetKwhM2Year: RENOVATION_TARGET,
    sourceDescription: SOURCE,
  },
  {
    seriesCode: '602',
    heatingKwhM2Year: 117.0,
    hotWaterKwhM2Year: NATIONAL_AVERAGE_HOT_WATER,
    afterRenovationTargetKwhM2Year: RENOVATION_TARGET,
    sourceDescription: SOURCE,
  },
  {
    seriesCode: '467',
    heatingKwhM2Year: 113.1,
    hotWaterKwhM2Year: NATIONAL_AVERAGE_HOT_WATER,
    afterRenovationTargetKwhM2Year: RENOVATION_TARGET,
    sourceDescription: SOURCE,
  },
  {
    seriesCode: '104',
    heatingKwhM2Year: 107.6,
    hotWaterKwhM2Year: NATIONAL_AVERAGE_HOT_WATER,
    afterRenovationTargetKwhM2Year: RENOVATION_TARGET,
    sourceDescription: SOURCE,
  },
  {
    // Fallback for series 119, 334, LM and all unknown series
    seriesCode: 'NATIONAL_AVERAGE',
    heatingKwhM2Year: 104.4,
    hotWaterKwhM2Year: NATIONAL_AVERAGE_HOT_WATER,
    afterRenovationTargetKwhM2Year: RENOVATION_TARGET,
    sourceDescription: `${SOURCE}. National average — used as fallback when series is unknown or not in table.`,
  },
]

async function main() {
  console.log(`Seeding ${benchmarks.length} BuildingSeriesBenchmark records...`)
  for (const b of benchmarks) {
    await prisma.buildingSeriesBenchmark.upsert({
      where: { seriesCode: b.seriesCode },
      update: b,
      create: b,
    })
    console.log(`  ✓ ${b.seriesCode}: ${b.heatingKwhM2Year} kWh/m²/year`)
  }
  console.log('Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
