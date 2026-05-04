import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtempSync, rmSync, createWriteStream, createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { execFileSync } from 'node:child_process'
import { prisma } from '../src/lib/prisma'

// VZD Building.ZIP — weekly open data, CC-BY-4.0
// Dataset: https://data.gov.lv/dati/dataset/kadastra-informacijas-sistemas-atvertie-dati
// Schema:  BuildingFullData.xsd (from AD_XSDshemas ZIP on same dataset page)
//
// ZIP contains 3 XML files (one per territory group), each with <BuildingItemData> records.
//
// Key fields extracted per building (from BuildingBasicData):
//   BuildingCadastreNr  — real 14-digit cadastral code (e.g. "01001202186005")
//   VARISCode           — VAR address code (minOccurs=0); matches Building.vzdId from sync-vzd
//   BuildingArea        — total area m² (Kopējā platība)
//   BuildingGroundFloors— above-ground floor count
//   BuildingPregCount   — apartment/premise group count
//   BuildingExploitYear — construction year (xs:gYear, e.g. "1960")
//   BuildingMaterialKind > MaterialKindName — wall material (primary source, Ārsienu materiāls)
//
// Wall material fallback: if BuildingMaterialKind is empty, read ConstructionDataList
//   where BuildingElementName = "Sienas (vertikālā konstrukcija)".
//
// Upsert strategy (handles VAR:xxx → real code migration):
//   1. If VARISCode present, try updateMany where vzdId = VARISCode → updates cadastralCode
//   2. If not found (building not in VAR yet), upsert by real cadastralCode

const TAG_OPEN  = '<BuildingItemData>'
const TAG_CLOSE = '</BuildingItemData>'
const BATCH_SIZE = 200
const LOG_EVERY  = 10_000

interface ParsedBuilding {
  cadastralCode:   string
  vzdId:           string | null
  totalAreaM2:     number | null
  floorCount:      number | null
  apartmentCount:  number | null
  constructionYear:number | null
  wallMaterial:    string | null
}

