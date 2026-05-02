import { prisma } from '../src/lib/prisma'
import type { EnergyClass } from '@prisma/client'

// BVKB Energy Certificates — daily sync from data.gov.lv
// JSON format: [{ cadastralCode: string, energyClass: string }, ...]
async function syncBvkb() {
  const url = process.env.BVKB_DATA_URL
  if (!url) {
    console.error('BVKB_DATA_URL env var not set')
    process.exit(1)
  }

  console.log('Fetching BVKB energy certificate data...')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`BVKB fetch failed: ${res.status}`)

  const records: Array<{ cadastralCode: string; energyClass: string }> = await res.json()
  const validClasses = new Set<string>(['A', 'B', 'C', 'D', 'E', 'F', 'G'])

  let updated = 0
  let skipped = 0

  for (const record of records) {
    if (!record.cadastralCode || !record.energyClass) {
      skipped++
      continue
    }

    const cls = record.energyClass.toUpperCase()
    if (!validClasses.has(cls)) {
      skipped++
      continue
    }

    await prisma.building.updateMany({
      where: { cadastralCode: record.cadastralCode },
      data: {
        energyClass: cls as EnergyClass,
        bvkbUpdatedAt: new Date(),
      },
    })

    updated++
    if (updated % 500 === 0) {
      console.log(`Updated ${updated} energy classes...`)
    }
  }

  console.log(`BVKB sync complete. Updated: ${updated}, skipped: ${skipped}.`)
  await prisma.$disconnect()
}

syncBvkb().catch((e) => {
  console.error(e)
  process.exit(1)
})
