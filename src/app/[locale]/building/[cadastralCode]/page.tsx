import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'
import { getSeriesImage } from '@/lib/buildingImages'
import { SiteHeader } from '@/components/ui/SiteHeader'

const ENERGY_CLASS_WIDTH: Record<string, string> = {
  A: 'w-[20%]',
  B: 'w-[30%]',
  C: 'w-[42%]',
  D: 'w-[54%]',
  E: 'w-[66%]',
  F: 'w-[78%]',
  G: 'w-full',
}

interface Props {
  params: Promise<{ locale: string; cadastralCode: string }>
  searchParams: Promise<{ address?: string }>
}

export default async function BuildingPage({ params, searchParams }: Props) {
  const { locale, cadastralCode } = await params
  const { address: fallbackAddress } = await searchParams

  const t = await getTranslations('building')
  const tEnergy = await getTranslations('building.energyClass')

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
        district: true,
        _count: { select: { reports: true } },
      },
    })
  } catch {
    // DB unavailable — render with fallback address if available
  }

  if (!building && !fallbackAddress) notFound()

  const displayAddress = building?.address ?? fallbackAddress ?? cadastralCode
  const localeCode = locale === 'lv' ? 'lv-LV' : 'ru-RU'

  function energyLabel(cls: string): string {
    try {
      return tEnergy(cls as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G')
    } catch {
      return cls
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 min-h-[44px]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('backToSearch')}
        </Link>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Series photo */}
          <div className="relative w-full h-40 bg-gray-100">
            <Image
              src={getSeriesImage(building?.series)}
              alt={building?.series ? `Серия ${building.series}` : 'Многоквартирный дом'}
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
                      <div
                        className={`h-2 rounded-full bg-warning ${ENERGY_CLASS_WIDTH[building.energyClass] ?? 'w-1/2'}`}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {t('classLabel', { label: energyLabel(building.energyClass) })}
                    </span>
                  </div>
                </div>
              )}

              {building._count.reports > 0 && (
                <p className="text-sm text-gray-500">
                  {t('similarBuildings', { count: building._count.reports })}
                </p>
              )}
            </>
          ) : (
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{displayAddress}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {t('fallbackPending')}
              </p>
            </div>
          )}

          <div className="pt-2 space-y-3">
            <Link
              href={`/audit/upload?building=${building?.id ?? ''}&cadastralCode=${building?.cadastralCode ?? ''}&address=${encodeURIComponent(displayAddress)}`}
              className="btn-primary text-center block"
            >
              {t('uploadCta')}
            </Link>

            <Link
              href={`/building/${cadastralCode}/renovate`}
              className="btn-secondary text-center block"
            >
              {t('renovateCta')}
            </Link>

            <button className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2">
              {t('noBillReminder')}
            </button>
          </div>
          </div>
        </div>
      </main>
    </div>
  )
}
