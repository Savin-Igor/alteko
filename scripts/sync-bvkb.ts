import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtempSync, mkdirSync, rmSync, createWriteStream, createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { createInterface } from 'node:readline'
import { prisma } from '../src/lib/prisma'
import type { EnergyClass } from '@prisma/client'

const KEEP = process.env.KEEP_TEMP_FILES === 'true'

function makeTempDir(name: string): string {
  if (KEEP) {
    const dir = join(process.cwd(), 'tmp', name)
    mkdirSync(dir, { recursive: true })
    return dir
  }
  return mkdtempSync(join(tmpdir(), `alteko-${name}-`))
}

// BVKB Energy Certificates — synced from data.gov.lv (daily updates)
// Dataset: https://data.gov.lv/dati/eng/dataset/bis_ygdi8jmgg-bneuijz7wiwq
// Spec:    https://www.bvkb.gov.lv/en/services/energy-certificate-registry-data-building
//
// File: eku-energosertifikati-DD.MM.YYYY.csv — CSV, comma-separated, UTF-8 BOM
// Column index → field (0-based, after stripping BOM from header):
//   0  Dokumenta_numurs      — certificate document number
//   2  Statuss               — "Ir spēkā" (valid) | "Zaudējis spēku" (expired)
//   3  Izdosanas_datums      — issue date (YYYY-MM-DD)
//   4  Deriguma_termins      — expiry date
//  11  Objektu_identificejosie_kadastra_apzimejumi — cadastral code(s)
//  14  Parbuves_gads         — renovation year (integer, nullable)
//  20  Energija_apkurei_kwh_m_2_gada — heating energy kWh/m²/year
//  25  Ekas_energoefektivitates_klase — energy class: A B C D E F G
//  27  Primara_kopeja_energija — total primary energy kWh/m²/year
//  34  Oglekla_dioksida_emisijas_novertejums_kg_co_2_m_2 — CO2 kg/m²/year
//
// Note: BVKB functions transferred to EVA (Energētikas un vides aģentūra) in Feb 2025,
//       but data continues to publish under the same dataset on data.gov.lv.
// Note: BVKB_DATA_URL includes the date in the filename. When VZD updates the file,
//       update the URL in GitHub Secrets or .env.local.

const COL = {
  DOC_NR:          0,
  STATUS:          2,
  CERT_DATE:       3,
  CADASTRAL:      11,
  RENOVATION_YEAR: 14,
  HEATING_ENERGY:  20,
  ENERGY_CLASS:   25,
  PRIMARY_ENERGY:  27,
  CO2_KG_M2:      34,
} as const

const VALID_STATUS = 'Ir spēkā'
const VALID_CLASSES = new Set<string>(['A', 'B', 'C', 'D', 'E', 'F', 'G'])

function parseDecimal(raw: string | undefined): number | null {
  if (!raw || raw.trim() === '' || raw.trim() === 'N/A') return null
  const n = parseFloat(raw.trim())
  return isNaN(n) ? null : n
}

function parseYear(raw: string | undefined): number | null {
  if (!raw || raw.trim() === '' || raw.trim() === 'N/A') return null
  const n = parseInt(raw.trim(), 10)
  return (isNaN(n) || n < 1900 || n > 2100) ? null : n
}

function parseCertDate(raw: string | undefined): Date | null {
  if (!raw || raw.trim() === '') return null
  const d = new Date(raw.trim())
  return isNaN(d.getTime()) ? null : d
}

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

async function syncBvkb() {
  const url = process.env.BVKB_DATA_URL
  if (!url) {
    console.error('BVKB_DATA_URL env var not set')
    process.exit(1)
  }

  const tmpDir  = makeTempDir('bvkb')
  const csvPath = join(tmpDir, 'energosertifikati.csv')

  try {
    console.log('Downloading BVKB energy certificate data...')
    const res = await fetch(url)
    if (!res.ok) throw new Error(`BVKB fetch failed: ${res.status}`)
    await pipeline(Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(csvPath))
    console.log('Download complete.')

    let updated   = 0
    let expired   = 0
    let skipped   = 0
    let firstLine = true

    const rl = createInterface({ input: createReadStream(csvPath, { encoding: 'utf-8' }) })

    for await (const rawLine of rl) {
      // Strip UTF-8 BOM from first line, then skip header
      const line = firstLine ? rawLine.replace(/^﻿/, '') : rawLine
      if (firstLine) { firstLine = false; continue } // skip header row

      if (!line.trim()) continue

      const cols = parseCSVRow(line)
      if (cols.length < 35) { skipped++; continue }

      // Only process currently valid certificates
      const status = cols[COL.STATUS]?.trim()
      if (status !== VALID_STATUS) { expired++; continue }

      const rawClass = cols[COL.ENERGY_CLASS]?.trim().toUpperCase()
      if (!rawClass || !VALID_CLASSES.has(rawClass)) { skipped++; continue }

      // Cadastral field may contain a single code or be empty
      const cadastralRaw = cols[COL.CADASTRAL]?.trim()
      if (!cadastralRaw) { skipped++; continue }

      // Normalise: strip quotes, take first code if semicolon-separated
      const cadastralCode = cadastralRaw.replace(/^"|"$/g, '').split(';')[0].trim()
      if (!cadastralCode) { skipped++; continue }

      await prisma.building.updateMany({
        where: { cadastralCode },
        data: {
          energyClass:        rawClass as EnergyClass,
          heatingEnergyKwhM2: parseDecimal(cols[COL.HEATING_ENERGY]),
          renovationYear:     parseYear(cols[COL.RENOVATION_YEAR]),
          bvkbCertDate:       parseCertDate(cols[COL.CERT_DATE]),
          primaryEnergyKwhM2: parseDecimal(cols[COL.PRIMARY_ENERGY]),
          co2KgM2:            parseDecimal(cols[COL.CO2_KG_M2]),
          bvkbUpdatedAt:      new Date(),
        },
      })

      updated++
      if (updated % 500 === 0) console.log(`Updated ${updated} energy classes...`)
    }

    console.log(`BVKB sync complete. Updated: ${updated}, expired skipped: ${expired}, invalid skipped: ${skipped}.`)

  } finally {
    if (KEEP) {
      console.log(`Temp files kept at: ${tmpDir}`)
    } else {
      rmSync(tmpDir, { recursive: true, force: true })
    }
  }

  await prisma.$disconnect()
}

syncBvkb().catch((e) => {
  console.error(e)
  process.exit(1)
})
