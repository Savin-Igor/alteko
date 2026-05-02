import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader, EmptyState } from '@/components/ui'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, preferredLanguage: true },
  })

  if (user?.role !== 'ASSOCIATION_ADMIN' && user?.role !== 'PLATFORM_ADMIN') {
    redirect('/')
  }

  const reports = await prisma.expenseReport.findMany({
    where: { uploadedBy: session.user.id, status: 'PROCESSED' },
    include: {
      building: {
        select: {
          id: true,
          address: true,
          cadastralCode: true,
          series: true,
          energyClass: true,
        },
      },
      items: {
        where: { category: 'HEATING' },
        select: { amountPerM2: true },
      },
    },
    orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    take: 24,
  })

  const buildingMap = new Map<string, typeof reports[0]['building']>()
  for (const r of reports) {
    if (!buildingMap.has(r.buildingId)) buildingMap.set(r.buildingId, r.building)
  }
  const buildings = Array.from(buildingMap.values())

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHeader variant="admin" />

      {/* Tab navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 flex gap-1">
          <Link
            href="/dashboard"
            className="px-4 py-3 text-sm font-medium text-primary border-b-2 border-primary -mb-px"
          >
            Мои дома
          </Link>
          <Link
            href="/dashboard/tenders"
            className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300 -mb-px transition-colors"
          >
            Проекты
          </Link>
          <Link
            href="/dashboard/voting"
            className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300 -mb-px transition-colors"
          >
            Голосование
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-6">
        <h1 className="text-xl font-semibold text-gray-900">Мои дома</h1>

        {buildings.length === 0 ? (
          <EmptyState
            title="Нет данных по домам"
            description="Загрузите первый счёт, чтобы начать мониторинг расходов."
            action={{ label: 'Найти дом и загрузить счёт', href: '/' }}
          />
        ) : (
          <div className="space-y-4">
            {buildings.map((building) => {
              const buildingReports = reports
                .filter((r) => r.buildingId === building.id)
                .slice(0, 12)

              const latestHeating = buildingReports[0]?.items[0]
              const heatingVal = latestHeating ? Number(latestHeating.amountPerM2).toFixed(2) : null

              const trendData = buildingReports.slice(0, 6).reverse()
              const maxVal = Math.max(...trendData.map((r) => Number(r.items[0]?.amountPerM2 ?? 0)), 0)

              return (
                <div key={building.id} className="card space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-medium text-gray-900">{building.address}</h2>
                      <p className="text-sm text-gray-500">
                        {[
                          building.series ? `Серия ${building.series}` : null,
                          building.energyClass ? `Класс ${building.energyClass}` : null,
                        ].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{buildingReports.length} отч.</span>
                  </div>

                  {heatingVal && (
                    <div className="bg-gray-50 rounded-lg px-4 py-2">
                      <p className="text-xs text-gray-500">Отопление (последний период)</p>
                      <p className="text-lg font-semibold text-gray-900">€{heatingVal}/м²</p>
                    </div>
                  )}

                  {trendData.length > 1 && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Тренд отопления, €/м²:</p>
                      <div className="flex gap-1 items-end h-10">
                        {trendData.map((r, i) => {
                          const val = Number(r.items[0]?.amountPerM2 ?? 0)
                          const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 50
                          return (
                            <div
                              key={i}
                              className="flex-1 bg-primary opacity-70 rounded-sm min-w-0"
                              style={{ height: `${heightPct}%` }}
                              title={`${r.periodMonth}.${r.periodYear}: €${val.toFixed(2)}/м²`}
                            />
                          )
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{trendData[0]?.periodMonth}.{trendData[0]?.periodYear}</span>
                        <span>{trendData.at(-1)?.periodMonth}.{trendData.at(-1)?.periodYear}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/building/${building.cadastralCode}`}
                      className="flex-1 text-center py-3 min-h-[48px] border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors"
                    >
                      Карточка дома
                    </Link>
                    <Link
                      href={`/dashboard/voting?buildingId=${building.id}`}
                      className="flex-1 text-center py-3 min-h-[48px] border border-primary rounded-lg text-sm text-primary hover:bg-primary-light flex items-center justify-center transition-colors"
                    >
                      Голосование
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
