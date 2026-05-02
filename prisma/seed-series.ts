import { PrismaClient } from '@prisma/client'

// Building series reference data — compiled from:
//   - ResearchGate: "Technical Condition of Soviet-Era Apartment Buildings in Latvia"
//   - apliecinajumakarte.lv (series floor plans)
//   - Cabinet of Ministers classification (Group IV = 70yr, Group V = 60yr service life)
//   - LSM article 21.01.2025 on series 104 and 119 longevity study
//
// No official registry exists. Match heuristic: constructionYear + wallMaterial + floorCount
// wallMaterialKey: substring match against BuildingZIP MaterialKind field
//   e.g. "2303" → "Dzelzsbetona paneļi" (reinforced concrete panels)
//   "212"  → "Ķieģeļu mūris" (brick masonry)
//   "243"  → "Koka karkasa konstrukcijas" (timber frame)

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
    wallMaterialKey: '212',  // Ķieģeļu mūris (brick)
    floorsMin: 5,
    floorsMax: 9,
    yearFrom: 1960,
    yearTo: 1975,
    typicalAreaM2: 42,
    description: 'Brick load-bearing walls, compact layout; unusual for Soviet panel era',
  },
  {
    code: '104',
    wallMaterialKey: '2303',  // Dzelzsbetona paneļi (reinforced concrete panels)
    floorsMin: 5,
    floorsMax: 9,
    yearFrom: 1963,
    yearTo: 1985,
    typicalAreaM2: 44,
    description: 'Large-panel; Group V (60yr). LSM 2025 study: requires renovation',
  },
  {
    code: '119',
    wallMaterialKey: '2303',  // Dzelzsbetona paneļi
    floorsMin: 5,
    floorsMax: 12,
    yearFrom: 1965,
    yearTo: 1991,
    typicalAreaM2: 52,
    description: 'Designed in Latvia; spacious rooms; Group IV (70yr). Still in demand',
  },
  {
    code: '316',
    wallMaterialKey: '2303',
    floorsMin: 5,
    floorsMax: 9,
    yearFrom: 1958,
    yearTo: 1970,
    typicalAreaM2: 38,
    description: 'Group IV (70yr); early large-panel type',
  },
  {
    code: '318',
    wallMaterialKey: '2303',
    floorsMin: 4,
    floorsMax: 9,
    yearFrom: 1960,
    yearTo: 1972,
    typicalAreaM2: 40,
    description: 'Group IV (70yr); compact Soviet standard',
  },
  {
    code: '464',
    wallMaterialKey: '2303',
    floorsMin: 4,
    floorsMax: 5,
    yearFrom: 1962,
    yearTo: 1975,
    typicalAreaM2: 36,
    description: 'Group V (60yr); low-rise, parallel street positioning',
  },
  {
    code: '467',
    wallMaterialKey: '2303',  // Reinforced concrete panels
    floorsMin: 9,
    floorsMax: 9,
    yearFrom: 1970,
    yearTo: 1985,
    typicalAreaM2: 48,
    description: 'Group V (60yr); 9-story with balconies and lifts; spacious stairwells',
  },
  {
    code: '602',
    wallMaterialKey: '2303',
    floorsMin: 6,
    floorsMax: 9,
    yearFrom: 1960,
    yearTo: 1978,
    typicalAreaM2: 40,
    description: 'Keramzite concrete panels; Group V (60yr)',
  },
  {
    code: '602P',
    wallMaterialKey: '2303',
    floorsMin: 9,
    floorsMax: 16,
    yearFrom: 1972,
    yearTo: 1985,
    typicalAreaM2: 46,
    description: 'Improved 602; taller variant with lifts',
  },
  {
    code: 'Khrushchevka',
    wallMaterialKey: '212',  // Brick or early panels
    floorsMin: 4,
    floorsMax: 5,
    yearFrom: 1956,
    yearTo: 1965,
    typicalAreaM2: 32,
    description: '4-5 story blocks; poor sound insulation; no lift; very compact rooms',
  },
  {
    code: 'Stalinka',
    wallMaterialKey: '212',  // Brick
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
