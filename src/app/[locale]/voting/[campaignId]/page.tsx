'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { PageHeader, ProgressBar, InfoBanner } from '@/components/ui'

interface CampaignStatus {
  campaignId: string
  title: string
  status: string
  building: { address: string; apartmentCount: number | null }
  requiredThreshold: number
  currentYesShare: number
  deadline: string | null
  votes: { counts: { YES: number; NO: number; ABSTAIN: number } }
  totalVoted: number
  thresholdReached: boolean
}

interface Props {
  params: Promise<{ campaignId: string }>
}

type AuthStep = 'choose' | 'smartid-input' | 'smartid-loading' | 'smartid-polling' | 'done'

export default function VotingPage({ params }: Props) {
  const t = useTranslations('voting')
  const locale = useLocale()

  const [campaignId, setCampaignId] = useState<string>('')
  const [status, setStatus] = useState<CampaignStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [authStep, setAuthStep] = useState<AuthStep>('choose')
  const [personalCode, setPersonalCode] = useState('')
  const [verificationCode, setVerificationCode] = useState<string | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const [voted, setVoted] = useState<'YES' | 'NO' | 'ABSTAIN' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then((p) => setCampaignId(p.campaignId))
  }, [params])

  const loadStatus = useCallback(async () => {
    if (!campaignId) return
    try {
      const res = await fetch(`/api/voting/status?campaignId=${campaignId}`)
      if (res.ok) setStatus(await res.json())
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    loadStatus()
    const interval = setInterval(loadStatus, 10000)
    return () => clearInterval(interval)
  }, [loadStatus])

  async function initSmartId() {
    if (!personalCode.trim()) return
    setError(null)
    setAuthStep('smartid-loading')
    try {
      const res = await fetch('/api/auth/smartid/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalCode: personalCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? t('errorRequest'))
        setAuthStep('smartid-input')
        return
      }
      sessionIdRef.current = data.sessionId
      setVerificationCode(data.verificationCode)
      setAuthStep('smartid-polling')
      pollSmartId(data.sessionId)
    } catch {
      setError(t('errorConnection'))
      setAuthStep('smartid-input')
    }
  }

  async function pollSmartId(sid: string) {
    for (let i = 0; i < 45; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      try {
        const res = await fetch('/api/auth/smartid/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid }),
        })
        const data = await res.json()
        if (data.status === 'COMPLETE') {
          setAuthStep('done')
          return
        }
      } catch { /* retry */ }
    }
    setError(t('smartIdTimeout'))
    setAuthStep('choose')
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <PageHeader variant="minimal" />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  if (!status) return (
    <div className="min-h-screen flex flex-col">
      <PageHeader variant="minimal" />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-gray-500">{t('campaignNotFound')}</p>
          <Link href="/" className="btn-secondary inline-block w-auto px-6">{t('backHome')}</Link>
        </div>
      </div>
    </div>
  )

  const yesSharePct = Math.round(status.currentYesShare * 100)
  const requiredPct = Math.round(status.requiredThreshold * 100)
  const isClosed = status.status !== 'ACTIVE'
  const dateLocale = locale === 'lv' ? 'lv-LV' : 'ru-RU'

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader variant="minimal" />

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-5">
        <div>
          <p className="text-sm text-gray-500">{status.building.address}</p>
          <h1 className="text-lg font-bold text-gray-900 mt-0.5 leading-snug">{status.title}</h1>
          {status.deadline && (
            <p className="text-xs text-gray-400 mt-1">
              {t('deadlinePrefix')}{new Date(status.deadline).toLocaleDateString(dateLocale, {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{t('votedLabel')}</span>
            <span className="font-medium text-gray-900">
              {t('votedCount', { voted: status.totalVoted, total: status.building.apartmentCount ?? t('totalUnknown') })}
            </span>
          </div>

          <ProgressBar
            value={status.currentYesShare}
            variant={status.thresholdReached ? 'success' : 'primary'}
            label={t('shareLabel', { yes: yesSharePct, required: requiredPct })}
          />

          <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-gray-100">
            {([
              { key: 'YES' as const, label: t('yesLabel'), color: 'text-success' },
              { key: 'NO' as const, label: t('noLabel'), color: 'text-danger' },
              { key: 'ABSTAIN' as const, label: t('abstainLabel'), color: 'text-gray-500' },
            ]).map(({ key, label, color }) => (
              <div key={key}>
                <p className={`text-xl font-bold ${color}`}>{status.votes.counts[key]}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {status.thresholdReached && (
            <InfoBanner variant="success">
              {t('thresholdReached')}
            </InfoBanner>
          )}
          {status.status === 'CANCELLED' && (
            <InfoBanner variant="warning">
              {t('cancelled')}
            </InfoBanner>
          )}
        </div>

        {!isClosed && !voted && (
          <div className="card space-y-4">
            <p className="text-sm font-medium text-gray-700">{t('yourVote')}</p>

            {error && <InfoBanner variant="error">{error}</InfoBanner>}

            {authStep === 'choose' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">{t('signWith')}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAuthStep('smartid-input')}
                    className="flex-1 py-3 min-h-[48px] border-2 border-primary rounded-lg text-sm font-medium text-primary hover:bg-primary-light transition-colors"
                  >
                    Smart-ID
                  </button>
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth redirect requires full browser navigation */}
                  <a
                    href="/api/auth/eparaksts/start"
                    className="flex-1 py-3 min-h-[48px] border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 text-center flex items-center justify-center transition-colors"
                  >
                    eParaksts
                  </a>
                </div>
              </div>
            )}

            {authStep === 'smartid-input' && (
              <div className="space-y-3">
                <label htmlFor="personal-code" className="text-sm text-gray-600 block">
                  {t('personalCodeLabel')}
                </label>
                <input
                  id="personal-code"
                  type="text"
                  value={personalCode}
                  onChange={(e) => setPersonalCode(e.target.value)}
                  placeholder={t('personalCodePlaceholder')}
                  className="input-field"
                  autoComplete="off"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthStep('choose')}
                    className="btn-ghost flex-1"
                  >
                    {t('back')}
                  </button>
                  <button onClick={initSmartId} className="btn-primary flex-1">
                    {t('continue')}
                  </button>
                </div>
              </div>
            )}

            {authStep === 'smartid-loading' && (
              <div className="text-center space-y-3 py-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-600">{t('smartIdLoading')}</p>
              </div>
            )}

            {authStep === 'smartid-polling' && verificationCode && (
              <div className="text-center space-y-3 py-2">
                <p className="text-sm text-gray-600">{t('smartIdConfirm')}</p>
                <p className="text-5xl font-bold tracking-widest text-primary py-2">
                  {verificationCode}
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                  {t('waitingConfirm')}
                </div>
              </div>
            )}

            {authStep === 'done' && (
              <div className="space-y-3">
                <InfoBanner variant="success">{t('identityConfirmed')}</InfoBanner>
                <div className="space-y-2">
                  <button
                    onClick={() => setVoted('YES')}
                    className="w-full py-3.5 min-h-[52px] border-2 border-success rounded-lg text-sm font-semibold text-success hover:bg-success-light transition-colors"
                  >
                    {t('voteYes')}
                  </button>
                  <button
                    onClick={() => setVoted('NO')}
                    className="w-full py-3.5 min-h-[52px] border-2 border-danger rounded-lg text-sm font-semibold text-danger hover:bg-danger-light transition-colors"
                  >
                    {t('voteNo')}
                  </button>
                  <button
                    onClick={() => setVoted('ABSTAIN')}
                    className="w-full py-3.5 min-h-[52px] border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {t('voteAbstain')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {voted && (
          <div className="card bg-success-light border-green-200 text-center py-6 space-y-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12l5 5L20 7" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="font-semibold text-success">{t('voteRecorded')}</p>
            <p className="text-sm text-gray-600">
              {t('yourDecision')}{' '}
              <span className="font-medium">
                {voted === 'YES' ? t('decisionYes') : voted === 'NO' ? t('decisionNo') : t('decisionAbstain')}
              </span>
            </p>
            <p className="text-xs text-gray-400">{t('signedNote')}</p>
          </div>
        )}
      </main>
    </div>
  )
}
