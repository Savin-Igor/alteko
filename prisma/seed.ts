import { PrismaClient, EnergyClass } from '@prisma/client'
import { STUB_BUILDINGS } from '../src/lib/stubs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding stub buildings...')

  for (const b of STUB_BUILDINGS) {
    await prisma.building.upsert({
      where: { cadastralCode: b.cadastralCode },
      create: {
        address:          b.address,
        cadastralCode:    b.cadastralCode,
        series:           b.series,
        constructionYear: b.constructionYear,
        totalAreaM2:      b.totalAreaM2,
        apartmentCount:   b.apartmentCount,
        energyClass:      b.energyClass as EnergyClass,
        district:         b.district,
        lat:              b.lat,
        lon:              b.lon,
      },
      update: {
        series:           b.series,
        constructionYear: b.constructionYear,
        energyClass:      b.energyClass as EnergyClass,
      },
    })
    console.log(`  ✓ ${b.address}`)
  }

  console.log('Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
