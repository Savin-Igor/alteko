'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PageHeader, StepProgress, InfoBanner } from '@/components/ui'

type StepStatus = 'done' | 'active' | 'pending' | 'error'

interface ProgressStep {
  key: string
  label: string
  status: StepStatus
}

function buildSteps(current: string): ProgressStep[] {
  const order = ['parsing', 'comparing', 'done']
  const idx = order.indexOf(current)
  return [
    { key: 'parsing', label: 'Читаем данные счёта...', status: idx > 0 ? 'done' : idx === 0 ? 'active' : 'pending' },
    { key: 'comparing', label: 'Сравниваем с похожими домами...', status: idx > 1 ? 'done' : idx === 1 ? 'active' : 'pending' },
    { key: 'done', label: 'Результат готов', status: current === 'done' ? 'done' : 'pending' },
  ]
}

function PreviewContent() {
  const searchParams = useSearchParams()
  const reportId = searchParams.get('reportId') ?? ''
  const buildingId = searchParams.get('building') ?? ''
  const cadastralCode = searchParams.get('cadastralCode') ?? ''

  const [step, setStep] = useState<string>('parsing')
  const [deviation, setDeviation] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const ranRef = useRef(false)

  useEffect(() => {
    if (!reportId || ranRef.current) return
    ranRef.current = true

    // Guard against re-running on browser back
    const guardKey = `alteko_preview_ran_${reportId}`
    if (sessionStorage.getItem(guardKey)) {
      // Already ran — jump straight to report
      setStep('done')
      return
    }

    async function run() {
      setStep('parsing')
      const parseRes = await fetch('/api/audit/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId }),
      })

      if (!parseRes.ok) {
        const data = await parseRes.json()
        setError(data.error ?? 'Не удалось прочитать счёт.')
        setStep('failed')
        return
      }

      setStep('comparing')
      const benchRes = await fetch(`/api/benchmarks/compare?reportId=${reportId}`)
      if (benchRes.ok) {
        const data = await benchRes.json()
        setDeviation(data.benchmark?.overallDeviationPct ?? null)
      }

      sessionStorage.setItem(guardKey, '1')
      setStep('done')
    }

    run().catch((e) => {
      console.error(e)
      setError('Ошибка соединения. Проверьте интернет и попробуйте снова.')
      setStep('failed')
    })
  }, [reportId])

  const uploadHref = cadastralCode
    ? `/audit/upload?building=${buildingId}&cadastralCode=${cadastralCode}`
    : '/'

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader variant="minimal" />

      <main className="flex-1 px-4 py-12 max-w-md mx-auto w-full">
        <h1 className="text-xl font-semibold text-gray-900 mb-8">Анализируем ваш счёт</h1>

        {step === 'failed' ? (
          <div className="space-y-4">
            <InfoBanner variant="error">{error}</InfoBanner>
            <Link href={uploadHref} className="btn-primary text-center block">
              Попробовать снова
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <StepProgress steps={buildSteps(step)} />

            <p className="text-xs text-gray-400">Обычно занимает 15–30 секунд</p>

            {step !== 'done' && (
              <InfoBanner variant="info">
                Пока ждёте: дома серии 119 тратят в среднем на 38% больше на отопление,
                чем дома после реновации той же площади.
              </InfoBanner>
            )}

            {step === 'done' && (
              <div className="space-y-4">
                {deviation !== null && (
                  <div className="card text-center py-4 space-y-1">
                    <p className={`text-metric-xl font-bold ${deviation > 0 ? 'text-danger' : 'text-success'}`}>
                      {deviation > 0 ? '+' : ''}{deviation}%
                    </p>
                    <p className="text-sm text-gray-500">к медиане похожих домов</p>
                  </div>
                )}
                <Link
                  href={`/audit/report/${reportId}`}
                  className="btn-primary text-center block"
                >
                  Смотреть отчёт →
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default function PreviewPage() {
  return (
    <Suspense>
      <PreviewContent />
    </Suspense>
  )
}
