import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'
import { compareWithBenchmark } from '@/lib/benchmarks/compare'
import { detectAnomalies } from '@/lib/benchmarks/anomaly'
import { EmailGateForm } from './EmailGateForm'
import { UnlockPersist } from '@/components/UnlockPersist'
import { PageHeader, CategoryRow, StatCard, InfoBanner } from '@/components/ui'

function deviationVariant(pct: number): 'danger' | 'warning' | 'success' {
  if (pct > 20) return 'danger'
  if (pct > 5) return 'warning'
  return 'success'
}

interface Props {
  params: Promise<{ reportId: string }>
  searchParams: Promise<{ unlocked?: string }>
}

export default async function ReportPage({ params, searchParams }: Props) {
  const { reportId } = await params
  const { unlocked } = await searchParams

  const report = await prisma.expenseReport.findUnique({
    where: { id: reportId },
    include: {
      building: true,
      items: true,
    },
  })

  if (!report || report.status !== 'PROCESSED') notFound()

  const t = await getTranslations('audit.report')
  const tCat = await getTranslations('audit.categories')

  const [benchmark, anomalies] = await Promise.all([
    compareWithBenchmark(reportId),
    detectAnomalies(report.buildingId, reportId),
  ])

  const isUnlocked = unlocked === '1'
  const deviation = benchmark?.overallDeviationPct ?? 0
  const annualOverpay = deviation > 0
    ? Math.round((deviation / 100) * report.items.reduce((s, i) => s + Number(i.amountTotal), 0) * 12)
    : 0
  const variant = deviationVariant(deviation)

  function categoryLabel(category: string): string {
    try {
      return tCat(category as 'HEATING' | 'COLD_WATER' | 'HOT_WATER' | 'WASTEWATER' | 'WASTE' | 'CLEANING' | 'REPAIR_FUND' | 'ADMINISTRATION' | 'ELEVATOR' | 'OTHER')
    } catch {
      return category
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://alteko.lv'
  const shareWaText = t('shareMessage', { deviation, url: `${appUrl}/b/${report.buildingId}` })
  const shareTgText = t('shareShortMessage', { deviation })
  const shareTgUrl = `${appUrl}/b/${report.buildingId}`

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader
        variant="breadcrumb"
        backHref={`/building/${report.building.cadastralCode}`}
        backLabel={report.building.address}
      />

      <UnlockPersist reportId={reportId} isUnlocked={isUnlocked} />

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-4">
        <p className="text-sm text-gray-500">
          {t('label')} · {report.periodMonth}.{report.periodYear}
        </p>

        <StatCard
          label={t('summaryLabel')}
          value={`${deviation > 0 ? '+' : ''}${deviation}%`}
          unit={t('summaryUnit')}
          variant={variant}
          size="lg"
          description={annualOverpay > 0 ? t('summaryOverpay', { amount: annualOverpay }) : undefined}
        />

        {!isUnlocked ? (
          <div className="card space-y-4">
            <p className="text-sm font-medium text-gray-700">{t('gateTitle')}</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="status-dot-success mt-1.5" />
                {t('gateBullet1', { count: report.items.length })}
              </li>
              <li className="flex items-start gap-2">
                <span className="status-dot-success mt-1.5" />
                {t('gateBullet2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="status-dot-success mt-1.5" />
                {t('gateBullet3')}
              </li>
              <li className="flex items-start gap-2">
                <span className="status-dot-success mt-1.5" />
                {t('gateBullet4')}
              </li>
            </ul>
            <EmailGateForm reportId={reportId} />
            <p className="text-xs text-gray-400 text-center">
              {t('gateSpamNote')}
            </p>
          </div>
        ) : (
          <>
            {anomalies.length > 0 && (
              <div className="card space-y-2">
                {anomalies.map((a, i) => (
                  <InfoBanner key={i} variant="warning">
                    {categoryLabel(a.category)}: {a.description}
                  </InfoBanner>
                ))}
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <p className="px-5 pt-4 pb-2 text-sm font-medium text-gray-700">{t('categoriesTitle')}</p>
              <div className="divide-y divide-gray-100">
                {report.items.map((item) => {
                  const cat = benchmark?.categories.find((c) => c.category === item.category)
                  return (
                    <CategoryRow
                      key={item.id}
                      label={categoryLabel(item.category)}
                      valuePerM2={Number(item.amountPerM2)}
                      deviationPct={cat?.deviationPct ?? 0}
                      hasData={cat?.hasEnoughData ?? false}
                    />
                  )
                })}
              </div>
            </div>

            <div className="card space-y-3 bg-primary-light border-blue-200">
              <p className="text-sm font-medium text-gray-700">{t('whatToDo')}</p>
              {annualOverpay > 0 && (
                <p className="text-sm text-gray-600">
                  {t('losingMoneyPrefix')}
                  <span className="font-semibold text-danger">{t('losingMoneyAmount', { amount: annualOverpay })}</span>
                  {t('losingMoneySuffix')}
                </p>
              )}
              <Link
                href={`/renovation/preview?buildingId=${report.buildingId}`}
                className="btn-primary text-center block"
              >
                {t('calcRenovation')}
              </Link>
              <Link href="/blog/subsidiya-altum-renovaciya-2025" className="text-xs text-primary text-center block hover:underline">
                {t('howAltum')}
              </Link>
            </div>

            <div className="card space-y-3">
              <p className="text-sm text-gray-600">{t('shareTitle')}</p>
              <p className="text-xs text-gray-400">{t('shareSubtitle')}</p>
              <div className="flex gap-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareWaText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-3 min-h-[48px] border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareTgUrl)}&text=${encodeURIComponent(shareTgText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-3 min-h-[48px] border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors"
                >
                  Telegram
                </a>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
