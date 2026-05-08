import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'
import { getSeriesImage } from '@/lib/buildingImages'
import { getHeatingBenchmark, deviationBadgeClass } from '@/lib/benchmarks/series-heating'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { Badge } from '@/components/ui'
import { ReadinessScoreCard } from '@/components/readiness/ReadinessScoreCard'
import { localizedAlternates } from '@/lib/seo'
import {
  computeEnergyScore,
  computeFundingEligibilityScore,
} from '@/lib/readiness/score'

const ENERGY_CLASS_WIDTH: Record<string, string> = {
  A: 'w-[20%]',
  B: 'w-[30%]',
  C: 'w-[42%]',
  D: 'w-[54%]',
  E: 'w-[66%]',
  F: 'w-[78%]',
  G: 'w-full',
}

const WINDOW_STATUS_BADGE: Record<string, 'pending' | 'active' | 'done' | 'cancelled'> = {
  OPEN: 'active',
  EXPECTED: 'pending',
  CLOSED: 'cancelled',
  UNKNOWN: 'pending',
}

interface Props {
  params: Promise<{ locale: string; cadastralCode: string }>
  searchParams: Promise<{ address?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, cadastralCode } = await params
  const { address: fallbackAddress } = await searchParams
  const isRu = locale === 'ru'

  let address: string | null = null
  try {
    const building = await prisma.building.findUnique({
      where: { cadastralCode },
      select: { address: true },
    })
    address = building?.address ?? null
  } catch {
    // DB unavailable — fall back to query string
  }

  const display = address ?? fallbackAddress ?? cadastralCode
  const title = isRu
    ? `${display} — карточка дома | ALTEKO`
    : `${display} — mājas kartīte | ALTEKO`
  const description = isRu
    ? `Готовность дома, сценарии финансирования и следующий шаг для ${display}. Бесплатный публичный отчёт ALTEKO.`
    : `Mājas gatavība, finansējuma scenāriji un nākamais solis adresei ${display}. Bezmaksas publiskais ALTEKO pārskats.`

  return {
    title,
    description,
    alternates: localizedAlternates({ path: `/building/${cadastralCode}`, locale }),
  }
}

