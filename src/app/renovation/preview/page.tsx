import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface Props {
  searchParams: Promise<{ buildingId?: string }>
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
    },
  })
  if (!building) notFound()

  // Segment-level averages (no personal data required)
  const SEGMENT_SAVINGS: Record<string, number> = {
    F: 140, G: 160, E: 100, D: 70,
  }
  const cls = building.energyClass ?? 'F'
  const avgSavings = SEGMENT_SAVINGS[cls] ?? 120
  const paybackRange = cls === 'G' || cls === 'F' ? '12–18' : '15–22'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold text-gray-900">ALTEKO</Link>
      </header>

      <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Что даёт реновация{building.series ? ` домам серии ${building.series}` : ''}?
          </h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center space-y-1">
          <p className="text-sm text-gray-500">Средняя экономия на отоплении</p>
          <p className="text-4xl font-bold text-success">€{avgSavings}/мес.</p>
          <p className="text-xs text-gray-400">на дом · после реновации</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Срок окупаемости:</span>
            <span className="font-medium">{paybackRange} лет</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Субсидия Altum:</span>
            <span className="font-medium">до 49% стоимости</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Рост стоимости квартиры:</span>
            <span className="font-medium text-success">+10–11%</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center">
          Это данные по похожим домам. Расчёт для вашего дома — точнее.
        </p>

        <Link
          href={`/renovation/calculate?buildingId=${buildingId}`}
          className="btn-primary text-center block"
        >
          Рассчитать для {building.address.split(',')[0]}
        </Link>
      </main>
    </div>
  )
}
