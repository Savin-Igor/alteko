import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { ProgressBar, InfoBanner } from '@/components/ui'
import { localizedAlternates, noIndexRobots } from '@/lib/seo'

interface Props {
  params: Promise<{ locale: string; cadastralCode: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, cadastralCode } = await params
  const t = await getTranslations({ locale, namespace: 'building.renovate.meta' })

  let address = cadastralCode
  try {
    const building = await prisma.building.findUnique({
      where: { cadastralCode },
      select: { address: true },
    })
    if (building) address = building.address
  } catch { /* DB unavailable */ }

  return {
    title: t('title', { address }),
    description: t('description'),
    alternates: localizedAlternates({
      path: `/building/${cadastralCode}/renovate`,
      locale,
    }),
    robots: noIndexRobots,
  }
}

export default async function RenovatePage({ params }: Props) {
  const { locale, cadastralCode } = await params
  const t = await getTranslations('building.renovate')
  const tBuilding = await getTranslations('building')

  let building: {
    id: string
    address: string
    series: string | null
    constructionYear: number | null
    apartmentCount: number | null
  } | null = null

  let campaign: {
    id: string
    status: string
    currentYesShare: number
    requiredThreshold: number
    deadline: Date | null
  } | null = null

  try {
    const result = await prisma.building.findUnique({
      where: { cadastralCode },
      select: {
        id: true,
        address: true,
        series: true,
        constructionYear: true,
        apartmentCount: true,
        campaigns: {
          where: { status: { in: ['ACTIVE', 'COMPLETED'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            currentYesShare: true,
            requiredThreshold: true,
            deadline: true,
          },
        },
      },
    })

    if (result) {
      building = {
        id: result.id,
        address: result.address,
        series: result.series,
        constructionYear: result.constructionYear,
        apartmentCount: result.apartmentCount,
      }
      const raw = result.campaigns[0]
      if (raw) {
        campaign = {
          id: raw.id,
          status: raw.status,
          currentYesShare: Number(raw.currentYesShare),
          requiredThreshold: Number(raw.requiredThreshold),
          deadline: raw.deadline,
        }
      }
    }
  } catch { /* DB unavailable — will show 404 */ }

  if (!building) notFound()

  const dateLocale = locale === 'lv' ? 'lv-LV' : 'ru-RU'
  const howItWorksItems = t.raw('howItWorks.items') as string[]
  const yesSharePct = campaign ? Math.round(campaign.currentYesShare * 100) : 0
  const requiredPct = campaign ? Math.round(campaign.requiredThreshold * 100) : 50
  const thresholdReached = campaign
    ? campaign.currentYesShare >= campaign.requiredThreshold
    : false

  const meta = [
    building.series ? tBuilding('seriesPrefix', { series: building.series }) : null,
    building.constructionYear ? tBuilding('yearSuffix', { year: building.constructionYear }) : null,
    building.apartmentCount ? tBuilding('apartments', { count: building.apartmentCount }) : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-5">
        {/* Back link */}
        <Link
          href={`/building/${cadastralCode}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 min-h-[44px]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('backToBuilding')}
        </Link>

        {/* Building header */}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{building.address}</h1>
          {meta && <p className="text-sm text-gray-500 mt-0.5">{meta}</p>}
        </div>

        {/* Campaign status */}
        {campaign ? (
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">
              {campaign.status === 'ACTIVE' ? t('activeTitle') : t('completedTitle')}
            </h2>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('progress.votedLabel')}</span>
                <span className="font-medium text-gray-900">{yesSharePct}%</span>
              </div>
              <ProgressBar
                value={campaign.currentYesShare}
                variant={thresholdReached ? 'success' : 'primary'}
                label={`${yesSharePct}% / ${requiredPct}%`}
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{t('progress.requiredLabel')} {requiredPct}%</span>
                {campaign.deadline && (
                  <span>
                    {t('progress.deadlineLabel')}{' '}
                    {new Date(campaign.deadline).toLocaleDateString(dateLocale, {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>

            {thresholdReached && (
              <InfoBanner variant="success">{t('progress.thresholdReached')}</InfoBanner>
            )}

            {campaign.status === 'ACTIVE' && (
              <Link href={`/voting/${campaign.id}`} className="btn-primary text-center block">
                {t('voteCta')}
              </Link>
            )}
          </div>
        ) : (
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">{t('noActive.title')}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{t('noActive.description')}</p>
            <div className="space-y-2">
              <Link href="/" className="btn-primary text-center block">
                {t('noActive.auditCta')}
              </Link>
              <Link href="/auth/signin" className="btn-secondary text-center block">
                {t('noActive.boardCta')}
              </Link>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">{t('howItWorks.heading')}</h2>
          <ol className="space-y-3">
            {howItWorksItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
          <p className="text-xs text-gray-400 leading-relaxed">{t('legal')}</p>
        </div>
      </main>
    </div>
  )
}
