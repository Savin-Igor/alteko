import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

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
      <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold text-gray-900">ALTEKO</Link>
        <div className="flex gap-2 text-sm">
          <button className="px-3 py-1 rounded font-medium text-primary">LV</button>
          <button className="px-3 py-1 rounded font-medium text-gray-400">RU</button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700">
          ← {displayAddress}
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
              href={`/audit/upload?building=${building?.id ?? ''}&address=${encodeURIComponent(displayAddress)}`}
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
