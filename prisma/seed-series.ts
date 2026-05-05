import { PrismaClient } from '@prisma/client'

// Building series reference data — compiled from:
//   - ResearchGate: "Technical Condition of Soviet-Era Apartment Buildings in Latvia"
//   - apliecinajumakarte.lv (series floor plans)
//   - Cabinet of Ministers classification (Group IV = 70yr, Group V = 60yr service life)
//   - LSM article 21.01.2025 on series 104 and 119 longevity study
//
// No official registry exists. Match heuristic: constructionYear + wallMaterial + floorCount
//
// wallMaterialKey is a SUBSTRING matched against Building.wallMaterial from Building.ZIP.
// Building.ZIP stores full Latvian material names (no code prefix), so keys must be
// substrings of those names:
//   "Dzelzsbetona paneļi"  → panels (used by 104, 119, 316, 318, 464, 467, 602, 602P)
//   "Ķieģeļu mūris"        → brick  (used by 103, Khrushchevka, Stalinka)
//
// NOTE: Building.wallMaterial from Building.ZIP differs from ApartmentTransaction.wallMaterial
// from tg_darjumi CSV, which uses "CODE - name" format (e.g. "2303 - Dzelzsbetona paneļi").
// The series assignment script (scripts/assign-series.ts) uses Building.wallMaterial.

const SERIES: Array<{
  code: string
  wallMaterialKey: string
  floorsMin: number | null
  floorsMax: number | null
  yearFrom: number
  yearTo: number
  typicalAreaM2: number | null
  description: string
}> = [
  {
    code: '103',
    wallMaterialKey: 'Ķieģeļu mūris',
    floorsMin: 5,
    floorsMax: 9,
    yearFrom: 1960,
    yearTo: 1975,
    typicalAreaM2: 42,
    description: 'Brick load-bearing walls, compact layout; unusual for Soviet panel era',
  },
  {
    code: '104',
    wallMaterialKey: 'Dzelzsbetona paneļi',
    floorsMin: 5,
    floorsMax: 9,
    yearFrom: 1963,
    yearTo: 1985,
    typicalAreaM2: 44,
    description: 'Large-panel; Group V (60yr). LSM 2025 study: requires renovation',
  },
  {
    code: '119',
    wallMaterialKey: 'Dzelzsbetona paneļi',  // Dzelzsbetona paneļi
    floorsMin: 5,
    floorsMax: 12,
    yearFrom: 1965,
    yearTo: 1991,
    typicalAreaM2: 52,
    description: 'Designed in Latvia; spacious rooms; Group IV (70yr). Still in demand',
  },
  {
    code: '316',
    wallMaterialKey: 'Dzelzsbetona paneļi',
    floorsMin: 5,
    floorsMax: 9,
    yearFrom: 1958,
    yearTo: 1970,
    typicalAreaM2: 38,
    description: 'Group IV (70yr); early large-panel type',
  },
  {
    code: '318',
    wallMaterialKey: 'Dzelzsbetona paneļi',
    floorsMin: 4,
    floorsMax: 9,
    yearFrom: 1960,
    yearTo: 1972,
    typicalAreaM2: 40,
    description: 'Group IV (70yr); compact Soviet standard',
  },
  {
    code: '464',
    wallMaterialKey: 'Dzelzsbetona paneļi',
    floorsMin: 4,
    floorsMax: 5,
    yearFrom: 1962,
    yearTo: 1975,
    typicalAreaM2: 36,
    description: 'Group V (60yr); low-rise, parallel street positioning',
  },
  {
    code: '467',
    wallMaterialKey: 'Dzelzsbetona paneļi',  // Reinforced concrete panels
    floorsMin: 9,
    floorsMax: 9,
    yearFrom: 1970,
    yearTo: 1985,
    typicalAreaM2: 48,
    description: 'Group V (60yr); 9-story with balconies and lifts; spacious stairwells',
  },
  {
    code: '602',
    wallMaterialKey: 'Dzelzsbetona paneļi',
    floorsMin: 6,
    floorsMax: 9,
    yearFrom: 1960,
    yearTo: 1978,
    typicalAreaM2: 40,
    description: 'Keramzite concrete panels; Group V (60yr)',
  },
  {
    code: '602P',
    wallMaterialKey: 'Dzelzsbetona paneļi',
    floorsMin: 9,
    floorsMax: 16,
    yearFrom: 1972,
    yearTo: 1985,
    typicalAreaM2: 46,
    description: 'Improved 602; taller variant with lifts',
  },
  {
    code: 'Khrushchevka',
    wallMaterialKey: 'Ķieģeļu mūris',
    floorsMin: 4,
    floorsMax: 5,
    yearFrom: 1956,
    yearTo: 1965,
    typicalAreaM2: 32,
    description: '4-5 story blocks; poor sound insulation; no lift; very compact rooms',
  },
  {
    code: 'Stalinka',
    wallMaterialKey: 'Ķieģeļu mūris',
    floorsMin: 3,
    floorsMax: 7,
    yearFrom: 1945,
    yearTo: 1958,
    typicalAreaM2: 58,
    description: 'Stalin-era brick; high ceilings; more durable than panel; ornate facades',
  },
]

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding building series reference data...')

  for (const s of SERIES) {
    await prisma.buildingSeries.upsert({
      where: { code: s.code },
      create: s,
      update: {
        wallMaterialKey: s.wallMaterialKey,
        floorsMin: s.floorsMin,
        floorsMax: s.floorsMax,
        yearFrom: s.yearFrom,
        yearTo: s.yearTo,
        typicalAreaM2: s.typicalAreaM2,
        description: s.description,
      },
    })
    console.log(`  ✓ Series ${s.code}`)
  }

  console.log(`Done. Seeded ${SERIES.length} series.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
