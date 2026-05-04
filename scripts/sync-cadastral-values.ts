/**
 * Annual sync of VZD cadastral values (fiscal + universal) into the CadastralValue table.
 *
 * Source: data.gov.lv — "Fiskālās un universālās kadastrālās vērtības"
 * Dataset: https://data.gov.lv/dati/dataset/fiskalas-un-universalas-kadastralas-vertibas-uz-2025-gada-1-janvari
 * License: CC-BY-4.0
 * Frequency: Annual (new dataset each year on ~1 January)
 *
 * Required env var:
 *   VZD_CADASTRAL_VALUES_URL — direct CSV download URL from dataset page
 *   (example: https://data.gov.lv/dati/dataset/.../download/kv_2025.csv)
 *   If unset — script exits with instructions.
 *
 * CSV format (verified from dataset description):
 *   ; separated, UTF-8 with BOM
 *   Columns: KadApzim; ObjType; FiskalVertiba; UniversalaVertiba; SpekaBut
 *   where KadApzim = cadastral number, SpekaBut = valid from date (YYYY-MM-DD)
 *
 * NOTE: CSV headers must be verified against the actual file on first run.
 * See issue #15 for column mapping confirmation status.
 *
 * Usage: npx ts-node scripts/sync-cadastral-values.ts
 */

import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtempSync, rmSync, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { createInterface } from 'node:readline'
import { createReadStream } from 'node:fs'
import { prisma } from '../src/lib/prisma'

const BATCH_SIZE = 500
const KEEP = process.env.KEEP_TEMP_FILES === 'true'

async function main() {
  const url = process.env.VZD_CADASTRAL_VALUES_URL
  if (!url) {
    console.error(`
ERROR: VZD_CADASTRAL_VALUES_URL is not set.

Find the current year CSV at:
  https://data.gov.lv/dati/dataset/fiskalas-un-universalas-kadastralas-vertibas-uz-2025-gada-1-janvari

Set in .env:
  VZD_CADASTRAL_VALUES_URL="https://data.gov.lv/dati/dataset/.../download/kv_YYYY.csv"
`)
    process.exit(1)
  }

  const tmpDir = KEEP
    ? join(process.cwd(), 'tmp', 'cadastral-values')
    : mkdtempSync(join(tmpdir(), 'alteko-cadastral-'))

  const csvPath = join(tmpDir, 'kv.csv')
  console.log(`Downloading cadastral values CSV...`)

  const res = await fetch(url)
  if (!res.ok || !res.body) throw new Error(`Download failed: ${res.status} ${url}`)

  await pipeline(Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(csvPath))
  console.log('Download complete. Processing...')

  const rl = createInterface({ input: createReadStream(csvPath, 'utf-8'), crlfDelay: Infinity })
  let lineNum = 0
  let imported = 0
  let skipped = 0
  const batch: Parameters<typeof prisma.cadastralValue.upsert>[0]['create'][] = []

  for await (const raw of rl) {
    lineNum++
    // Strip BOM from first line
    const line = lineNum === 1 ? raw.replace(/^﻿/, '') : raw
    if (lineNum === 1) {
      // Verify headers — warn if unexpected
      const headers = line.split(';').map((h) => h.trim())
      console.log(`CSV headers: ${headers.join(', ')}`)
      const expected = ['KadApzim', 'ObjType', 'FiskalVertiba', 'UniversalaVertiba', 'SpekaBut']
      const missing = expected.filter((e) => !headers.includes(e))
      if (missing.length > 0) {
        console.warn(`WARNING: Expected columns not found: ${missing.join(', ')}`)
        console.warn('Column mapping in scripts/sync-cadastral-values.ts may need updating.')
        console.warn('See issue #15.')
      }
      continue
    }

    const cols = line.split(';')
    if (cols.length < 5) { skipped++; continue }

    const [kadApzim, objType, fiskalStr, universalaStr, spekaBut] = cols as [string, string, string, string, string]
    if (!kadApzim?.trim()) { skipped++; continue }

    const fiscalValueEur = fiskalStr?.trim() ? parseFloat(fiskalStr.replace(',', '.')) : null
    const universalValueEur = universalaStr?.trim() ? parseFloat(universalaStr.replace(',', '.')) : null
    const validFrom = spekaBut?.trim() ? new Date(spekaBut.trim()) : new Date('2025-01-01')

    if (isNaN(validFrom.getTime())) { skipped++; continue }

    batch.push({
      cadastralNr: kadApzim.trim(),
      objectType: objType?.trim() ?? 'unknown',
      fiscalValueEur: fiscalValueEur !== null && !isNaN(fiscalValueEur) ? fiscalValueEur : null,
      universalValueEur: universalValueEur !== null && !isNaN(universalValueEur) ? universalValueEur : null,
      validFrom,
    })

    if (batch.length >= BATCH_SIZE) {
      await flushBatch(batch)
      imported += batch.length
      batch.length = 0
      process.stdout.write(`\r  Imported: ${imported}`)
    }
  }

  if (batch.length > 0) {
    await flushBatch(batch)
    imported += batch.length
  }

  console.log(`\nDone. Imported: ${imported}, skipped: ${skipped} (line count: ${lineNum})`)

  if (!KEEP) rmSync(tmpDir, { recursive: true })
  await prisma.$disconnect()
}

async function flushBatch(
  records: Parameters<typeof prisma.cadastralValue.upsert>[0]['create'][]
) {
  await Promise.all(
    records.map((r) =>
      prisma.cadastralValue.upsert({
        where: { cadastralNr_validFrom: { cadastralNr: r.cadastralNr, validFrom: r.validFrom } },
        update: { fiscalValueEur: r.fiscalValueEur, universalValueEur: r.universalValueEur },
        create: r,
      })
    )
  )
}

main().catch((e) => { console.error(e); process.exit(1) })
