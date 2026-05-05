'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { PageHeader, StepProgress, InfoBanner } from '@/components/ui'

type StepStatus = 'done' | 'active' | 'pending' | 'error'

interface ProgressStep {
  key: string
  label: string
  status: StepStatus
}

function PreviewContent() {
  const t = useTranslations('audit.preview')
  const searchParams = useSearchParams()
  const reportId = searchParams.get('reportId') ?? ''
  const buildingId = searchParams.get('building') ?? ''
  const cadastralCode = searchParams.get('cadastralCode') ?? ''

  const [step, setStep] = useState<string>('parsing')
  const [deviation, setDeviation] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const ranRef = useRef(false)

  function buildSteps(current: string): ProgressStep[] {
    const order = ['parsing', 'comparing', 'done']
    const idx = order.indexOf(current)
    return [
      { key: 'parsing', label: t('stepParsing'), status: idx > 0 ? 'done' : idx === 0 ? 'active' : 'pending' },
      { key: 'comparing', label: t('stepComparing'), status: idx > 1 ? 'done' : idx === 1 ? 'active' : 'pending' },
      { key: 'done', label: t('stepDone'), status: current === 'done' ? 'done' : 'pending' },
    ]
  }

  useEffect(() => {
    if (!reportId || ranRef.current) return
    ranRef.current = true

    // Guard against re-running on browser back
    const guardKey = `alteko_preview_ran_${reportId}`
    if (sessionStorage.getItem(guardKey)) {
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
        setError(data.error ?? t('errorParse'))
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
      setError(t('errorConnection'))
      setStep('failed')
    })
  }, [reportId, t])

  const uploadHref = cadastralCode
    ? `/audit/upload?building=${buildingId}&cadastralCode=${cadastralCode}`
    : '/'

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader variant="minimal" />

      <main className="flex-1 px-4 py-12 max-w-md mx-auto w-full">
        <h1 className="text-xl font-semibold text-gray-900 mb-8">{t('title')}</h1>

        {step === 'failed' ? (
          <div className="space-y-4">
            <InfoBanner variant="error">{error}</InfoBanner>
            <Link href={uploadHref} className="btn-primary text-center block">
              {t('tryAgain')}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <StepProgress steps={buildSteps(step)} />

            <p className="text-xs text-gray-400">{t('timeEstimate')}</p>

            {step !== 'done' && (
              <InfoBanner variant="info">
                {t('waitingTip')}
              </InfoBanner>
            )}

            {step === 'done' && (
              <div className="space-y-4">
                {deviation !== null && (
                  <div className="card text-center py-4 space-y-1">
                    <p className={`text-metric-xl font-bold ${deviation > 0 ? 'text-danger' : 'text-success'}`}>
                      {deviation > 0 ? '+' : ''}{deviation}%
                    </p>
                    <p className="text-sm text-gray-500">{t('toMedian')}</p>
                  </div>
                )}
                <Link
                  href={`/audit/report/${reportId}`}
                  className="btn-primary text-center block"
                >
                  {t('viewReport')}
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
