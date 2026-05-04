import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtempSync, mkdirSync, rmSync, createWriteStream, createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { createInterface } from 'node:readline'
import { prisma } from '../src/lib/prisma'

const KEEP = process.env.KEEP_TEMP_FILES === 'true'

function makeTempDir(name: string): string {
  if (KEEP) {
    const dir = join(process.cwd(), 'tmp', name)
    mkdirSync(dir, { recursive: true })
    return dir
  }
  return mkdtempSync(join(tmpdir(), `alteko-${name}-`))
}

// VAR (Valsts adresu reģistrs) building sync — weekly from data.gov.lv
// Dataset: https://data.gov.lv/dati/dataset/varis-atvertie-dati
// Spec:    https://www.vzd.gov.lv/sites/vzd/files/media_file/varis_csv_specifikacija_v7_24072025_3.pdf
// File: aw_eka.csv — ēku un apbūvei paredzēto zemes vienību adreses
//
// CSV columns (21 total, UTF-8 BOM, comma-separated, RFC 4180 quoting):
//   0  KODS       String(9)   VAR address code (vzdId in our DB)
//   1  TIPS_CD    String(3)   108 = ēka / apbūvei paredzēta zemes vienība
//   2  STATUSS    String(3)   EKS=existing, DEL=deleted, ERR=error
//   3  APSTIPR    String(1)   "Y" = approved
//   4  APST_PAK   String(3)   approval level
//   5  VKUR_CD    String(9)   parent object code
//   6  VKUR_TIPS  String(3)   parent object type
//   7  NOSAUKUMS  String(55)  current name
//   8  SORT_NOS   String(55)  sort name
//   9  ATRIB      String(7)   postal code (pasta indekss)
//  10  PNOD_CD    String(9)   postal area code
//  11  DAT_SAK    Date        creation date
//  12  DAT_MOD    Date        modification date
//  13  DAT_BEIG   Date        deletion date
//  14  FOR_BUILD  String(1)   "N"=ēka (building), "Y"=apbūvei paredzēta zemes vienība
//  15  PLAN_ADR   String(10)  "N"=linked to KIS cadastre, "Y"=planned/unlinked
//  16  STD        String(103) full address text
//  17  KOORD_X    Double(10)  centroid X, LKS-92
//  18  KOORD_Y    Double(10)  centroid Y, LKS-92
//  19  DD_N       Double(9)   latitude  WGS-84
//  20  DD_E       Double(9)   longitude WGS-84
//
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

  const tmpDir  = makeTempDir('vzd')
  const csvPath = join(tmpDir, 'aw_eka.csv')

  try {
    console.log('Downloading VAR building data...')
    const res = await fetch(url)
    if (!res.ok) throw new Error(`VAR fetch failed: ${res.status}`)
    await pipeline(Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(csvPath))
    console.log('Download complete.')

    let upserted = 0
    let skipped  = 0
    let firstLine = true

    const rl = createInterface({ input: createReadStream(csvPath, { encoding: 'utf-8' }) })

    for await (const rawLine of rl) {
      // Strip UTF-8 BOM from first line
      const line = firstLine ? rawLine.replace(/^﻿/, '') : rawLine
      firstLine = false

      if (!line.trim()) continue

      const cols = parseCSVRow(line)
      if (cols.length < 21) { skipped++; continue }

      const kods     = cols[0]?.trim()
      const statuss  = cols[2]?.trim()
      const atrib    = cols[9]?.trim()  || null  // postal code, e.g. "LV-4211"
      const forBuild = cols[14]?.trim()
      const planAdr  = cols[15]?.trim() || null  // "N"=linked to KIS cadastre, "Y"=planned/unlinked
      const std      = cols[16]?.trim()
      const ddN      = cols[19]?.trim() // latitude  WGS-84 (DD_N)
      const ddE      = cols[20]?.trim() // longitude WGS-84 (DD_E)

      // FOR_BUILD="N" → ēka (building); "Y" → apbūvei paredzēta zemes vienība (land plot)
      // STATUSS="EKS" → existing; "DEL"/"ERR" → skip
      if (!kods || statuss !== 'EKS' || forBuild !== 'N' || !std) { skipped++; continue }

      const lat = ddN ? parseFloat(ddN) : null
      const lon = ddE ? parseFloat(ddE) : null
      const isPlanAddress = planAdr === 'Y' ? true : planAdr === 'N' ? false : null

      await prisma.building.upsert({
        where: { vzdId: kods },
        create: {
          // surrogate key until LVM WFS resolves the real cadastral code
          cadastralCode: `VAR:${kods}`,
          vzdId: kods,
          address: std,
          lat,
          lon,
          postalCode: atrib,
          isPlanAddress,
          vzdUpdatedAt: new Date(),
        },
        update: {
          address: std,
          lat,
          lon,
          postalCode: atrib,
          isPlanAddress,
          vzdUpdatedAt: new Date(),
        },
      })

      upserted++
      if (upserted % 1000 === 0) console.log(`Upserted ${upserted} buildings...`)
    }

    console.log(`VAR sync complete. Upserted: ${upserted}, skipped: ${skipped}.`)

  } finally {
    if (KEEP) {
      console.log(`Temp files kept at: ${tmpDir}`)
    } else {
      rmSync(tmpDir, { recursive: true, force: true })
    }
  }

  await prisma.$disconnect()
}

syncVzd().catch((e) => {
  console.error(e)
  process.exit(1)
})
