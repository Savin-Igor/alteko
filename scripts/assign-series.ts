import { prisma } from '../src/lib/prisma'

// Assigns Building.series using a heuristic based on constructionYear, wallMaterial, floorCount,
// and optionally median apt area from BuildingUnit (4th signal for ambiguous overlapping series).
// No official per-building series registry exists in Latvia.
//
// Match logic (ordered by specificity — most specific first):
//   1. Stalinka:     brick, 3–7 floors, 1945–1958
//   2. Khrushchevka: brick, 4–5 floors, 1956–1965
//   3. 103:          brick, 5–9 floors, 1960–1975
//   4. 467:          panels, exactly 9 floors, 1970–1985, avg apt 42–55 m²
//   5. 602P:         panels, 9–16 floors, 1972–1991, avg apt 40–50 m²
//   6. 464:          panels, 4–5 floors, 1962–1975
//   7. 316:          panels, 5–9 floors, 1958–1970
//   8. 318:          panels, 4–9 floors, 1960–1972
//   9. 104:          panels, 5–9 floors, 1963–1985, avg apt 36–48 m²
//  10. 602:          panels, 6–9 floors, 1960–1978
//  11. 119:          panels, 5–12 floors, 1963–1991, avg apt 44–62 m²
//
// Limitations:
//   - Area ranges apply only to the 4 overlapping panel series (467, 602P, 104, 119).
//   - Area check is skipped when BuildingUnit data is absent (graceful degradation).
//   - "Dzelzsbetona paneļi" in Building.ZIP covers all reinforced concrete panels,
//     including series that used keramzite variants. Can't distinguish further without
//     floor plans or surveyors' notes.
//   - Only multi-apartment buildings (apartmentCount >= 3) are processed.
//
// Run: make assign-series
// Source of series data: BuildingSeries table (seeded from academic sources — see seed-series.ts)

type SeriesRule = {
  code: string
  materialSubstring: string  // must appear in Building.wallMaterial
  yearFrom: number
  yearTo: number
  floorsMin: number
  floorsMax: number
  aptAreaMin?: number  // optional: min avg apt area m² (from BuildingUnit)
  aptAreaMax?: number  // optional: max avg apt area m² (from BuildingUnit)
}

// Ordered most-specific first to reduce ambiguous assignments.
// materialSubstring is checked with String.includes() against Building.wallMaterial.
// 'Dzelzsbetona' matches 'Dzelzsbetona paneļi' (panels).
// 'Ķieģeļu mūris' matches all brick thickness variants.
// 'paneļi' catches Arbolīta/keramzite panels as a fallback for Soviet light-panel construction.
const RULES: SeriesRule[] = [
  // ── Brick series (most specific first by year) ───────────────────────────
  { code: 'Stalinka',     materialSubstring: 'Ķieģeļu mūris', yearFrom: 1945, yearTo: 1958, floorsMin: 3,  floorsMax: 9  },
  { code: 'Khrushchevka', materialSubstring: 'Ķieģeļu mūris', yearFrom: 1956, yearTo: 1965, floorsMin: 4,  floorsMax: 5  },
  { code: '103',          materialSubstring: 'Ķieģeļu mūris', yearFrom: 1960, yearTo: 1980, floorsMin: 5,  floorsMax: 9  },

  // ── Panel series (most specific by floor/year first) ─────────────────────
  // 467 vs 602P: both 9-floor Dzelzsbetona — disambiguate by apt area (467 ~44m², 602P ~46m²)
  { code: '467',          materialSubstring: 'Dzelzsbetona',   yearFrom: 1970, yearTo: 1985, floorsMin: 9,  floorsMax: 9,  aptAreaMin: 42, aptAreaMax: 55 },
  { code: '602P',         materialSubstring: 'Dzelzsbetona',   yearFrom: 1972, yearTo: 1991, floorsMin: 9,  floorsMax: 16, aptAreaMin: 40, aptAreaMax: 50 },
  { code: '464',          materialSubstring: 'Dzelzsbetona',   yearFrom: 1960, yearTo: 1980, floorsMin: 4,  floorsMax: 5  },
  { code: '316',          materialSubstring: 'Dzelzsbetona',   yearFrom: 1955, yearTo: 1970, floorsMin: 5,  floorsMax: 9  },
  { code: '318',          materialSubstring: 'Dzelzsbetona',   yearFrom: 1958, yearTo: 1975, floorsMin: 4,  floorsMax: 9  },
  // 104 vs 119: overlapping year/floor ranges — disambiguate by apt area (104 ~44m², 119 ~52m²)
  { code: '104',          materialSubstring: 'Dzelzsbetona',   yearFrom: 1963, yearTo: 1985, floorsMin: 5,  floorsMax: 9,  aptAreaMin: 36, aptAreaMax: 48 },
  { code: '602',          materialSubstring: 'Dzelzsbetona',   yearFrom: 1958, yearTo: 1980, floorsMin: 6,  floorsMax: 9  },
  { code: '119',          materialSubstring: 'Dzelzsbetona',   yearFrom: 1963, yearTo: 1991, floorsMin: 5,  floorsMax: 12, aptAreaMin: 44, aptAreaMax: 62 },

  // ── Keramzite/arbolite panels (catch-all for light-panel Soviet buildings) ─
  { code: '602',          materialSubstring: 'paneļi',         yearFrom: 1958, yearTo: 1985, floorsMin: 4,  floorsMax: 9  },
]

