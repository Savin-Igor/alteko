import { prisma } from '../src/lib/prisma'
import type { EnergyClass } from '@prisma/client'

// BVKB Energy Certificates — synced from data.gov.lv (daily updates)
// Dataset: https://data.gov.lv/dati/eng/dataset/bis_ygdi8jmgg-bneuijz7wiwq
// Spec:    https://www.bvkb.gov.lv/en/services/energy-certificate-registry-data-building
//
// File: eku-energosertifikati-DD.MM.YYYY.csv — CSV, comma-separated, UTF-8 BOM
// Column index → field (0-based, after stripping BOM from header):
//   0  Dokumenta_numurs      — certificate document number
//   2  Statuss               — "Ir spēkā" (valid) | "Zaudējis spēku" (expired)
//   3  Izdosanas_datums      — issue date
//   4  Deriguma_termins      — expiry date
//  11  Objektu_identificejosie_kadastra_apzimejumi — cadastral code(s)
//  25  Ekas_energoefektivitates_klase — energy class: A B C D E F G
//
// Note: BVKB functions transferred to EVA (Energētikas un vides aģentūra) in Feb 2025,
//       but data continues to publish under the same dataset on data.gov.lv.
// Note: BVKB_DATA_URL includes the date in the filename. When VZD updates the file,
//       update the URL in GitHub Secrets or .env.local.

const COL = {
  DOC_NR: 0,
  STATUS: 2,
  CADASTRAL: 11,
  ENERGY_CLASS: 25,
} as const

const VALID_STATUS = 'Ir spēkā'
const VALID_CLASSES = new Set<string>(['A', 'B', 'C', 'D', 'E', 'F', 'G'])

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

  console.log('Fetching BVKB energy certificate data...')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`BVKB fetch failed: ${res.status}`)

  const text = await res.text()
  // Strip UTF-8 BOM
  const stripped = text.startsWith('﻿') ? text.slice(1) : text
  const lines = stripped.split('\n')
  const dataLines = lines.slice(1) // skip header

  let updated = 0
  let expired = 0
  let skipped = 0

  for (const line of dataLines) {
    if (!line.trim()) continue

    const cols = parseCSVRow(line)
    if (cols.length < 26) { skipped++; continue }

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
        energyClass: rawClass as EnergyClass,
        bvkbUpdatedAt: new Date(),
      },
    })

    updated++
    if (updated % 500 === 0) {
      console.log(`Updated ${updated} energy classes...`)
    }
  }

  console.log(`BVKB sync complete. Updated: ${updated}, expired skipped: ${expired}, invalid skipped: ${skipped}.`)
  await prisma.$disconnect()
}

syncBvkb().catch((e) => {
  console.error(e)
  process.exit(1)
})