export default async function BuildingPage({ params, searchParams }: Props) {
  const { locale, cadastralCode } = await params
  const { address: fallbackAddress } = await searchParams

  const t = await getTranslations('building')
  const tEnergy = await getTranslations('building.energyClass')
  const tWindow = await getTranslations('financing.windowStatus')
  const tScenario = await getTranslations('financing.scenarioType')

  let building = null
  try {
    building = await prisma.building.findUnique({
      where: { cadastralCode },
      select: {
        id: true,
        address: true,
        cadastralCode: true,
        series: true,
        constructionYear: true,
        totalAreaM2: true,
        apartmentCount: true,
        energyClass: true,
        heatingEnergyKwhM2: true,
        district: true,
        readinessScore: {
          select: {
            nextBestAction: true,
            nextBestActionRu: true,
            energyScore: true,
            fundingEligibilityScore: true,
            documentReadinessScore: true,
            ownerDecisionReadinessScore: true,
            financialFeasibilityScore: true,
            procurementTransparencyScore: true,
            legalConfidenceStatus: true,
            dataConfidenceStatus: true,
            computedAt: true,
          },
        },
        scenarios: {
          select: {
            scenarioType: true,
            windowStatus: true,
            eligibility: true,
            estimatedCostEur: true,
            estimatedSubsidyPercent: true,
            monthlyPaymentPerApartment: true,
          },
          orderBy: { scenarioType: 'asc' },
        },
        _count: { select: { reports: true } },
      },
    })
  } catch {
    // DB unavailable — render with fallback address if available
  }

  if (!building && !fallbackAddress) notFound()

  const displayAddress = building?.address ?? fallbackAddress ?? cadastralCode
  const localeCode = locale === 'lv' ? 'lv-LV' : 'ru-RU'
  const isRu = locale === 'ru'

  // Heating benchmark
  const heatingBenchmark = building
    ? await getHeatingBenchmark(
        building.series,
        building.heatingEnergyKwhM2 ? Number(building.heatingEnergyKwhM2) : null
      ).catch(() => null)
    : null

  function energyLabel(cls: string): string {
    try {
      return tEnergy(cls as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G')
    } catch {
      return cls
    }
  }

  // Derive partial inline score from public data when full score not in DB.
  // This ensures ReadinessScoreCard always has something to show.
  const partialScore =
    building && !building.readinessScore
      ? {
          energyScore: building.energyClass
            ? computeEnergyScore(building.energyClass)
            : null,
          fundingEligibilityScore:
            building.scenarios.length > 0
              ? computeFundingEligibilityScore(
                  building.scenarios.map((s) => s.eligibility)
                )
              : null,
        }
      : null

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-6 max-w-xl mx-auto w-full space-y-4">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 min-h-[44px]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('backToSearch')}
        </Link>

        {/* Building card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="relative w-full h-40 bg-gray-100">
            <Image
              src={getSeriesImage(building?.series)}
              alt={building?.series ? `Sērija ${building.series}` : 'Daudzdzīvokļu māja'}
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          <div className="p-5 space-y-4">
            {building ? (
              <>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{building.address}</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {[
                      building.series ? t('seriesPrefix', { series: building.series }) : t('seriesUnknown'),
                      building.constructionYear ? t('yearSuffix', { year: building.constructionYear }) : null,
                      building.apartmentCount ? t('apartments', { count: building.apartmentCount }) : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {building.district && (
                    <>
                      <dt className="text-gray-500">{t('district')}</dt>
                      <dd className="text-gray-900 font-medium">{building.district}</dd>
                    </>
                  )}
                  {building.totalAreaM2 && (
                    <>
                      <dt className="text-gray-500">{t('totalArea')}</dt>
                      <dd className="text-gray-900 font-medium">{Number(building.totalAreaM2).toLocaleString(localeCode)} m²</dd>
                    </>
                  )}
                  <dt className="text-gray-500">{t('cadastralNumber')}</dt>
                  <dd className="text-gray-900 font-mono text-xs">{building.cadastralCode}</dd>
                </dl>

                {building.energyClass && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('energyEfficiency')}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full bg-warning ${ENERGY_CLASS_WIDTH[building.energyClass] ?? 'w-1/2'}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {t('classLabel', { label: energyLabel(building.energyClass) })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Heating benchmark */}
                {heatingBenchmark && (
                  <div className="border-t border-gray-100 pt-3 space-y-1.5">
                    <p className="text-xs font-medium text-gray-500">{t('heating.heading')}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t('heating.norm', { series: heatingBenchmark.seriesCode })}</span>
                      <span className="font-medium text-gray-900">{heatingBenchmark.normKwhM2Year} kWh/m²/g.</span>
                    </div>
                    {heatingBenchmark.actualKwhM2Year !== null && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t('heating.actual')}</span>
                        <span className="font-medium text-gray-900">{heatingBenchmark.actualKwhM2Year} kWh/m²/g.</span>
                      </div>
                    )}
                    {heatingBenchmark.deviationPct !== null && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t('heating.deviation')}</span>
                        <span className={`font-bold ${deviationBadgeClass(heatingBenchmark.deviationPct)}`}>
                          {heatingBenchmark.deviationPct > 0 ? '+' : ''}{heatingBenchmark.deviationPct}%
                        </span>
                      </div>
                    )}
                    {heatingBenchmark.isFallback && (
                      <p className="text-xs text-gray-400 italic">{t('heating.fallbackNote')}</p>
                    )}
                    <p className="text-xs text-gray-400">{t('heating.source')}</p>
                  </div>
                )}
              </>
            ) : (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{displayAddress}</h1>
                <p className="text-sm text-gray-500 mt-1">{t('fallbackPending')}</p>
              </div>
            )}

            {/* CTAs */}
            <div className="pt-2 space-y-3">
              {/* Primary: Gatavības atskaite — always first */}
              <Link
                href={`/readiness-report/order?cadastralCode=${building?.cadastralCode ?? cadastralCode}&address=${encodeURIComponent(displayAddress)}`}
                className="btn-primary text-center block"
              >
                {t('readinessReportCta')}
              </Link>

              <Link
                href={`/audit/upload?building=${building?.id ?? ''}&cadastralCode=${building?.cadastralCode ?? ''}&address=${encodeURIComponent(displayAddress)}`}
                className="btn-secondary text-center block"
              >
                {t('uploadCta')}
              </Link>

              <Link
                href={`/financing?cadastralCode=${cadastralCode}`}
                className="btn-secondary text-center block"
              >
                {t('financingCta')}
              </Link>
            </div>
          </div>
        </div>

        {/* Readiness Score Card — shown for all buildings */}
        {building && (
          <ReadinessScoreCard
            score={building.readinessScore}
            partialScore={partialScore}
            cadastralCode={cadastralCode}
            address={displayAddress}
            isRu={isRu}
          />
        )}

        {/* Financing scenarios preview */}
        {building?.scenarios && building.scenarios.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">{t('readiness.financingHeading')}</h2>
            <div className="space-y-2">
              {building.scenarios.map((s) => {
                let scenarioLabel: string = s.scenarioType
                try { scenarioLabel = tScenario(s.scenarioType as never) } catch {}

                let windowLabel: string = s.windowStatus
                try { windowLabel = tWindow(s.windowStatus as never) } catch {}

                return (
                  <div key={s.scenarioType} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-gray-700 truncate">{scenarioLabel}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {s.monthlyPaymentPerApartment && (
                        <span className="text-xs text-gray-500">
                          ~€{Math.round(Number(s.monthlyPaymentPerApartment))}/mēn.
                        </span>
                      )}
                      <Badge
                        status={WINDOW_STATUS_BADGE[s.windowStatus] ?? 'pending'}
                        label={windowLabel}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
