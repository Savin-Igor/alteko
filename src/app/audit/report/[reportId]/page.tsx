import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { compareWithBenchmark } from '@/lib/benchmarks/compare'
import { detectAnomalies } from '@/lib/benchmarks/anomaly'
import { EmailGateForm } from './EmailGateForm'

const CATEGORY_LABELS: Record<string, string> = {
  HEATING: 'Отопление',
  COLD_WATER: 'Холодная вода',
  HOT_WATER: 'Горячая вода',
  WASTEWATER: 'Канализация',
  WASTE: 'Вывоз мусора',
  CLEANING: 'Уборка',
  REPAIR_FUND: 'Фонд ремонта',
  ADMINISTRATION: 'Управление',
  ELEVATOR: 'Лифт',
  OTHER: 'Прочее',
}

function deviationColor(pct: number) {
  if (pct > 20) return 'text-danger'
  if (pct > 5) return 'text-warning'
  return 'text-success'
}

function deviationDot(pct: number) {
  if (pct > 20) return '🔴'
  if (pct > 5) return '🟡'
  return '🟢'
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

  const [benchmark, anomalies] = await Promise.all([
    compareWithBenchmark(reportId),
    detectAnomalies(report.buildingId, reportId),
  ])

  const isUnlocked = unlocked === '1'
  const deviation = benchmark?.overallDeviationPct ?? 0
  const annualOverpay = deviation > 0
    ? Math.round(((deviation / 100) * report.items.reduce((s, i) => s + Number(i.amountTotal), 0) * 12))
    : 0

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold text-gray-900">ALTEKO</Link>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-4">
        <h1 className="text-base text-gray-500">
          Отчёт: {report.building.address} · {report.periodMonth}.{report.periodYear}
        </h1>

        {/* Summary block */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">ИТОГ</p>
          <p className={`text-2xl font-bold ${deviationColor(deviation)}`}>
            {deviation > 0 ? '+' : ''}{deviation}% к норме
          </p>
          {annualOverpay > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Потенциальная переплата: ~€{annualOverpay}/год
            </p>
          )}
        </div>

        {/* Unlock gate or full report */}
        {!isUnlocked ? (
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <p className="text-sm font-medium text-gray-700">Полный отчёт включает:</p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>✓ Разбивку по {report.items.length} категориям расходов</li>
              <li>✓ Аномалии за последние 12 месяцев</li>
              <li>✓ Сравнение по вашему кварталу</li>
              <li>✓ Рекомендации что проверить</li>
            </ul>
            <EmailGateForm reportId={reportId} />
            <p className="text-xs text-gray-400 text-center">
              Без спама. Только данные по вашему дому. Отписаться в один клик.
            </p>
          </div>
        ) : (
          <>
            {/* Anomalies */}
            {anomalies.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
                {anomalies.map((a, i) => (
                  <p key={i} className="text-sm text-warning">
                    ⚠ {CATEGORY_LABELS[a.category] ?? a.category}: {a.description}
                  </p>
                ))}
              </div>
            )}

            {/* Categories */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <p className="px-5 pt-4 pb-2 text-sm font-medium text-gray-700">По категориям:</p>
              <div className="divide-y divide-gray-100">
                {report.items.map((item) => {
                  const cat = benchmark?.categories.find((c) => c.category === item.category)
                  const dev = cat?.deviationPct ?? 0
                  return (
                    <div key={item.id} className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{deviationDot(dev)}</span>
                        <span className="text-sm text-gray-800">
                          {CATEGORY_LABELS[item.category] ?? item.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          €{Number(item.amountPerM2).toFixed(2)}/м²
                        </span>
                        {cat?.hasEnoughData && (
                          <span className={`text-xs ml-2 ${deviationColor(dev)}`}>
                            {dev > 0 ? '+' : ''}{dev}%
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Renovation CTA */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <p className="text-sm font-medium text-gray-700">Что это значит?</p>
              <Link
                href={`/renovation/preview?buildingId=${report.buildingId}`}
                className="btn-primary text-center block"
              >
                Узнать, сколько сэкономит реновация
              </Link>
            </div>

            {/* Share block */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <p className="text-sm text-gray-600">Соседи тоже переплачивают?</p>
              <p className="text-xs text-gray-400">Поделитесь — пусть проверят</p>
              <div className="flex gap-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Проверил расходы нашего дома на ALTEKO. Переплачиваем за отопление на ${deviation}%. Посмотри: ${process.env.NEXT_PUBLIC_APP_URL ?? 'https://alteko.lv'}/b/${report.buildingId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://alteko.lv'}/b/${report.buildingId}`)}&text=${encodeURIComponent(`Переплачиваем за отопление на ${deviation}%`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
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
