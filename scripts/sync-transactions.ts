import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtempSync, rmSync, createWriteStream, createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { createInterface } from 'node:readline'
import { prisma } from '../src/lib/prisma'

// VZD apartment transaction prices — synced from tg_darjumi CSV
// Dataset: https://data.gov.lv/dati/lv/dataset/darijumi-ar-telpu-grupam
// Spec:    https://data.gov.lv/dati/dataset/ab6b043f-9824-4f7f-afa2-c97d3cb1ed4b
//
// File: tg_darjumi_*.csv — CSV, comma-separated, UTF-8 BOM, RFC 4180 quoting
// Column index → field mapping (0-based, after stripping BOM from header):
//   0  DeaId            — transaction ID (unique per transaction)
//   1  ObjType          — Dz=apartment, Dz-G=garage, etc.
//   2  ProCadNr         — property cadastral number (apartment)
//   3  Std              — full address incl. apartment number
//   4  ArDistrict       — district (novads)
//   5  ArCity           — city
//   6  ArParish         — parish (pagasts)
//   7  DeaDate          — transaction date, format YYYY-MM-DD
//   8  DeaAmount        — transaction price, EUR (integer string, no decimals)
//  15  BuiCount         — buildings in transaction
//  16  BuiCadNr         — building cadastral number (links to Building.cadastralCode)
//  20  BuiUtCode        — building use code (1122 = multi-apt building)
//  23  BuiTotalArea     — building total area m² (dot decimal, e.g. "3119")
//  25  MaterialKind     — wall material string (e.g. "2303 - Dzelzsbetona paneļi")
//  26  BuiExploitYear   — building construction year (integer)
//  27  Deprecation      — depreciation level (V1–V4)
//  30  PregCadNr        — apartment/premise group cadastral number
//  34  PregFloorMin     — lowest floor of sold apartment
//  35  PregFloorMax     — highest floor of sold apartment
//  36  PregTotalArea    — apartment area m² (dot decimal)
//
// Note: areas can use comma as decimal separator in some fields — normalised below.
// Coordinate file (tg_koordinatas_*.csv) provides building WGS-84 coords by DeaId
// but is not used here — coordinates come from Building table (sync-vzd.ts).

const COL = {
  DEA_ID: 0,
  OBJ_TYPE: 1,
  PROP_CAD_NR: 2,
  ADDRESS: 3,
  DISTRICT: 4,
  CITY: 5,
  DEA_DATE: 7,
  DEA_AMOUNT: 8,
  BUI_COUNT: 15,
  BUI_CAD_NR: 16,
  BUI_USE_CODE: 20,
  BUI_TOTAL_AREA: 23,
  MATERIAL: 25,
  BUI_YEAR: 26,
  DEPRECATION: 27,
  PREG_CAD_NR: 30,
  FLOOR_MIN: 34,
  FLOOR_MAX: 35,
  APT_AREA: 36,
} as const

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

function parseDecimal(raw: string | undefined): number | null {
  if (!raw || raw === 'NULL' || raw.trim() === '') return null
  // Normalise comma decimal separator to dot
  const normalised = raw.replace(',', '.')
  const n = parseFloat(normalised)
  return isNaN(n) ? null : n
}

function parseInt10(raw: string | undefined): number | null {
  if (!raw || raw === 'NULL' || raw.trim() === '') return null
  const n = parseInt(raw, 10)
  return isNaN(n) ? null : n
}

async function syncTransactions() {
  const url = process.env.VZD_TRANSACTIONS_URL
  if (!url) {
    console.error('VZD_TRANSACTIONS_URL env var not set')
    process.exit(1)
  }

  const tmpDir  = mkdtempSync(join(tmpdir(), 'alteko-transactions-'))
  const csvPath = join(tmpDir, 'tg_darjumi.csv')

  try {
    console.log('Downloading apartment transaction data (~200 MB)...')
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Transactions fetch failed: ${res.status}`)
    await pipeline(Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(csvPath))
    console.log('Download complete.')

    let upserted  = 0
    let skipped   = 0
    let firstLine = true

    const rl = createInterface({ input: createReadStream(csvPath, { encoding: 'utf-8' }) })

    for await (const rawLine of rl) {
      // Strip UTF-8 BOM from first line, then skip header
      const line = firstLine ? rawLine.replace(/^﻿/, '') : rawLine
      if (firstLine) { firstLine = false; continue } // skip header row

      if (!line.trim()) continue

      const cols = parseCSVRow(line)
      if (cols.length < 37) { skipped++; continue }

      const deaId = parseInt10(cols[COL.DEA_ID])
      if (!deaId) { skipped++; continue }

      // Filter to apartment transactions only
      const objType = cols[COL.OBJ_TYPE]?.trim()
      if (objType !== 'Dz') { skipped++; continue }

      const priceEur = parseInt10(cols[COL.DEA_AMOUNT])
      if (!priceEur) { skipped++; continue }

      const rawDate = cols[COL.DEA_DATE]?.trim()
      if (!rawDate) { skipped++; continue }
      const transactionDate = new Date(rawDate)
      if (isNaN(transactionDate.getTime())) { skipped++; continue }

      const propertyCadNr  = cols[COL.PROP_CAD_NR]?.trim() || ''
      const address         = cols[COL.ADDRESS]?.trim() || ''
      const district        = cols[COL.DISTRICT]?.trim() || null
      const city            = cols[COL.CITY]?.trim() === 'NULL' ? null : (cols[COL.CITY]?.trim() || null)
      const buildingCadNr   = cols[COL.BUI_CAD_NR]?.trim() || null
      const buildingAreaM2  = parseDecimal(cols[COL.BUI_TOTAL_AREA])
      const buildingYear    = parseInt10(cols[COL.BUI_YEAR])
      const wallMaterial    = cols[COL.MATERIAL]?.trim() === 'NULL' ? null : (cols[COL.MATERIAL]?.trim() || null)
      const depreciation    = cols[COL.DEPRECATION]?.trim() === 'NULL' ? null : (cols[COL.DEPRECATION]?.trim() || null)
      const apartmentCadNr  = cols[COL.PREG_CAD_NR]?.trim() || null
      const floorMin        = parseInt10(cols[COL.FLOOR_MIN])
      const floorMax        = parseInt10(cols[COL.FLOOR_MAX])
      const apartmentAreaM2 = parseDecimal(cols[COL.APT_AREA])

      await prisma.apartmentTransaction.upsert({
        where: { deaId },
        create: {
          deaId, objType, propertyCadNr, buildingCadNr, address, district, city,
          transactionDate, priceEur, buildingAreaM2, buildingYear, wallMaterial,
          depreciation, apartmentCadNr, floorMin, floorMax, apartmentAreaM2,
        },
        update: {
          address, district, city, transactionDate, priceEur, buildingAreaM2,
          buildingYear, wallMaterial, depreciation, apartmentCadNr, floorMin,
          floorMax, apartmentAreaM2, syncedAt: new Date(),
        },
      })

      upserted++
      if (upserted % 5000 === 0) console.log(`Upserted ${upserted} transactions...`)
    }

    console.log(`Transaction sync complete. Upserted: ${upserted}, skipped: ${skipped}.`)

  } finally {
    if (process.env.KEEP_TEMP_FILES === 'true') {
      console.log(`Temp files kept at: ${tmpDir}`)
    } else {
      rmSync(tmpDir, { recursive: true, force: true })
    }
  }

  await prisma.$disconnect()
}

syncTransactions().catch((e) => {
  console.error(e)
  process.exit(1)
})
