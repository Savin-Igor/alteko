import { prisma } from '../src/lib/prisma'

// Assigns Building.series using a heuristic based on constructionYear, wallMaterial, floorCount.
// No official per-building series registry exists in Latvia.
//
// Match logic (ordered by specificity — most specific first):
//   1. Stalinka:     brick, 3–7 floors, 1945–1958
//   2. Khrushchevka: brick, 4–5 floors, 1956–1965
//   3. 103:          brick, 5–9 floors, 1960–1975
//   4. 467:          panels, exactly 9 floors, 1970–1985
//   5. 602P:         panels, 9–16 floors, 1972–1985
//   6. 464:          panels, 4–5 floors, 1962–1975
//   7. 316:          panels, 5–9 floors, 1958–1970
//   8. 318:          panels, 4–9 floors, 1960–1972
//   9. 104:          panels, 5–9 floors, 1963–1985
//  10. 602:          panels, 6–9 floors, 1960–1978
//  11. 119:          panels, 5–12 floors, 1965–1991
//
// Limitations:
//   - Series 104, 119, 602 overlap heavily in year/floor ranges; match is best-effort.
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
  { code: '467',          materialSubstring: 'Dzelzsbetona',   yearFrom: 1970, yearTo: 1985, floorsMin: 9,  floorsMax: 9  },
  { code: '602P',         materialSubstring: 'Dzelzsbetona',   yearFrom: 1972, yearTo: 1991, floorsMin: 9,  floorsMax: 16 },
  { code: '464',          materialSubstring: 'Dzelzsbetona',   yearFrom: 1960, yearTo: 1980, floorsMin: 4,  floorsMax: 5  },
  { code: '316',          materialSubstring: 'Dzelzsbetona',   yearFrom: 1955, yearTo: 1970, floorsMin: 5,  floorsMax: 9  },
  { code: '318',          materialSubstring: 'Dzelzsbetona',   yearFrom: 1958, yearTo: 1975, floorsMin: 4,  floorsMax: 9  },
  { code: '104',          materialSubstring: 'Dzelzsbetona',   yearFrom: 1963, yearTo: 1985, floorsMin: 5,  floorsMax: 9  },
  { code: '602',          materialSubstring: 'Dzelzsbetona',   yearFrom: 1958, yearTo: 1980, floorsMin: 6,  floorsMax: 9  },
  { code: '119',          materialSubstring: 'Dzelzsbetona',   yearFrom: 1963, yearTo: 1991, floorsMin: 5,  floorsMax: 12 },

  // ── Keramzite/arbolite panels (catch-all for light-panel Soviet buildings) ─
  { code: '602',          materialSubstring: 'paneļi',         yearFrom: 1958, yearTo: 1985, floorsMin: 4,  floorsMax: 9  },
]

function matchSeries(
  year: number,
  material: string,
  floors: number,
): string | null {
  for (const rule of RULES) {
    if (
      year    >= rule.yearFrom &&
      year    <= rule.yearTo   &&
      floors  >= rule.floorsMin &&
      floors  <= rule.floorsMax &&
      material.includes(rule.materialSubstring)
    ) {
      return rule.code
    }
  }
  return null
}

async function assignSeries() {
  console.log('Querying buildings eligible for series assignment...')

  // Only process multi-apartment Soviet-era buildings with enough data
  const buildings = await prisma.building.findMany({
    where: {
      apartmentCount:  { gte: 3 },
      constructionYear: { gte: 1945, lte: 1991 },
      wallMaterial:    { not: null },
      floorCount:      { not: null },
    },
    select: {
      id:              true,
      constructionYear: true,
      wallMaterial:    true,
      floorCount:      true,
      series:          true,
    },
  })

  console.log(`Found ${buildings.length} eligible buildings.`)

  let assigned = 0
  let unchanged = 0
  let unmatched = 0
  const distribution: Record<string, number> = {}

  const updates: { id: string; series: string }[] = []

  for (const b of buildings) {
    const series = matchSeries(
      b.constructionYear!,
      b.wallMaterial!,
      b.floorCount!,
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
  console.log('\nDistribution by series:')
  Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([code, count]) => console.log(`  ${code.padEnd(12)} ${count}`))

  await prisma.$disconnect()
}

assignSeries().catch(e => { console.error(e); process.exit(1) })
