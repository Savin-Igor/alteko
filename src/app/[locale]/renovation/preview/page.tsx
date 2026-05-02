import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'
import { PageHeader, InfoBanner } from '@/components/ui'

interface Props {
  searchParams: Promise<{ buildingId?: string }>
}

const SEGMENT_SAVINGS: Record<string, number> = {
  G: 160, F: 140, E: 100, D: 70, C: 40,
}

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
    },
  })
  if (!building) notFound()

  const t = await getTranslations('renovation.preview')

  const cls = building.energyClass ?? 'F'
  const avgSavings = SEGMENT_SAVINGS[cls] ?? 120
  const savingsPerApt = building.apartmentCount
    ? Math.round(avgSavings / building.apartmentCount)
    : null
  const paybackRange = (cls === 'G' || cls === 'F') ? '8–14' : '12–18'
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

        <div className="card text-center py-6 space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            {t('avgSavingsLabel')}
          </p>
          <p className="text-metric-xl text-success">{t('avgSavingsValue', { amount: avgSavings })}</p>
          <p className="text-sm text-gray-500">{t('wholeBuilding')}</p>
          {savingsPerApt && (
            <p className="text-sm font-medium text-success mt-1">
              {t('perApartment', { amount: savingsPerApt })}
            </p>
          )}
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
