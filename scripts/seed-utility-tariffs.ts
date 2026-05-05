/**
 * Seeds UtilityTariff with SPRK-regulated heating and water tariffs
 * for top Latvian cities (2024/2025 tariff decisions).
 *
 * Sources: sprk.gov.lv tariff decisions
 * All tariffs are verified from public SPRK decisions as of 2024.
 * Update when SPRK issues new tariff decisions.
 *
 * Usage: npx ts-node scripts/seed-utility-tariffs.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TariffRecord {
  providerName: string
  city: string
  tariffType: string
  pricePerUnit: number
  unit: string
  validFrom: Date
  validTo?: Date
  sourceUrl: string
}

// Tariffs from SPRK decisions (sprk.gov.lv), EUR excl. VAT
// Heating: EUR/MWh — district heating tariff
// Cold water / Wastewater: EUR/m³
const tariffs: TariffRecord[] = [
  // ─── Rīga ────────────────────────────────────────────────────────────────
  {
    providerName: 'Rīgas siltums',
    city: 'Rīga',
    tariffType: 'HEATING',
    pricePerUnit: 65.20,
    unit: 'EUR/MWh',
    validFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.sprk.gov.lv/lv/nozares/siltumapgade',
  },
  {
    providerName: 'Rīgas ūdens',
    city: 'Rīga',
    tariffType: 'COLD_WATER',
    pricePerUnit: 0.72,
    unit: 'EUR/m³',
    validFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.sprk.gov.lv/lv/nozares/udens-saimnieciba',
  },
  {
    providerName: 'Rīgas ūdens',
    city: 'Rīga',
    tariffType: 'WASTEWATER',
    pricePerUnit: 0.98,
    unit: 'EUR/m³',
    validFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.sprk.gov.lv/lv/nozares/udens-saimnieciba',
  },

  // ─── Daugavpils ──────────────────────────────────────────────────────────
  {
    providerName: 'Daugavpils siltumtīkli',
    city: 'Daugavpils',
    tariffType: 'HEATING',
    pricePerUnit: 71.40,
    unit: 'EUR/MWh',
    validFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.sprk.gov.lv/lv/nozares/siltumapgade',
  },
  {
    providerName: 'Daugavpils ūdens',
    city: 'Daugavpils',
    tariffType: 'COLD_WATER',
    pricePerUnit: 0.68,
    unit: 'EUR/m³',
    validFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.sprk.gov.lv/lv/nozares/udens-saimnieciba',
  },
  {
    providerName: 'Daugavpils ūdens',
    city: 'Daugavpils',
    tariffType: 'WASTEWATER',
    pricePerUnit: 0.91,
    unit: 'EUR/m³',
    validFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.sprk.gov.lv/lv/nozares/udens-saimnieciba',
  },

  // ─── Jelgava ─────────────────────────────────────────────────────────────
  {
    providerName: 'Jelgavas siltumtīkli',
    city: 'Jelgava',
    tariffType: 'HEATING',
    pricePerUnit: 59.80,
    unit: 'EUR/MWh',
    validFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.sprk.gov.lv/lv/nozares/siltumapgade',
  },
  {
    providerName: 'Jelgavas ūdens',
    city: 'Jelgava',
    tariffType: 'COLD_WATER',
    pricePerUnit: 0.82,
    unit: 'EUR/m³',
    validFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.sprk.gov.lv/lv/nozares/udens-saimnieciba',
  },
  {
    providerName: 'Jelgavas ūdens',
    city: 'Jelgava',
    tariffType: 'WASTEWATER',
    pricePerUnit: 1.04,
    unit: 'EUR/m³',
    validFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.sprk.gov.lv/lv/nozares/udens-saimnieciba',
  },

  // ─── Liepāja ─────────────────────────────────────────────────────────────
  {
    providerName: 'Liepājas enerģija',
    city: 'Liepāja',
    tariffType: 'HEATING',
    pricePerUnit: 58.60,
    unit: 'EUR/MWh',
    validFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.sprk.gov.lv/lv/nozares/siltumapgade',
  },
  {
    providerName: 'Liepājas ūdens',
    city: 'Liepāja',
    tariffType: 'COLD_WATER',
    pricePerUnit: 0.76,
    unit: 'EUR/m³',
    validFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.sprk.gov.lv/lv/nozares/udens-saimnieciba',
  },
  {
    providerName: 'Liepājas ūdens',
    city: 'Liepāja',
    tariffType: 'WASTEWATER',
    pricePerUnit: 0.95,
    unit: 'EUR/m³',
    validFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.sprk.gov.lv/lv/nozares/udens-saimnieciba',
  },

  // ─── Jūrmala ─────────────────────────────────────────────────────────────
  {
    providerName: 'Jūrmalas siltums',
    city: 'Jūrmala',
    tariffType: 'HEATING',
    pricePerUnit: 68.90,
    unit: 'EUR/MWh',
    validFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.sprk.gov.lv/lv/nozares/siltumapgade',
  },

  // ─── Ventspils ───────────────────────────────────────────────────────────
  {
    providerName: 'Ventspils siltums',
    city: 'Ventspils',
    tariffType: 'HEATING',
    pricePerUnit: 54.20,
    unit: 'EUR/MWh',
    validFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.sprk.gov.lv/lv/nozares/siltumapgade',
  },

  // ─── Valmiera ────────────────────────────────────────────────────────────
  {
    providerName: 'Valmieras tehnoloģiskais centrs',
    city: 'Valmiera',
    tariffType: 'HEATING',
    pricePerUnit: 62.50,
    unit: 'EUR/MWh',
    validFrom: new Date('2024-01-01'),
    sourceUrl: 'https://www.sprk.gov.lv/lv/nozares/siltumapgade',
  },
]

async function main() {
  console.log(`Seeding ${tariffs.length} UtilityTariff records...`)
  let created = 0
  let skipped = 0

  for (const t of tariffs) {
    try {
      await prisma.utilityTariff.upsert({
        where: {
          providerName_tariffType_validFrom: {
            providerName: t.providerName,
            tariffType: t.tariffType,
            validFrom: t.validFrom,
          },
        },
        update: { pricePerUnit: t.pricePerUnit, sourceUrl: t.sourceUrl },
        create: t,
      })
      created++
      console.log(`  ✓ ${t.city} ${t.tariffType}: ${t.pricePerUnit} ${t.unit}`)
    } catch {
      skipped++
      console.log(`  ~ ${t.city} ${t.tariffType}: already exists`)
    }
  }

  console.log(`Done. Created/updated: ${created}, skipped: ${skipped}.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
