'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

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

type AuthStep = 'choose' | 'smartid-input' | 'smartid-polling' | 'done'

export default function VotingPage({ params }: Props) {
  const [campaignId, setCampaignId] = useState<string>('')
  const [status, setStatus] = useState<CampaignStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [authStep, setAuthStep] = useState<AuthStep>('choose')
  const [personalCode, setPersonalCode] = useState('')
  const [verificationCode, setVerificationCode] = useState<string | null>(null)
  // sessionId stored in closure for polling
  const sessionIdRef = { current: null as string | null }
  const setSessionId = (v: string | null) => { sessionIdRef.current = v }
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
    try {
      const res = await fetch('/api/auth/smartid/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalCode: personalCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSessionId(data.sessionId)
      setVerificationCode(data.verificationCode)
      setAuthStep('smartid-polling')
      pollSmartId(data.sessionId)
    } catch {
      setError('Ошибка соединения')
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
    setError('Smart-ID не ответил в течение 90 секунд. Попробуйте снова.')
    setAuthStep('choose')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!status) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <p className="text-gray-500">Кампания не найдена.</p>
    </div>
  )

  const yesSharePct = Math.round(status.currentYesShare * 100)
  const requiredPct = Math.round(status.requiredThreshold * 100)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold text-gray-900">ALTEKO</Link>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-5">
        <div>
          <p className="text-sm text-gray-500">Голосование · {status.building.address}</p>
          <h1 className="text-lg font-semibold text-gray-900 mt-1">{status.title}</h1>
          {status.deadline && (
            <p className="text-xs text-gray-400 mt-1">
              Открыто до {new Date(status.deadline).toLocaleDateString('ru-RU')}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Проголосовали:</span>
            <span>{status.totalVoted} из {status.building.apartmentCount ?? '?'} собственников</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${status.thresholdReached ? 'bg-success' : 'bg-primary'}`}
              style={{ width: `${Math.min(yesSharePct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className={status.thresholdReached ? 'text-success font-medium' : 'text-gray-600'}>
              За: {yesSharePct}%
            </span>
            <span className="text-gray-400">Нужно: {requiredPct}%</span>
          </div>
          {status.thresholdReached && (
            <p className="text-sm text-success font-medium">
              🎉 Решение принято! Протокол сформирован.
            </p>
          )}
          {status.status === 'CANCELLED' && (
            <p className="text-sm text-gray-500">Голосование завершено. Решение не принято.</p>
          )}
        </div>

        {/* Vote counts */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
          {(['YES', 'NO', 'ABSTAIN'] as const).map((d) => (
            <div key={d}>
              <p className="text-lg font-bold">{status.votes.counts[d]}</p>
              <p className="text-xs text-gray-400">{d === 'YES' ? 'За' : d === 'NO' ? 'Против' : 'Воздерж.'}</p>
            </div>
          ))}
        </div>

        {/* Auth / Vote section */}
        {status.status === 'ACTIVE' && !voted && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <p className="text-sm font-medium text-gray-700">Ваш голос:</p>

            {authStep === 'choose' && (
              <>
                <p className="text-xs text-gray-500">Подпишите через:</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAuthStep('smartid-input')}
                    className="flex-1 py-3 border-2 border-primary rounded-lg text-sm font-medium text-primary hover:bg-blue-50"
                  >
                    Smart-ID
                  </button>
                  <a
                    href="/api/auth/eparaksts/start"
                    className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 text-center"
                  >
                    eParaksts
                  </a>
                </div>
              </>
            )}

            {authStep === 'smartid-input' && (
              <div className="space-y-3">
                <label className="text-sm text-gray-600">Персональный код:</label>
                <input
                  type="text"
                  value={personalCode}
                  onChange={(e) => setPersonalCode(e.target.value)}
                  placeholder="XXXXXX-XXXXX"
                  className="input-field"
                />
                {error && <p className="text-sm text-danger">{error}</p>}
                <button onClick={initSmartId} className="btn-primary">
                  Подтвердить через Smart-ID
                </button>
              </div>
            )}

            {authStep === 'smartid-polling' && verificationCode && (
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">Откройте приложение Smart-ID и подтвердите:</p>
                <p className="text-4xl font-bold tracking-widest text-primary">{verificationCode}</p>
                <p className="text-xs text-gray-400">Ожидаем подтверждения...</p>
                <div className="flex justify-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            )}

            {authStep === 'done' && (
              <div className="space-y-3">
                <p className="text-sm text-success">✓ Личность подтверждена. Выберите решение:</p>
                <div className="space-y-2">
                  {(['YES', 'NO', 'ABSTAIN'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setVoted(d)}
                      className={`w-full py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        d === 'YES' ? 'border-success text-success hover:bg-green-50' :
                        d === 'NO' ? 'border-danger text-danger hover:bg-red-50' :
                        'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {d === 'YES' ? '✓ За реновацию' : d === 'NO' ? '✗ Против' : '— Воздержался'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {voted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <p className="text-success font-medium">
              Ваш голос ({voted === 'YES' ? 'За' : voted === 'NO' ? 'Против' : 'Воздержался'}) записан.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
