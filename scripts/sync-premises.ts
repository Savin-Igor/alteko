import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtempSync, mkdirSync, rmSync, createWriteStream, createReadStream } from 'node:fs'
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

// VZD PremiseGroup data — apartment-level records, CC-BY-4.0
// Dataset: https://data.gov.lv/dati/dataset/kadastra-informacijas-sistemas-atvertie-dati
// XSD: PremiseGroupFullData.xsd (in AD_XSDshemas ZIP on the same dataset page)
//
// Downloads VZD_PREMISE_GROUP_URL (separate PremiseGroup.ZIP) if set,
// otherwise falls back to VZD_BUILDING_ZIP_URL (Building.ZIP may include PremiseGroup XML files).
//
// XML structure per record:
//   <PremiseGroupItemData>
//     <PremiseGroupBasicData>
//       <PremiseGroupCadastreNr>01001202186005004</PremiseGroupCadastreNr>  ← 17 chars
//       <VARISCode>101849343</VARISCode>
//       <PremiseGroupUseKind>
//         <PremiseGroupUseKindId>1122</PremiseGroupUseKindId>               ← 1122 = residential apt
//       </PremiseGroupUseKind>
//       <PremiseGroupArea>47.5</PremiseGroupArea>                          ← m²
//       <PremiseGroupFloor>3</PremiseGroupFloor>
//       <PremiseGroupRoomsCount>2</PremiseGroupRoomsCount>                  ← may be absent
//     </PremiseGroupBasicData>
//   </PremiseGroupItemData>
//
// Building link: PremiseGroupCadastreNr.slice(0, 14) = Building.cadastralCode
// Filter:        PremiseGroupUseKindId = 1122 (residential apartments only)
//
// Run after sync-buildings.ts so buildings exist.
// If 0 records found, run KEEP_TEMP_FILES=true npm run sync:premises and inspect the extracted
// XML to confirm element names or update TAG_OPEN/TAG_CLOSE below.

const TAG_OPEN  = '<PremiseGroupItemData>'
const TAG_CLOSE = '</PremiseGroupItemData>'
const BATCH_SIZE = 500
const LOG_EVERY  = 10_000

// Only import residential apartments
const RESIDENTIAL_USE_KIND_ID = 1122

interface ParsedUnit {
  cadastralCode:         string
  buildingCadastralCode: string
  varisCode:             string | null
  useKindId:             number | null
  areaM2:                number | null
  floor:                 number | null
  roomCount:             number | null
}

