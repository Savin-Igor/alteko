'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
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

type DocKey = 'intentRu' | 'intentLv' | 'agendaRu' | 'agendaLv'

function CalcContent() {
  const t = useTranslations('renovation.calculate')
  const tDocs = useTranslations('renovation.calculate.docs')

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
      .catch(() => { setError(t('errorLoad')); setLoading(false) })
  }, [buildingId, t])

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
      else setError(data.error ?? t('errorGenerate'))
    } catch {
      setError(t('errorConnection'))
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
        <h1 className="text-xl font-semibold text-gray-900">{t('title')}</h1>

        {error && <InfoBanner variant="error">{error}</InfoBanner>}

        {result && (
          <>
            {!result.isPersonalized && (
              <InfoBanner variant="info">
                {t('warningGeneric')}
              </InfoBanner>
            )}

            <div className="card space-y-3">
              <p className="text-sm font-medium text-gray-700">{t('savingsTitle')}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t('currentLabel')}</span>
                <span className="text-sm font-medium text-gray-900">{t('perMonthValue', { amount: result.savings.currentHeatingMonthly })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t('afterRenovationLabel')}</span>
                <span className="text-sm font-medium text-success">{t('perMonthValue', { amount: result.savings.projectedHeatingMonthly })}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                <span className="text-sm font-medium text-gray-700">{t('savingsLabel')}</span>
                <span className="text-lg font-bold text-success">{t('perMonthPerAptValue', { amount: result.savings.monthlySavingsPerApt })}</span>
              </div>
            </div>

            <div className="card space-y-3">
              <p className="text-sm font-medium text-gray-700">{t('financingTitle')}</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('renovationCost')}</span>
                <span className="text-gray-900">€{result.costEstimate.low.toLocaleString()} – €{result.costEstimate.high.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('altumSubsidy', { percent: Math.round(result.subsidy.subsidyPercent) })}</span>
                <span className="text-success font-medium">€{result.subsidy.subsidyAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                <span className="text-gray-500">{t('yourShare')}</span>
                <span className="font-medium text-gray-900">€{result.subsidy.ownerSharePerApt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('paybackPeriod')}</span>
                <span className="font-medium text-gray-900">{t('yearsValue', { years: result.subsidy.paybackYears })}</span>
              </div>
            </div>

            {docUrls ? (
              <div className="card space-y-3">
                <p className="text-sm font-medium text-success">{t('documentsReady')}</p>
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
                        <p className="text-sm text-primary font-medium">{tDocs(`${key as DocKey}.label`)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{tDocs(`${key as DocKey}.description`)}</p>
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
                    {t('preparingDocs')}
                  </span>
                ) : t('downloadDocs')}
              </button>
            )}

            <a
              href={`/dashboard/voting?buildingId=${buildingId}`}
              className="btn-primary text-center block"
            >
              {t('startVoting')}
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
