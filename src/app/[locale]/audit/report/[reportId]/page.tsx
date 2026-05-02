import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { compareWithBenchmark } from '@/lib/benchmarks/compare'
import { detectAnomalies } from '@/lib/benchmarks/anomaly'
import { EmailGateForm } from './EmailGateForm'
import { UnlockPersist } from '@/components/UnlockPersist'
import { PageHeader, CategoryRow, StatCard, InfoBanner } from '@/components/ui'

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

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader
        variant="breadcrumb"
        backHref={`/building/${report.building.cadastralCode}`}
        backLabel={report.building.address}
      />

      {/* Persist unlock state in localStorage and restore on browser-back */}
      <UnlockPersist reportId={reportId} isUnlocked={isUnlocked} />

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-4">
        <p className="text-sm text-gray-500">
          Отчёт · {report.periodMonth}.{report.periodYear}
        </p>

        {/* Summary */}
        <StatCard
          label="Итог"
          value={`${deviation > 0 ? '+' : ''}${deviation}%`}
          unit="к норме"
          variant={variant}
          size="lg"
          description={annualOverpay > 0 ? `Потенциальная переплата: ~€${annualOverpay}/год` : undefined}
        />

        {/* Email gate or full report */}
        {!isUnlocked ? (
          <div className="card space-y-4">
            <p className="text-sm font-medium text-gray-700">Полный отчёт включает:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="status-dot-success mt-1.5" />
                Разбивку по {report.items.length} категориям расходов
              </li>
              <li className="flex items-start gap-2">
                <span className="status-dot-success mt-1.5" />
                Аномалии за последние 12 месяцев
              </li>
              <li className="flex items-start gap-2">
                <span className="status-dot-success mt-1.5" />
                Сравнение по вашему кварталу
              </li>
              <li className="flex items-start gap-2">
                <span className="status-dot-success mt-1.5" />
                Рекомендации что проверить
              </li>
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
              <div className="card space-y-2">
                {anomalies.map((a, i) => (
                  <InfoBanner key={i} variant="warning">
                    {CATEGORY_LABELS[a.category] ?? a.category}: {a.description}
                  </InfoBanner>
                ))}
              </div>
            )}

            {/* Categories */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <p className="px-5 pt-4 pb-2 text-sm font-medium text-gray-700">По категориям:</p>
              <div className="divide-y divide-gray-100">
                {report.items.map((item) => {
                  const cat = benchmark?.categories.find((c) => c.category === item.category)
                  return (
                    <CategoryRow
                      key={item.id}
                      label={CATEGORY_LABELS[item.category] ?? item.category}
                      valuePerM2={Number(item.amountPerM2)}
                      deviationPct={cat?.deviationPct ?? 0}
                      hasData={cat?.hasEnoughData ?? false}
                    />
                  )
                })}
              </div>
            </div>

            {/* Renovation CTA */}
            <div className="card space-y-3 bg-primary-light border-blue-200">
              <p className="text-sm font-medium text-gray-700">Что с этим делать?</p>
              {annualOverpay > 0 && (
                <p className="text-sm text-gray-600">
                  Ваш дом теряет <span className="font-semibold text-danger">~€{annualOverpay}/год</span>.
                  Реновация устраняет причину — и государство покрывает до 49% затрат.
                </p>
              )}
              <Link
                href={`/renovation/preview?buildingId=${report.buildingId}`}
                className="btn-primary text-center block"
              >
                Рассчитать реновацию с субсидией Altum →
              </Link>
              <Link href="/blog/subsidiya-altum-renovaciya-2025" className="text-xs text-primary text-center block hover:underline">
                Как работает субсидия Altum?
              </Link>
            </div>

            {/* Share */}
            <div className="card space-y-3">
              <p className="text-sm text-gray-600">Соседи тоже переплачивают?</p>
              <p className="text-xs text-gray-400">Поделитесь — пусть проверят</p>
              <div className="flex gap-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Проверил расходы нашего дома на ALTEKO. Переплачиваем за отопление на ${deviation}%. Посмотри: ${process.env.NEXT_PUBLIC_APP_URL ?? 'https://alteko.lv'}/b/${report.buildingId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-3 min-h-[48px] border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://alteko.lv'}/b/${report.buildingId}`)}&text=${encodeURIComponent(`Переплачиваем за отопление на ${deviation}%`)}`}
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
