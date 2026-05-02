import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { compareWithBenchmark } from '@/lib/benchmarks/compare'

interface Props {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: Props) {
  const { token } = await params

  // Token is the building id
  const building = await prisma.building.findUnique({
    where: { id: token },
    select: {
      id: true,
      address: true,
      series: true,
      constructionYear: true,
      energyClass: true,
      _count: { select: { reports: true } },
    },
  })

  // Get latest processed report for this building
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
        <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <Link href="/" className="text-xl font-bold text-gray-900">ALTEKO</Link>
        </header>
        <main className="flex-1 px-4 py-12 max-w-md mx-auto w-full text-center">
          <p className="text-gray-500 mb-6">Эта ссылка устарела. Найдите свой дом:</p>
          <Link href="/" className="btn-primary block">Найти дом</Link>
        </main>
      </div>
    )
  }

  const hasNoData = !latestReport
  const isNormal = deviation !== null && deviation <= 10

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold text-gray-900">ALTEKO</Link>
        <div className="flex gap-2 text-sm">
          <button className="px-3 py-1 rounded font-medium text-primary">LV</button>
          <button className="px-3 py-1 rounded font-medium text-gray-400">RU</button>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full space-y-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Ваш сосед проверил расходы вашего дома</p>
          <h1 className="text-lg font-semibold text-gray-900">{building.address}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {[
              building.series ? `Серия ${building.series}` : null,
              building.constructionYear ? `${building.constructionYear} г.` : null,
              building.energyClass ? `Класс ${building.energyClass}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        {hasNoData ? (
          <div className="bg-gray-50 rounded-xl p-5 text-center">
            <p className="text-sm text-gray-500">
              Пока никто не проверял этот дом. Станьте первым — загрузите счёт.
            </p>
          </div>
        ) : isNormal ? (
          <div className="bg-green-50 rounded-xl p-5 text-center">
            <p className="text-sm text-success font-medium">
              Ваш дом тратит в норме. Но детали — в полном отчёте.
            </p>
          </div>
        ) : (
          <div className="bg-red-50 rounded-xl p-5">
            <p className="text-sm text-gray-600 mb-2">Отопление:</p>
            <p className="text-3xl font-bold text-danger">
              {deviation !== null && deviation > 0 ? '+' : ''}{deviation}% к норме
            </p>
            {latestReport && (
              <p className="text-sm text-gray-500 mt-2">
                Потенциальная переплата за год — существенная
              </p>
            )}
          </div>
        )}

        <p className="text-sm text-gray-500">
          Это общие данные по дому. Загрузите ваш счёт — покажем детали именно по вашему подъезду.
        </p>

        <Link
          href={`/building/${building.id}`}
          className="btn-primary text-center block"
        >
          Загрузить свой счёт — бесплатно
        </Link>

        <p className="text-center text-xs text-gray-400">
          Бесплатно · Без регистрации · 30 секунд
        </p>

        <p className="text-center text-xs text-gray-400">
          Живёте в другом доме?{' '}
          <Link href="/" className="text-primary underline">Найдите свой →</Link>
        </p>
      </main>
    </div>
  )
}
