import { prisma } from '../src/lib/prisma'

// VZD Building data — weekly sync from data.gov.lv
// CSV format: adr_cd;adr_teksts;koord_x;koord_y;varis_cd
async function syncVzd() {
  const url = process.env.VZD_DATA_URL
  if (!url) {
    console.error('VZD_DATA_URL env var not set')
    process.exit(1)
  }

  console.log('Fetching VZD building data...')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`VZD fetch failed: ${res.status}`)

  const text = await res.text()
  const lines = text.split('\n').slice(1) // skip header

  let upserted = 0
  let skipped = 0

  for (const line of lines) {
    const parts = line.split(';')
    if (parts.length < 4) {
      skipped++
      continue
    }
    const [adrCd, adrTeksts, koordX, koordY, varisCd] = parts
    if (!adrCd?.trim() || !adrTeksts?.trim()) {
      skipped++
      continue
    }

    await prisma.building.upsert({
      where: { cadastralCode: adrCd.trim() },
      create: {
        cadastralCode: adrCd.trim(),
        address: adrTeksts.trim(),
        vzdId: varisCd?.trim() || null,
        lat: koordY?.trim() ? parseFloat(koordY) : null,
        lon: koordX?.trim() ? parseFloat(koordX) : null,
        vzdUpdatedAt: new Date(),
      },
      update: {
        address: adrTeksts.trim(),
        vzdId: varisCd?.trim() || null,
        lat: koordY?.trim() ? parseFloat(koordY) : null,
        lon: koordX?.trim() ? parseFloat(koordX) : null,
        vzdUpdatedAt: new Date(),
      },
    })

    upserted++
    if (upserted % 1000 === 0) {
      console.log(`Upserted ${upserted} buildings...`)
    }
  }

  console.log(`VZD sync complete. Upserted: ${upserted}, skipped: ${skipped}.`)
  await prisma.$disconnect()
}

syncVzd().catch((e) => {
  console.error(e)
  process.exit(1)
})