function extractTag(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}>([^<]*)<\/${tag}>`))
  return m?.[1]?.trim() || null
}

function extractUseKindId(xml: string): number | null {
  const block = xml.match(/<PremiseGroupUseKind>([\s\S]*?)<\/PremiseGroupUseKind>/)
  if (!block) return null
  const id = block[1].match(/<PremiseGroupUseKindId>(\d+)<\/PremiseGroupUseKindId>/)
  return id ? parseInt(id[1], 10) : null
}

function parseRecord(xml: string): ParsedUnit | null {
  const cadastralCode = extractTag(xml, 'PremiseGroupCadastreNr')
  if (!cadastralCode || cadastralCode.length < 14) return null

  const useKindId = extractUseKindId(xml)
  // Skip non-residential if useKindId is present and not 1122
  if (useKindId !== null && useKindId !== RESIDENTIAL_USE_KIND_ID) return null

  // Building code = first 14 chars of the 17-char apartment cadastral code
  const buildingCadastralCode = cadastralCode.slice(0, 14)

  // PremiseGroupFloor may be a range (e.g. "3-4"); take first integer
  const floorRaw = extractTag(xml, 'PremiseGroupFloor')
  const floor = floorRaw ? (parseInt(floorRaw.split('-')[0].trim(), 10) || null) : null

  return {
    cadastralCode,
    buildingCadastralCode,
    varisCode:  extractTag(xml, 'VARISCode'),
    useKindId,
    areaM2:     parseFloat(extractTag(xml, 'PremiseGroupArea') ?? '') || null,
    floor,
    roomCount:  parseInt(extractTag(xml, 'PremiseGroupRoomsCount') ?? '', 10) || null,
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
        varisCode:  u.varisCode,
        useKindId:  u.useKindId,
        areaM2:     u.areaM2,
        floor:      u.floor,
        roomCount:  u.roomCount,
      },
      update: {
        buildingCadastralCode: u.buildingCadastralCode,
        varisCode:  u.varisCode,
        useKindId:  u.useKindId,
        areaM2:     u.areaM2,
        floor:      u.floor,
        roomCount:  u.roomCount,
        syncedAt:   new Date(),
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

  const flush = async () => {
    if (batch.length === 0) return
    const toProcess = batch.splice(0)
    total += await processBatch(toProcess)
    if (total % LOG_EVERY === 0 && total > 0) {
      console.log(`  [${label}] processed ${total.toLocaleString()}...`)
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

    const lastOpen = buffer.lastIndexOf(TAG_OPEN)
    if (lastOpen > 0) buffer = buffer.slice(lastOpen)
  }

  await flush()
  console.log(`  [${label}] done — upserted: ${total.toLocaleString()}`)
  return total
}

async function syncPremises() {
  const url = process.env.VZD_PREMISE_GROUP_URL || process.env.VZD_BUILDING_ZIP_URL
  if (!url) {
    console.error('VZD_PREMISE_GROUP_URL or VZD_BUILDING_ZIP_URL env var not set')
    process.exit(1)
  }

  const usingFallback = !process.env.VZD_PREMISE_GROUP_URL
  if (usingFallback) {
    console.log('VZD_PREMISE_GROUP_URL not set — falling back to VZD_BUILDING_ZIP_URL')
  }

  const tmpDir  = makeTempDir('premises')
  const zipPath = join(tmpDir, usingFallback ? 'building.zip' : 'premisegroup.zip')

  try {
    console.log('Downloading PremiseGroup ZIP...')
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`)
    await pipeline(Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(zipPath))
    console.log(`Downloaded: ${res.headers.get('content-length') ?? '?'} bytes`)

    console.log('Extracting XML files...')
    execFileSync('unzip', ['-o', '-q', zipPath, '-d', tmpDir])

    const xmlFiles = execFileSync('find', [tmpDir, '-name', '*.xml', '-not', '-name', '*.xsd'])
      .toString().trim().split('\n').filter(Boolean)

    console.log(`Found ${xmlFiles.length} XML file(s)`)

    let grandTotal = 0

    for (const xmlFile of xmlFiles) {
      const label = xmlFile.replace(tmpDir, '').replace(/^\//, '').split('/').slice(-2).join('/')
      console.log(`\nProcessing ${label}...`)
      grandTotal += await processXmlFile(xmlFile, label.slice(0, 10))
    }

    console.log('\nPremiseGroup sync complete.')
    console.log(`  Total upserted: ${grandTotal.toLocaleString()}`)

    if (grandTotal === 0) {
      console.warn(
        'WARNING: 0 records found.\n' +
        'Possible causes:\n' +
        '  1. PremiseGroupItemData elements are not in Building.ZIP — set VZD_PREMISE_GROUP_URL\n' +
        '     to the correct PremiseGroup.ZIP URL from the dataset page.\n' +
        '  2. XML element names differ from XSD — run KEEP_TEMP_FILES=true npm run sync:premises\n' +
        '     and inspect the extracted XML to verify TAG_OPEN/TAG_CLOSE constants.'
      )
    }

  } finally {
    if (KEEP) {
      console.log(`Temp files kept at: ${tmpDir}`)
    } else {
      rmSync(tmpDir, { recursive: true, force: true })
    }
  }

  await prisma.$disconnect()
}

syncPremises().catch((e) => { console.error(e); process.exit(1) })
