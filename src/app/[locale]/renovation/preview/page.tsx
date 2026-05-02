import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'
import { PageHeader, InfoBanner } from '@/components/ui'

interface Props {
  searchParams: Promise<{ buildingId?: string }>
}

// Heating consumption before renovation, kWh/m²/year, by energy class.
// Source: docs/research/building-series-energy-benchmarks.md
// (ALTUM portfolio data, University of Latvia 2023)
const HEATING_KWH_PER_M2_BEFORE: Record<string, number> = {
  G: 220, F: 160, E: 110, D: 80, C: 55, B: 45, A: 30,
}

// Average post-renovation heating consumption — ALTUM 627 buildings, 2023
const HEATING_KWH_PER_M2_AFTER = 54

// Latvia district heating average end-user price 2024-2025, EUR/kWh
const PRICE_PER_KWH = 0.085

const PAYBACK_FAST_CLASSES = new Set(['G', 'F'])

export default async function RenovationPreviewPage({ searchParams }: Props) {
  const { buildingId } = await searchParams
  if (!buildingId) notFound()

  const building = await prisma.building.findUnique({
    where: { id: buildingId },
    select: {
      address: true,
      series: true,
      energyClass: true,
      apartmentCount: true,
      totalAreaM2: true,
    },
  })
  if (!building) notFound()

  const t = await getTranslations('renovation.preview')

  const cls = building.energyClass ?? 'F'
  const before = HEATING_KWH_PER_M2_BEFORE[cls] ?? 110
  const savedKwhPerM2Year = Math.max(before - HEATING_KWH_PER_M2_AFTER, 0)
  const savedPct = Math.round((savedKwhPerM2Year / before) * 100)
  const eurPerM2Year = savedKwhPerM2Year * PRICE_PER_KWH

  // Example apartment savings (annualized monthly)
  const exampleAptSize = building.apartmentCount && building.totalAreaM2
    ? Math.max(Math.round(Number(building.totalAreaM2) / building.apartmentCount), 30)
    : 60
  const exampleMonthlySavings = Math.round((exampleAptSize * eurPerM2Year) / 12)
  const eurPerM2MonthRounded = (eurPerM2Year / 12).toFixed(2)

  const paybackRange = PAYBACK_FAST_CLASSES.has(cls) ? '8–14' : '12–18'
  const shortAddress = building.address.split(',')[0]

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader variant="minimal" />

      <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full space-y-5">
        <div>
          <p className="text-sm text-gray-500 mb-1">
            {building.series ? t('seriesPrefix', { series: building.series }) : t('yourBuilding')}
            {cls && ` · ${t('classLabel', { label: cls })}`}
          </p>
          <h1 className="text-xl font-bold text-gray-900 leading-snug">
            {building.series ? t('headingWithSeries', { series: building.series }) : t('headingGeneric')}
          </h1>
        </div>

        <div className="card text-center py-6 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {t('avgSavingsLabel')}
          </p>
          <p className="text-metric-xl text-success">~{savedPct}%</p>
          <p className="text-sm text-gray-500">{t('savingsCaption')}</p>
          <div className="border-t border-gray-100 pt-3 mt-3 space-y-1 text-sm text-gray-700">
            <p>{t('exampleLine', { size: exampleAptSize, amount: exampleMonthlySavings })}</p>
            <p className="text-xs text-gray-400">{t('perM2Line', { rate: eurPerM2MonthRounded })}</p>
          </div>
        </div>

        <div className="card space-y-3">
          <p className="text-sm font-semibold text-gray-700">{t('financingTitle')}</p>
          {[
            { label: t('subsidyLabel'), value: t('subsidyValue'), color: 'text-primary' },
            { label: t('paybackLabel'), value: t('paybackValue', { range: paybackRange }), color: 'text-gray-900' },
            { label: t('valueGrowthLabel'), value: t('valueGrowthValue'), color: 'text-success' },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{row.label}:</span>
              <span className={`font-medium ${row.color}`}>{row.value}</span>
            </div>
          ))}
        </div>

        <InfoBanner variant="info">
          {t('infoNotePrefix')}
          <span className="font-medium">{shortAddress}</span>
          {t('infoNoteSuffix')}
        </InfoBanner>

        <div className="space-y-3">
          <Link
            href={`/renovation/calculate?buildingId=${buildingId}`}
            className="btn-primary text-center block"
          >
            {t('ctaCalculate', { address: shortAddress })}
          </Link>
          <Link
            href="/blog/subsidiya-altum-renovaciya-2025"
            className="block text-center text-sm text-primary hover:underline py-2"
          >
            {t('howAltum')}
          </Link>
        </div>

        <p className="text-xs text-gray-400 text-center">
          {t('sourcesNote')}
        </p>
      </main>
    </div>
  )
}
