import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'
import { compareWithBenchmark } from '@/lib/benchmarks/compare'
import { SiteHeader } from '@/components/ui/SiteHeader'

interface Props {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: Props) {
  const { token } = await params

  const t = await getTranslations('share')

  const building = await prisma.building.findUnique({
    where: { id: token },
    select: {
      id: true,
      cadastralCode: true,
      address: true,
      series: true,
      constructionYear: true,
      energyClass: true,
      _count: { select: { reports: true } },
    },
  })

  const latestReport = building
    ? await prisma.expenseReport.findFirst({
        where: { buildingId: building.id, status: 'PROCESSED' },
        orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
      })
    : null

  const benchmark = latestReport ? await compareWithBenchmark(latestReport.id) : null
  const deviation = benchmark?.overallDeviationPct ?? null

  if (!building) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 px-4 py-16 max-w-md mx-auto w-full text-center space-y-4">
          <p className="text-gray-500">{t('linkExpired')}</p>
          <Link href="/" className="btn-primary block">{t('findHome')}</Link>
        </main>
      </div>
    )
  }

  const hasData = !!latestReport && deviation !== null
  const isOverpaying = hasData && deviation! > 10
  const isNormal = hasData && deviation! <= 10

  const buildingMeta = [
    building.series ? t('seriesPrefix', { series: building.series }) : null,
    building.constructionYear ? t('yearSuffix', { year: building.constructionYear }) : null,
    building.energyClass ? t('classLabel', { class: building.energyClass }) : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full space-y-5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9 3.5 10.5l.5-3.5L1.5 4.5 5 4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          {t('neighborShared')}
        </div>

        <div>
          <h1 className="text-xl font-bold text-gray-900">{building.address}</h1>
          {buildingMeta && (
            <p className="text-sm text-gray-500 mt-1">{buildingMeta}</p>
          )}
        </div>

        {!hasData && (
          <div className="card text-center py-6 space-y-2">
            <p className="text-sm text-gray-500 font-medium">
              {t('noDataYet')}
            </p>
            <p className="text-xs text-gray-400">{t('beFirst')}</p>
          </div>
        )}

        {isNormal && (
          <div className="card bg-success-light border-green-200 text-center py-5 space-y-1">
            <p className="text-success font-semibold">{t('normalLabel')}</p>
            <p className="text-sm text-gray-600">{t('normalDesc')}</p>
          </div>
        )}

        {isOverpaying && deviation !== null && (
          <div className="card bg-danger-light border-red-200 space-y-2">
            <p className="text-sm text-gray-600">{t('overpayLabel')}</p>
            <p className="text-metric-xl text-danger">
              {deviation > 0 ? '+' : ''}{deviation}%
            </p>
            <p className="text-sm text-gray-500">{t('comparedTo')}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href={`/building/${building.cadastralCode}`}
            className="btn-primary text-center block"
          >
            {t('uploadCta')}
          </Link>
          <p className="text-center text-xs text-gray-400">
            {t('ctaNote')}
          </p>
        </div>

        <div className="border-t border-gray-100 pt-4 text-center">
          <p className="text-xs text-gray-400">
            {t('differentBuilding')}{' '}
            <Link href="/" className="text-primary hover:underline">
              {t('findYour')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
