import { prisma } from '../src/lib/prisma'

// VAR (Valsts adresu reģistrs) building sync — weekly from data.gov.lv
// Dataset: https://data.gov.lv/dati/dataset/varis-atvertie-dati
// File: aw_eka.csv (buildings only, TIPS_CD=108)
// CSV columns: KODS,TIPS_CD,STATUSS,APSTIPR,APST_PAK,VKUR_CD,VKUR_TIPS,
//              NOSAUKUMS,SORT_NOS,ATRIB,PNOD_CD,DAT_SAK,DAT_MOD,DAT_BEIG,
//              FOR_BUILD,PLAN_ADR,STD,KOORD_X,KOORD_Y,DD_N,DD_E
// Note: KODS is the VAR address code (vzdId), not a cadastral code.
//       cadastralCode in the Building table must be obtained from LVM GeoServer WFS.
//       VAR-synced buildings use surrogate cadastralCode = "VAR:{KODS}" until
//       a real cadastral code is resolved via /api/address/resolve.

function parseCSVRow(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

async function syncVzd() {
  const url = process.env.VZD_DATA_URL
  if (!url) {
    console.error('VZD_DATA_URL env var not set')
    process.exit(1)
  }

  console.log('Fetching VAR building data...')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`VAR fetch failed: ${res.status}`)

  const text = await res.text()
  const lines = text.split('\n')
  const dataLines = lines.slice(1) // skip header row

  let upserted = 0
  let skipped = 0

  for (const line of dataLines) {
    if (!line.trim()) continue

    const cols = parseCSVRow(line)
    if (cols.length < 21) {
      skipped++
      continue
    }

    const kods     = cols[0]?.trim()
    const tipscd   = cols[1]?.trim()
    const statuss  = cols[2]?.trim()
    const std      = cols[16]?.trim()
    const ddN      = cols[19]?.trim() // latitude (WGS84)
    const ddE      = cols[20]?.trim() // longitude (WGS84)

    // only active buildings (TIPS_CD=108 is guaranteed by aw_eka.csv; filter EKS=existing)
    if (!kods || statuss !== 'EKS' || !std) {
      skipped++
      continue
    }

    const lat = ddN ? parseFloat(ddN) : null
    const lon = ddE ? parseFloat(ddE) : null

    await prisma.building.upsert({
      where: { vzdId: kods },
      create: {
        // surrogate key until LVM WFS resolves the real cadastral code
        cadastralCode: `VAR:${kods}`,
        vzdId: kods,
        address: std,
        lat,
        lon,
        vzdUpdatedAt: new Date(),
      },
      update: {
        address: std,
        lat,
        lon,
        vzdUpdatedAt: new Date(),
      },
    })

    upserted++
    if (upserted % 1000 === 0) {
      console.log(`Upserted ${upserted} buildings...`)
    }
  }

  console.log(`VAR sync complete. Upserted: ${upserted}, skipped: ${skipped}.`)
  await prisma.$disconnect()
}

syncVzd().catch((e) => {
  console.error(e)
  process.exit(1)
})
