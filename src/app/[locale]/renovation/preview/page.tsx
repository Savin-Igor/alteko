import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageHeader, InfoBanner } from '@/components/ui'

interface Props {
  searchParams: Promise<{ buildingId?: string }>
}

const SEGMENT_SAVINGS: Record<string, number> = {
  G: 160, F: 140, E: 100, D: 70, C: 40,
}

const ENERGY_CLASS_LABEL: Record<string, string> = {
  A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G',
}

export default async function RenovationPreviewPage({ searchParams }: Props) {
  const { buildingId } = await searchParams
  if (!buildingId) notFound()

  const building = await prisma.building.findUnique({
    where: { id: buildingId },
    select: {
      address: true,
      series: true,
      energyClass: true,
      apartmentCount: true,
    },
  })
  if (!building) notFound()

  const cls = building.energyClass ?? 'F'
  const avgSavings = SEGMENT_SAVINGS[cls] ?? 120
  const savingsPerApt = building.apartmentCount
    ? Math.round(avgSavings / building.apartmentCount)
    : null
  const paybackRange = (cls === 'G' || cls === 'F') ? '8–14' : '12–18'
  const shortAddress = building.address.split(',')[0]

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader variant="minimal" />

      <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full space-y-5">
        {/* Heading */}
        <div>
          <p className="text-sm text-gray-500 mb-1">
            {building.series ? `Серия ${building.series}` : 'Ваш дом'}
            {cls && ` · Класс ${ENERGY_CLASS_LABEL[cls] ?? cls}`}
          </p>
          <h1 className="text-xl font-bold text-gray-900 leading-snug">
            Что даёт реновация{building.series ? ` домам серии ${building.series}` : ''}?
          </h1>
        </div>

        {/* Main number */}
        <div className="card text-center py-6 space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Средняя экономия на отоплении
          </p>
          <p className="text-metric-xl text-success">€{avgSavings}/мес.</p>
          <p className="text-sm text-gray-500">на весь дом · после реновации</p>
          {savingsPerApt && (
            <p className="text-sm font-medium text-success mt-1">
              ~€{savingsPerApt}/мес. с квартиры
            </p>
          )}
        </div>

        {/* Financing */}
        <div className="card space-y-3">
          <p className="text-sm font-semibold text-gray-700">Финансирование</p>
          {[
            { label: 'Субсидия Altum', value: 'до 49% стоимости', color: 'text-primary' },
            { label: 'Срок окупаемости', value: `${paybackRange} лет`, color: 'text-gray-900' },
            { label: 'Рост стоимости квартиры', value: '+10–11%', color: 'text-success' },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{row.label}:</span>
              <span className={`font-medium ${row.color}`}>{row.value}</span>
            </div>
          ))}
        </div>

        <InfoBanner variant="info">
          Это средние данные по похожим домам. Расчёт для{' '}
          <span className="font-medium">{shortAddress}</span> — точнее.
        </InfoBanner>

        <div className="space-y-3">
          <Link
            href={`/renovation/calculate?buildingId=${buildingId}`}
            className="btn-primary text-center block"
          >
            Рассчитать реновацию для {shortAddress} →
          </Link>
          <Link
            href="/blog/subsidiya-altum-renovaciya-2025"
            className="block text-center text-sm text-primary hover:underline py-2"
          >
            Как работает субсидия Altum?
          </Link>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Источники: Altum, fi-compass 2024, Latvijas Banka DP 3/2025
        </p>
      </main>
    </div>
  )
}
