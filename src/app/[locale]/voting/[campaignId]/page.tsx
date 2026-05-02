'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
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
        setError(data.error ?? 'Ошибка запроса')
        setAuthStep('smartid-input')
        return
      }
      sessionIdRef.current = data.sessionId
      setVerificationCode(data.verificationCode)
      setAuthStep('smartid-polling')
      pollSmartId(data.sessionId)
    } catch {
      setError('Ошибка соединения')
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
    setError('Smart-ID не ответил за 90 секунд. Попробуйте снова.')
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
          <p className="text-gray-500">Кампания не найдена.</p>
          <Link href="/" className="btn-secondary inline-block w-auto px-6">На главную</Link>
        </div>
      </div>
    </div>
  )

  const yesSharePct = Math.round(status.currentYesShare * 100)
  const requiredPct = Math.round(status.requiredThreshold * 100)
  const isClosed = status.status !== 'ACTIVE'

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader variant="minimal" />

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-5">
        {/* Header */}
        <div>
          <p className="text-sm text-gray-500">{status.building.address}</p>
          <h1 className="text-lg font-bold text-gray-900 mt-0.5 leading-snug">{status.title}</h1>
          {status.deadline && (
            <p className="text-xs text-gray-400 mt-1">
              До {new Date(status.deadline).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Проголосовали:</span>
            <span className="font-medium text-gray-900">
              {status.totalVoted} из {status.building.apartmentCount ?? '?'}
            </span>
          </div>

          <ProgressBar
            value={status.currentYesShare}
            variant={status.thresholdReached ? 'success' : 'primary'}
            label={`За: ${yesSharePct}% · Нужно: ${requiredPct}%`}
          />

          {/* Vote counts */}
          <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-gray-100">
            {([
              { key: 'YES' as const, label: 'За', color: 'text-success' },
              { key: 'NO' as const, label: 'Против', color: 'text-danger' },
              { key: 'ABSTAIN' as const, label: 'Воздерж.', color: 'text-gray-500' },
            ]).map(({ key, label, color }) => (
              <div key={key}>
                <p className={`text-xl font-bold ${color}`}>{status.votes.counts[key]}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {status.thresholdReached && (
            <InfoBanner variant="success">
              Решение принято — необходимый порог достигнут. Протокол сформирован.
            </InfoBanner>
          )}
          {status.status === 'CANCELLED' && (
            <InfoBanner variant="warning">
              Голосование завершено. Порог не набран.
            </InfoBanner>
          )}
        </div>

        {/* Auth / Vote */}
        {!isClosed && !voted && (
          <div className="card space-y-4">
            <p className="text-sm font-medium text-gray-700">Ваш голос</p>

            {error && <InfoBanner variant="error">{error}</InfoBanner>}

            {/* Choose method */}
            {authStep === 'choose' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Подпишите с помощью:</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAuthStep('smartid-input')}
                    className="flex-1 py-3 min-h-[48px] border-2 border-primary rounded-lg text-sm font-medium text-primary hover:bg-primary-light transition-colors"
                  >
                    Smart-ID
                  </button>
                  <a
                    href="/api/auth/eparaksts/start"
                    className="flex-1 py-3 min-h-[48px] border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 text-center flex items-center justify-center transition-colors"
                  >
                    eParaksts
                  </a>
                </div>
              </div>
            )}

            {/* Smart-ID: input personal code */}
            {authStep === 'smartid-input' && (
              <div className="space-y-3">
                <label htmlFor="personal-code" className="text-sm text-gray-600 block">
                  Персональный код
                </label>
                <input
                  id="personal-code"
                  type="text"
                  value={personalCode}
                  onChange={(e) => setPersonalCode(e.target.value)}
                  placeholder="XXXXXX-XXXXX"
                  className="input-field"
                  autoComplete="off"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthStep('choose')}
                    className="btn-ghost flex-1"
                  >
                    Назад
                  </button>
                  <button onClick={initSmartId} className="btn-primary flex-1">
                    Продолжить
                  </button>
                </div>
              </div>
            )}

            {/* Smart-ID: loading (waiting for API) */}
            {authStep === 'smartid-loading' && (
              <div className="text-center space-y-3 py-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-600">Отправляем запрос в Smart-ID...</p>
              </div>
            )}

            {/* Smart-ID: show verification code */}
            {authStep === 'smartid-polling' && verificationCode && (
              <div className="text-center space-y-3 py-2">
                <p className="text-sm text-gray-600">Откройте приложение Smart-ID и подтвердите:</p>
                <p className="text-5xl font-bold tracking-widest text-primary py-2">
                  {verificationCode}
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                  Ожидаем подтверждения...
                </div>
              </div>
            )}

            {/* Vote buttons */}
            {authStep === 'done' && (
              <div className="space-y-3">
                <InfoBanner variant="success">Личность подтверждена. Выберите решение:</InfoBanner>
                <div className="space-y-2">
                  <button
                    onClick={() => setVoted('YES')}
                    className="w-full py-3.5 min-h-[52px] border-2 border-success rounded-lg text-sm font-semibold text-success hover:bg-success-light transition-colors"
                  >
                    Поддерживаю реновацию
                  </button>
                  <button
                    onClick={() => setVoted('NO')}
                    className="w-full py-3.5 min-h-[52px] border-2 border-danger rounded-lg text-sm font-semibold text-danger hover:bg-danger-light transition-colors"
                  >
                    Против
                  </button>
                  <button
                    onClick={() => setVoted('ABSTAIN')}
                    className="w-full py-3.5 min-h-[52px] border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Воздерживаюсь
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voted confirmation */}
        {voted && (
          <div className="card bg-success-light border-green-200 text-center py-6 space-y-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12l5 5L20 7" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="font-semibold text-success">Голос записан</p>
            <p className="text-sm text-gray-600">
              Ваше решение:{' '}
              <span className="font-medium">
                {voted === 'YES' ? 'За реновацию' : voted === 'NO' ? 'Против' : 'Воздержался'}
              </span>
            </p>
            <p className="text-xs text-gray-400">Данные подписаны электронной подписью</p>
          </div>
        )}
      </main>
    </div>
  )
}