function matchSeries(
  year: number,
  material: string,
  floors: number,
  medianAptAreaM2: number | null,
): string | null {
  for (const rule of RULES) {
    if (
      year    >= rule.yearFrom &&
      year    <= rule.yearTo   &&
      floors  >= rule.floorsMin &&
      floors  <= rule.floorsMax &&
      material.includes(rule.materialSubstring)
    ) {
      // If rule has area constraints and we have data, apply them as a tiebreaker
      if (rule.aptAreaMin !== undefined && medianAptAreaM2 !== null) {
        if (medianAptAreaM2 < rule.aptAreaMin || medianAptAreaM2 > rule.aptAreaMax!) continue
      }
      return rule.code
    }
  }
  return null
}

async function assignSeries() {
  console.log('Querying buildings eligible for series assignment...')

  // Build map: cadastralCode → avg apt area (null if no BuildingUnit records)
  // Note: Prisma groupBy does not support median; avg is close enough for disambiguation.
  const unitGroups = await prisma.buildingUnit.groupBy({
    by: ['buildingCadastralCode'],
    _avg: { areaM2: true },
  })
  const medianAreaMap = new Map<string, number>()
  for (const g of unitGroups) {
    if (g._avg.areaM2 !== null) {
      medianAreaMap.set(g.buildingCadastralCode, Number(g._avg.areaM2))
    }
  }
  console.log(`[backend] BuildingUnit data available for ${medianAreaMap.size} buildings.`)

  // Only process multi-apartment Soviet-era buildings with enough data
  const buildings = await prisma.building.findMany({
    where: {
      apartmentCount:  { gte: 3 },
      constructionYear: { gte: 1945, lte: 1991 },
      wallMaterial:    { not: null },
      floorCount:      { not: null },
    },
    select: {
      id:               true,
      cadastralCode:    true,  // needed for BuildingUnit lookup
      constructionYear: true,
      wallMaterial:     true,
      floorCount:       true,
      series:           true,
    },
  })

  console.log(`Found ${buildings.length} eligible buildings.`)

  let assigned = 0
  let unchanged = 0
  let unmatched = 0
  let withAreaSignal = 0
  let withoutAreaSignal = 0
  const distribution: Record<string, number> = {}

  const updates: { id: string; series: string }[] = []

  for (const b of buildings) {
    const medianAptAreaM2 = medianAreaMap.get(b.cadastralCode) ?? null

    if (medianAptAreaM2 !== null) withAreaSignal++
    else withoutAreaSignal++

    const series = matchSeries(
      b.constructionYear!,
      b.wallMaterial!,
      b.floorCount!,
      medianAptAreaM2,
    )

    if (!series) { unmatched++; continue }

    distribution[series] = (distribution[series] ?? 0) + 1

    if (b.series === series) { unchanged++; continue }

    updates.push({ id: b.id, series })
  }

  // Batch update in chunks of 500
  const CHUNK = 500
  for (let i = 0; i < updates.length; i += CHUNK) {
    const chunk = updates.slice(i, i + CHUNK)
    await Promise.all(
      chunk.map(({ id, series }) =>
        prisma.building.update({ where: { id }, data: { series } }),
      ),
    )
    assigned += chunk.length
    if (assigned % 5000 === 0) console.log(`  Updated ${assigned}...`)
  }

  console.log('\nDone.')
  console.log(`  Assigned:  ${assigned}`)
  console.log(`  Unchanged: ${unchanged}`)
  console.log(`  Unmatched: ${unmatched}`)
  console.log(`  Used area signal: ${withAreaSignal}`)
  console.log(`  No area data:     ${withoutAreaSignal}`)
  console.log('\nDistribution by series:')
  Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([code, count]) => console.log(`  ${code.padEnd(12)} ${count}`))

  await prisma.$disconnect()
}

assignSeries().catch(e => { console.error(e); process.exit(1) })