function extractTag(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}>([^<]*)<\/${tag}>`))
  return m?.[1]?.trim() || null
}

function extractWallMaterial(xml: string): string | null {
  // Primary: top-level BuildingMaterialKind > MaterialKindName (Ārsienu materiāls)
  const mkBlock = xml.match(/<BuildingMaterialKind>([\s\S]*?)<\/BuildingMaterialKind>/)
  if (mkBlock) {
    const mk = mkBlock[1].match(/<MaterialKindName>([^<]+)<\/MaterialKindName>/)
    if (mk?.[1]?.trim()) return mk[1].trim()
  }

  // Fallback: ConstructionDataList for "Sienas (vertikālā konstrukcija)"
  const lists = [...xml.matchAll(/<ConstructionDataList>([\s\S]*?)<\/ConstructionDataList>/g)]
  for (const [, block] of lists) {
    if (block.includes('Sienas (vertikālā konstrukcija)')) {
      const mk = block.match(/<MaterialKindName>([^<]+)<\/MaterialKindName>/)
      return mk?.[1]?.trim() || null
    }
  }
  return null
}

function parseRecord(xml: string): ParsedBuilding | null {
  const cadastralCode = extractTag(xml, 'BuildingCadastreNr')
  if (!cadastralCode) return null

  const yearRaw = extractTag(xml, 'BuildingExploitYear')

  return {
    cadastralCode,
    vzdId:           extractTag(xml, 'VARISCode'),
    totalAreaM2:     parseFloat(extractTag(xml, 'BuildingArea')  ?? '') || null,
    floorCount:      parseInt(extractTag(xml, 'BuildingGroundFloors') ?? '', 10) || null,
    apartmentCount:  parseInt(extractTag(xml, 'BuildingPregCount')    ?? '', 10) || null,
    // BuildingExploitYear is xs:gYear — may be "1960" or "1960-01-01"; take first 4 chars
    constructionYear: yearRaw ? (parseInt(yearRaw.slice(0, 4), 10) || null) : null,
    wallMaterial:    extractWallMaterial(xml),
  }
}

async function processBatch(batch: ParsedBuilding[]): Promise<{migrated: number, created: number}> {
  let migrated = 0
  let created = 0

  await Promise.all(batch.map(async (b) => {
    const fields = {
      constructionYear: b.constructionYear ?? undefined,
      totalAreaM2:      b.totalAreaM2      ?? undefined,
      apartmentCount:   b.apartmentCount   ?? undefined,
      floorCount:       b.floorCount       ?? undefined,
      wallMaterial:     b.wallMaterial     ?? undefined,
    }

    // Step 1: update existing VAR:xxx building by vzdId → replaces surrogate with real code
    if (b.vzdId) {
      const { count } = await prisma.building.updateMany({
        where: { vzdId: b.vzdId },
        data:  { cadastralCode: b.cadastralCode, ...fields },
      })
      if (count > 0) { migrated++; return }
    }

    // Step 2: upsert by real cadastralCode (new building not yet in VAR)
    await prisma.building.upsert({
      where:  { cadastralCode: b.cadastralCode },
      create: { cadastralCode: b.cadastralCode, address: '', vzdId: b.vzdId, ...fields },
      update: { vzdId: b.vzdId ?? undefined, ...fields },
    })
    created++
  }))

  return { migrated, created }
}

async function processXmlFile(
  xmlPath: string,
  label:   string,
): Promise<{migrated: number, created: number}> {
  let buffer   = ''
  let total    = 0
  let migrated = 0
  let created  = 0
  let batch:   ParsedBuilding[] = []

  const flush = async () => {
    if (batch.length === 0) return
    const toProcess = batch.splice(0)
    const result = await processBatch(toProcess)
    migrated += result.migrated
    created  += result.created
    total    += toProcess.length
    if (total % LOG_EVERY === 0) {
      console.log(`  [${label}] processed ${total.toLocaleString()}...`)
    }
  }

  const stream = createReadStream(xmlPath, { encoding: 'utf-8', highWaterMark: 512 * 1024 })

  for await (const chunk of stream as AsyncIterable<string>) {
    buffer += chunk

    let closeIdx: number
    while ((closeIdx = buffer.indexOf(TAG_CLOSE)) !== -1) {
      const end    = closeIdx + TAG_CLOSE.length
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
  console.log(`  [${label}] done — migrated: ${migrated}, created: ${created}`)
  return { migrated, created }
}

async function syncBuildings() {
  const url = process.env.VZD_BUILDING_ZIP_URL
  if (!url) { console.error('VZD_BUILDING_ZIP_URL not set'); process.exit(1) }

  const tmpDir = mkdtempSync(join(tmpdir(), 'alteko-buildings-'))
  const zipPath = join(tmpDir, 'building.zip')

  try {
    console.log('Downloading Building.ZIP...')
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`)
    await pipeline(Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(zipPath))
    console.log(`Downloaded: ${(res.headers.get('content-length') ?? '?')} bytes`)

    console.log('Extracting XML files...')
    execFileSync('unzip', ['-o', '-q', zipPath, '-d', tmpDir])

    // Locate all extracted XML files
    const xmlFiles = execFileSync('find', [tmpDir, '-name', '*.xml', '-not', '-name', '*.xsd'])
      .toString().trim().split('\n').filter(Boolean)

    console.log(`Found ${xmlFiles.length} XML file(s)`)

    let totalMigrated = 0
    let totalCreated  = 0

    for (const xmlFile of xmlFiles) {
      const label = xmlFile.replace(tmpDir, '').replace(/^\//, '').split('/').slice(-2).join('/')
      console.log(`\nProcessing ${label}...`)
      const result = await processXmlFile(xmlFile, label.slice(0, 7))
      totalMigrated += result.migrated
      totalCreated  += result.created
    }

    console.log('\nBuilding.ZIP sync complete.')
    console.log(`  Migrated VAR:xxx → real cadastralCode: ${totalMigrated.toLocaleString()}`)
    console.log(`  Created (not in VAR):                  ${totalCreated.toLocaleString()}`)
    console.log(`  Total processed:                       ${(totalMigrated + totalCreated).toLocaleString()}`)

  } finally {
    if (process.env.KEEP_TEMP_FILES === 'true') {
      console.log(`Temp files kept at: ${tmpDir}`)
    } else {
      rmSync(tmpDir, { recursive: true, force: true })
    }
  }

  await prisma.$disconnect()
}

syncBuildings().catch((e) => { console.error(e); process.exit(1) })
