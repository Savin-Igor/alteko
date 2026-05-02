'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageHeader, InfoBanner } from '@/components/ui'

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

interface DocUrls {
  intentRu?: string
  intentLv?: string
  agendaRu?: string
  agendaLv?: string
}

const DOC_LABELS: Record<string, string> = {
  intentRu: 'Заявление о намерении (RU)',
  intentLv: 'Nodomu pieteikums (LV)',
  agendaRu: 'Повестка собрания (RU)',
  agendaLv: 'Sapulces darba kārtība (LV)',
}

const DOC_DESCRIPTIONS: Record<string, string> = {
  intentRu: 'Нужно для подачи в Altum',
  intentLv: 'Nepieciešams iesniegšanai Altum',
  agendaRu: 'Для проведения собрания собственников',
  agendaLv: 'Īpašnieku sapulcei',
}

function CalcContent() {
  const searchParams = useSearchParams()
  const buildingId = searchParams.get('buildingId') ?? ''

  const [result, setResult] = useState<CalcResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [docUrls, setDocUrls] = useState<DocUrls | null>(null)

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <PageHeader variant="minimal" />
        <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-4">
          <div className="card animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
            <div className="h-8 bg-gray-100 rounded w-2/3" />
          </div>
          <div className="card animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
              <div className="h-4 bg-gray-100 rounded w-4/6" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader variant="minimal" />

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">Расчёт реновации</h1>

        {error && <InfoBanner variant="error">{error}</InfoBanner>}

        {result && (
          <>
            {!result.isPersonalized && (
              <InfoBanner variant="info">
                Расчёт основан на средних данных по серии. Загрузите счёт для точного расчёта.
              </InfoBanner>
            )}

            {/* Savings card */}
            <div className="card space-y-3">
              <p className="text-sm font-medium text-gray-700">Экономия на отоплении</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Сейчас:</span>
                <span className="text-sm font-medium text-gray-900">€{result.savings.currentHeatingMonthly}/мес.</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">После реновации:</span>
                <span className="text-sm font-medium text-success">€{result.savings.projectedHeatingMonthly}/мес.</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                <span className="text-sm font-medium text-gray-700">Экономия:</span>
                <span className="text-lg font-bold text-success">€{result.savings.monthlySavingsPerApt}/мес./кв.</span>
              </div>
            </div>

            {/* Financing card */}
            <div className="card space-y-3">
              <p className="text-sm font-medium text-gray-700">Финансирование</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Стоимость реновации:</span>
                <span className="text-gray-900">€{result.costEstimate.low.toLocaleString()} – €{result.costEstimate.high.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Субсидия Altum ({Math.round(result.subsidy.subsidyPercent)}%):</span>
                <span className="text-success font-medium">€{result.subsidy.subsidyAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                <span className="text-gray-500">Ваша доля (на квартиру):</span>
                <span className="font-medium text-gray-900">€{result.subsidy.ownerSharePerApt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Срок окупаемости:</span>
                <span className="font-medium text-gray-900">{result.subsidy.paybackYears} лет</span>
              </div>
            </div>

            {/* Documents */}
            {docUrls ? (
              <div className="card space-y-3">
                <p className="text-sm font-medium text-success">Документы готовы:</p>
                <div className="space-y-2">
                  {Object.entries(docUrls).map(([key, url]) => url ? (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-h-[56px]"
                    >
                      <div className="flex-shrink-0 text-gray-400 mt-0.5" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M9 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6L9 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                          <path d="M9 2v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-primary font-medium">{DOC_LABELS[key] ?? key}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{DOC_DESCRIPTIONS[key] ?? ''}</p>
                      </div>
                    </a>
                  ) : null)}
                </div>
              </div>
            ) : (
              <button
                onClick={handleGenerateDocs}
                disabled={generating}
                className="btn-secondary"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Готовим документы...
                  </span>
                ) : 'Скачать документы для Altum'}
              </button>
            )}

            {/* Voting CTA — primary hierarchy */}
            <a
              href={`/dashboard/voting?buildingId=${buildingId}`}
              className="btn-primary text-center block"
            >
              Начать голосование собственников →
            </a>
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
