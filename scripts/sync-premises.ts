import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtempSync, mkdirSync, rmSync, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { execFileSync } from 'node:child_process'
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

// VZD Building.ZIP — PremiseGroup (apartment unit) records
// Same ZIP as sync-buildings.ts (VZD_BUILDING_ZIP_URL), CC-BY-4.0
// Dataset: https://data.gov.lv/dati/dataset/kadastra-informacijas-sistemas-atvertie-dati
//
// Each XML file in the ZIP contains <PremiseGroupItemData> elements alongside <BuildingItemData>.
// This script reads only the PremiseGroup elements.
//
// XML fields extracted per apartment unit (from PremiseGroupBasicData / similar):
//   PremiseCadastreNr      — apartment's cadastral code (unique identifier)
//   BuildingCadastreNr     — parent building cadastral code
//   PremiseTotalArea       — usable area m²
//   PremiseFloor           — floor number (may be a range; we take the first integer)
//   PremiseRoomsCount      — number of rooms
//
// WARNING: If the script reports 0 records, the element tag name may differ
// in the actual XML from what the XSD schema suggests. Verify by running:
//   KEEP_TEMP_FILES=true npm run sync:premises
// then inspecting the extracted XML file for the correct element name and
// updating TAG_OPEN / TAG_CLOSE constants below accordingly.

const TAG_OPEN  = '<PremiseGroupItemData>'
const TAG_CLOSE = '</PremiseGroupItemData>'
const BATCH_SIZE = 500
const LOG_EVERY  = 10_000

interface ParsedUnit {
  cadastralCode:         string
  buildingCadastralCode: string
  areaM2:                number | null
  floor:                 number | null
  roomCount:             number | null
}

function extractTag(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}>([^<]*)<\/${tag}>`))
  return m?.[1]?.trim() || null
}

function parseRecord(xml: string): ParsedUnit | null {
  const cadastralCode = extractTag(xml, 'PremiseCadastreNr')
  if (!cadastralCode) return null

  const buildingCadastralCode = extractTag(xml, 'BuildingCadastreNr')
  if (!buildingCadastralCode) return null

  // PremiseFloor may be a range (e.g. "3" or "3-4"); take the first integer
  const floorRaw = extractTag(xml, 'PremiseFloor')
  const floor = floorRaw ? (parseInt(floorRaw.split('-')[0].trim(), 10) || null) : null

  return {
    cadastralCode,
    buildingCadastralCode,
    areaM2:    parseFloat(extractTag(xml, 'PremiseTotalArea') ?? '') || null,
    floor,
    roomCount: parseInt(extractTag(xml, 'PremiseRoomsCount') ?? '', 10) || null,
  }
}

async function processBatch(batch: ParsedUnit[]): Promise<number> {
  let upserted = 0
  await Promise.all(batch.map(async (u) => {
    await prisma.buildingUnit.upsert({
      where: { cadastralCode: u.cadastralCode },
      create: {
        cadastralCode:         u.cadastralCode,
        buildingCadastralCode: u.buildingCadastralCode,
        areaM2:    u.areaM2,
        floor:     u.floor,
        roomCount: u.roomCount,
      },
      update: {
        buildingCadastralCode: u.buildingCadastralCode,
        areaM2:    u.areaM2,
        floor:     u.floor,
        roomCount: u.roomCount,
        syncedAt:  new Date(),
      },
    })
    upserted++
  }))
  return upserted
}

async function processXmlFile(xmlPath: string, label: string): Promise<number> {
  let buffer  = ''
  let total   = 0
  let batch:  ParsedUnit[] = []

  const { createReadStream } = await import('node:fs')

  const flush = async () => {
    if (batch.length === 0) return
    const toProcess = batch.splice(0)
    total += await processBatch(toProcess)
    if (total % LOG_EVERY === 0 && total > 0) {
      console.log(`[backend]   [${label}] processed ${total.toLocaleString()}...`)
    }
  }

  const stream = createReadStream(xmlPath, { encoding: 'utf-8', highWaterMark: 512 * 1024 })

  for await (const chunk of stream as AsyncIterable<string>) {
    buffer += chunk

    let closeIdx: number
    while ((closeIdx = buffer.indexOf(TAG_CLOSE)) !== -1) {
      const end     = closeIdx + TAG_CLOSE.length
      const openIdx = buffer.lastIndexOf(TAG_OPEN, closeIdx)
      if (openIdx === -1) { buffer = buffer.slice(end); continue }

      const parsed = parseRecord(buffer.slice(openIdx, end))
      buffer = buffer.slice(end)

      if (parsed) {
        batch.push(parsed)
        if (batch.length >= BATCH_SIZE) await flush()
      }
    }

    // Trim consumed portion — keep only from the last incomplete open tag
    const lastOpen = buffer.lastIndexOf(TAG_OPEN)
    if (lastOpen > 0) buffer = buffer.slice(lastOpen)
  }

  await flush()
  console.log(`[backend]   [${label}] done — upserted: ${total.toLocaleString()}`)
  return total
}

async function syncPremises() {
  const url = process.env.VZD_BUILDING_ZIP_URL
  if (!url) {
    console.error('[backend] VZD_BUILDING_ZIP_URL env var not set')
    process.exit(1)
  }

  const tmpDir  = makeTempDir('premises')
  const zipPath = join(tmpDir, 'building.zip')

  try {
    console.log('[backend] Downloading Building.ZIP for premise data...')
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`)
    await pipeline(Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(zipPath))
    console.log(`[backend] Downloaded: ${res.headers.get('content-length') ?? '?'} bytes`)

    console.log('[backend] Extracting XML files...')
    execFileSync('unzip', ['-o', '-q', zipPath, '-d', tmpDir])

    const xmlFiles = execFileSync('find', [tmpDir, '-name', '*.xml', '-not', '-name', '*.xsd'])
      .toString().trim().split('\n').filter(Boolean)

    console.log(`[backend] Found ${xmlFiles.length} XML file(s)`)

    let grandTotal = 0

    for (const xmlFile of xmlFiles) {
      const label = xmlFile.replace(tmpDir, '').replace(/^\//, '').split('/').slice(-2).join('/')
      console.log(`\n[backend] Processing ${label}...`)
      grandTotal += await processXmlFile(xmlFile, label.slice(0, 7))
    }

    console.log('\n[backend] PremiseGroup sync complete.')
    console.log(`[backend]   Total upserted: ${grandTotal.toLocaleString()}`)

    if (grandTotal === 0) {
      console.warn(
        '[backend] WARNING: 0 records found. The PremiseGroupItemData tag name may differ' +
        ' in the actual XML. Run with KEEP_TEMP_FILES=true and inspect the extracted XML' +
        ' to find the correct element name, then update TAG_OPEN/TAG_CLOSE in this script.'
      )
    }

  } finally {
    if (KEEP) {
      console.log(`[backend] Temp files kept at: ${tmpDir}`)
    } else {
      rmSync(tmpDir, { recursive: true, force: true })
    }
  }

  await prisma.$disconnect()
}

syncPremises().catch((e) => { console.error(e); process.exit(1) })
