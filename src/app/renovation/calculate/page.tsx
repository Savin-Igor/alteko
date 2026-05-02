'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface CalcResult {
  building: {
    series: string | null
    totalAreaM2: number
    apartmentCount: number
    energyClass: string | null
  }
  savings: {
    currentHeatingMonthly: number
    projectedHeatingMonthly: number
    monthlySavings: number
    monthlySavingsPerApt: number
    annualSavings: number
  }
  costEstimate: { low: number; mid: number; high: number }
  subsidy: {
    subsidyAmount: number
    subsidyPercent: number
    ownerSharePerApt: number
    paybackYears: number
  }
  isPersonalized: boolean
}

function CalcContent() {
  const searchParams = useSearchParams()
  const buildingId = searchParams.get('buildingId') ?? ''

  const [result, setResult] = useState<CalcResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [docUrls, setDocUrls] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    if (!buildingId) return
    fetch(`/api/renovation/calculate?buildingId=${buildingId}`)
      .then((r) => r.json())
      .then((d) => { setResult(d); setLoading(false) })
      .catch(() => { setError('Ошибка загрузки'); setLoading(false) })
  }, [buildingId])

  async function handleGenerateDocs() {
    setGenerating(true)
    try {
      const res = await fetch('/api/renovation/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildingId }),
      })
      const data = await res.json()
      if (res.ok) setDocUrls(data.documents)
      else setError(data.error ?? 'Ошибка генерации документов')
    } catch {
      setError('Ошибка соединения')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold text-gray-900">ALTEKO</Link>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">Расчёт реновации</h1>

        {error && (
          <p className="text-sm text-danger bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>
        )}

        {result && (
          <>
            {!result.isPersonalized && (
              <p className="text-xs text-warning bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                Расчёт основан на средних данных по серии. Загрузите счёт для точного расчёта.
              </p>
            )}

            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <p className="text-sm font-medium text-gray-700">Экономия на отоплении</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Сейчас:</span>
                <span className="text-sm font-medium">€{result.savings.currentHeatingMonthly}/мес.</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">После реновации:</span>
                <span className="text-sm font-medium text-success">€{result.savings.projectedHeatingMonthly}/мес.</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-medium text-gray-700">Экономия:</span>
                <span className="text-lg font-bold text-success">€{result.savings.monthlySavingsPerApt}/мес./кв.</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <p className="text-sm font-medium text-gray-700">Финансирование</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Стоимость реновации:</span>
                <span>€{result.costEstimate.low.toLocaleString()} – €{result.costEstimate.high.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Субсидия Altum ({Math.round(result.subsidy.subsidyPercent)}%):</span>
                <span className="text-success">€{result.subsidy.subsidyAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-gray-500">Ваша доля (на квартиру):</span>
                <span className="font-medium">€{result.subsidy.ownerSharePerApt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Срок окупаемости:</span>
                <span className="font-medium">{result.subsidy.paybackYears} лет</span>
              </div>
            </div>

            {docUrls ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
                <p className="text-sm font-medium text-success">Документы готовы:</p>
                <div className="space-y-2">
                  <a href={docUrls.intentRu} target="_blank" className="block text-sm text-primary underline">
                    Заявление о намерении (RU)
                  </a>
                  <a href={docUrls.intentLv} target="_blank" className="block text-sm text-primary underline">
                    Nodomu pieteikums (LV)
                  </a>
                  <a href={docUrls.agendaRu} target="_blank" className="block text-sm text-primary underline">
                    Повестка собрания (RU)
                  </a>
                  <a href={docUrls.agendaLv} target="_blank" className="block text-sm text-primary underline">
                    Sapulces darba kārtība (LV)
                  </a>
                </div>
              </div>
            ) : (
              <button
                onClick={handleGenerateDocs}
                disabled={generating}
                className="btn-primary"
              >
                {generating ? 'Готовим документы...' : 'Скачать документы для Altum'}
              </button>
            )}

            <Link
              href={`/dashboard/voting?buildingId=${buildingId}`}
              className="block text-center py-3 border border-primary rounded-lg text-primary text-sm font-medium hover:bg-blue-50"
            >
              Начать голосование собственников →
            </Link>
          </>
        )}
      </main>
    </div>
  )
}

export default function RenovationCalculatePage() {
  return (
    <Suspense>
      <CalcContent />
    </Suspense>
  )
}
