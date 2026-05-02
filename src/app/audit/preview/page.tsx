'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Step = 'uploading' | 'parsing' | 'comparing' | 'done' | 'failed'

const STEP_LABELS: Record<Step, string> = {
  uploading: 'Загружаем файл...',
  parsing: 'Читаем данные счёта...',
  comparing: 'Сравниваем с похожими домами...',
  done: 'Готово',
  failed: 'Ошибка',
}

function PreviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reportId = searchParams.get('reportId') ?? ''

  const [step, setStep] = useState<Step>('parsing')
  const [deviation, setDeviation] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!reportId) return

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

      setStep('done')
      setTimeout(() => {
        router.push(`/audit/report/${reportId}`)
      }, 1500)
    }

    run().catch((e) => {
      console.error(e)
      setError('Ошибка соединения. Проверьте интернет и попробуйте снова.')
      setStep('failed')
    })
  }, [reportId, router])

  const steps: Step[] = ['parsing', 'comparing', 'done']
  const currentIdx = steps.indexOf(step)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold text-gray-900">ALTEKO</Link>
      </header>

      <main className="flex-1 px-4 py-12 max-w-md mx-auto w-full">
        <h1 className="text-xl font-semibold text-gray-900 mb-8">Анализируем ваш счёт</h1>

        {step === 'failed' ? (
          <div className="space-y-4">
            <p className="text-danger text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </p>
            <Link href="/" className="btn-primary text-center block">
              Попробовать снова
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((s, i) => {
              const done = currentIdx > i
              const active = currentIdx === i
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    done ? 'bg-success text-white' : active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {done ? '✓' : active ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : '○'}
                  </div>
                  <span className={`text-sm ${active ? 'text-gray-900 font-medium' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                    {STEP_LABELS[s]}
                  </span>
                </div>
              )
            })}

            <p className="text-xs text-gray-400 mt-6">Обычно занимает 15–30 секунд</p>

            {step !== 'done' && (
              <div className="mt-6 bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  Пока ждёте: дома серии 119 тратят в среднем на 38% больше на отопление,
                  чем дома после реновации той же площади
                </p>
              </div>
            )}

            {step === 'done' && deviation !== null && (
              <div className="mt-6 text-center">
                <p className="text-4xl font-bold text-danger">
                  {deviation > 0 ? '+' : ''}{deviation}%
                </p>
                <p className="text-sm text-gray-500 mt-1">к медиане похожих домов</p>
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
