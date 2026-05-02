import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SiteHeader } from '@/components/ui/SiteHeader'

const ENERGY_CLASS_LABELS: Record<string, string> = {
  A: 'A — Высокая',
  B: 'B',
  C: 'C',
  D: 'D',
  E: 'E — Средняя',
  F: 'F',
  G: 'G — Низкая',
}

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
  params: Promise<{ cadastralCode: string }>
  searchParams: Promise<{ address?: string }>
}

export default async function BuildingPage({ params, searchParams }: Props) {
  const { cadastralCode } = await params
  const { address: fallbackAddress } = await searchParams

  const building = await prisma.building.findUnique({
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

  if (!building && !fallbackAddress) notFound()

  const displayAddress = building?.address ?? fallbackAddress ?? cadastralCode

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 min-h-[44px]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Поиск адреса
        </Link>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          {building ? (
            <>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{building.address}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {[
                    building.series ? `Серия ${building.series}` : 'Серия не определена',
                    building.constructionYear ? `${building.constructionYear} г.` : null,
                    building.apartmentCount ? `${building.apartmentCount} кв.` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>

              {building.energyClass && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Энергоэффективность:</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-warning ${ENERGY_CLASS_WIDTH[building.energyClass] ?? 'w-1/2'}`}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Класс {ENERGY_CLASS_LABELS[building.energyClass] ?? building.energyClass}
                    </span>
                  </div>
                </div>
              )}

              {building._count.reports > 0 && (
                <p className="text-sm text-gray-500">
                  Похожих домов в базе: {building._count.reports}
                </p>
              )}
            </>
          ) : (
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{displayAddress}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Данные по этому дому уточняются
              </p>
            </div>
          )}

          <div className="pt-2 space-y-3">
            <Link
              href={`/audit/upload?building=${building?.id ?? ''}&cadastralCode=${building?.cadastralCode ?? ''}&address=${encodeURIComponent(displayAddress)}`}
              className="btn-primary text-center block"
            >
              Загрузить счёт управляющей компании
            </Link>

            <button className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2">
              Нет счёта под рукой? Запомнить адрес — пришлём напоминание
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
