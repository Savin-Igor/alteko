import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

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

  // Find buildings this admin manages (via uploaded reports)
  const reports = await prisma.expenseReport.findMany({
    where: { uploadedBy: session.user.id, status: 'PROCESSED' },
    include: {
      building: {
        select: {
          id: true,
          address: true,
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
      <header className="bg-white flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold text-gray-900">ALTEKO</Link>
        <span className="text-sm text-gray-500">Дашборд правления</span>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-6">
        <h1 className="text-xl font-semibold text-gray-900">Мои дома</h1>

        {buildings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-4">
            <p className="text-gray-500 text-sm">
              Загрузите первый счёт, чтобы начать мониторинг расходов дома.
            </p>
            <Link href="/" className="btn-primary inline-block w-auto px-8">
              Найти дом
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {buildings.map((building) => {
              const buildingReports = reports
                .filter((r) => r.buildingId === building.id)
                .slice(0, 12)

              const latestHeating = buildingReports[0]?.items[0]
              const heatingVal = latestHeating ? Number(latestHeating.amountPerM2).toFixed(2) : null

              return (
                <div key={building.id} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
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
                    <span className="text-xs text-gray-400">{buildingReports.length} отчётов</span>
                  </div>

                  {heatingVal && (
                    <div className="bg-gray-50 rounded-lg px-4 py-2">
                      <p className="text-xs text-gray-500">Отопление (последний период)</p>
                      <p className="text-lg font-semibold text-gray-900">€{heatingVal}/м²</p>
                    </div>
                  )}

                  {/* Expense trend (last 6 months) */}
                  {buildingReports.length > 1 && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Тренд отопления (€/м²):</p>
                      <div className="flex gap-1 items-end h-10">
                        {buildingReports.slice(0, 6).reverse().map((r, i) => {
                          const val = Number(r.items[0]?.amountPerM2 ?? 0)
                          const maxVal = Math.max(...buildingReports.slice(0, 6).map((x) => Number(x.items[0]?.amountPerM2 ?? 0)))
                          const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 50
                          return (
                            <div
                              key={i}
                              className="flex-1 bg-primary opacity-70 rounded-sm"
                              style={{ height: `${heightPct}%` }}
                              title={`${r.periodMonth}.${r.periodYear}: €${val.toFixed(2)}`}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/building/${building.id}`}
                      className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Карточка дома
                    </Link>
                    <Link
                      href={`/dashboard/voting?buildingId=${building.id}`}
                      className="flex-1 text-center py-2 border border-primary rounded-lg text-sm text-primary hover:bg-blue-50"
                    >
                      Открыть голосование
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
