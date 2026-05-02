'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { InfoBanner } from '@/components/ui'

function TagButton({
  label,
  active,
  onToggle,
}: {
  label: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-3 py-2 rounded-full text-sm border transition-colors min-h-[40px] ${
        active
          ? 'bg-primary text-white border-primary'
          : 'border-gray-300 text-gray-600 hover:border-gray-400'
      }`}
    >
      {label}
    </button>
  )
}

export default function ContractorRegisterPage() {
  const t = useTranslations('contractors')
  const specializations = t.raw('specializations') as string[]
  const districts = t.raw('districts') as string[]

  const [companyName, setCompanyName] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [specs, setSpecs] = useState<string[]>([])
  const [coverage, setCoverage] = useState<string[]>([])
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ id: string; verified: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)

  function toggleSpec(s: string) {
    setSpecs((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s])
  }
  function toggleCoverage(d: string) {
    setCoverage((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed || specs.length === 0 || coverage.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/contractors/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          registrationNumber: regNumber.trim(),
          specializations: specs,
          geographicCoverage: coverage,
        }),
      })
      const data = await res.json()
      if (res.ok) setResult({ id: data.contractorId, verified: data.luroftVerified })
      else setError(data.error ?? t('errorRegister'))
    } catch {
      setError(t('errorConnection'))
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 px-4 py-16 max-w-md mx-auto w-full text-center space-y-4">
          <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M5 14l6 6L23 8" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{t('applicationSent')}</h1>
          <p className="text-gray-500 leading-relaxed">
            {result.verified ? t('verifiedMessage') : t('unverifiedMessage')}
          </p>
          <p className="text-xs text-gray-400">{t('applicationId', { id: result.id })}</p>
          <Link href="/" className="btn-secondary inline-block w-auto px-8 mt-2">
            {t('backHome')}
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <section className="px-4 py-8 bg-primary-light border-b border-blue-100">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {t('valuePropTitle')}
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            {t('valuePropDesc')}
          </p>
          <div className="flex gap-4 mt-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <span className="status-dot-success" />
              {t('lursoftVerification')}
            </span>
            <span className="flex items-center gap-1">
              <span className="status-dot-success" />
              {t('commission')}
            </span>
            <span className="flex items-center gap-1">
              <span className="status-dot-success" />
              {t('verifiedClients')}
            </span>
          </div>
        </div>
      </section>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="company-name" className="text-sm font-medium text-gray-700 block mb-1">
              {t('companyName')}
            </label>
            <input
              id="company-name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="SIA Būvnieks"
              required
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="reg-number" className="text-sm font-medium text-gray-700 block mb-1">
              {t('regNumber')}
            </label>
            <input
              id="reg-number"
              type="text"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="40001234567"
              required
              className="input-field"
            />
            <p className="text-xs text-gray-400 mt-1">
              {t('checkedVia')}
              <a href="https://www.lursoft.lv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Lursoft
              </a>
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              {t('specializationLabel')}{specs.length > 0 && <span className="text-primary ml-1">({specs.length})</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {specializations.map((s) => (
                <TagButton key={s} label={s} active={specs.includes(s)} onToggle={() => toggleSpec(s)} />
              ))}
            </div>
            {specs.length === 0 && (
              <p className="text-xs text-gray-400 mt-2">{t('selectAtLeastOne')}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              {t('coverageLabel')}{coverage.length > 0 && <span className="text-primary ml-1">({coverage.length})</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {districts.map((d) => (
                <TagButton key={d} label={d} active={coverage.includes(d)} onToggle={() => toggleCoverage(d)} />
              ))}
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 flex-shrink-0"
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              {t('agreementText')}
            </span>
          </label>

          {error && <InfoBanner variant="error">{error}</InfoBanner>}

          <button
            type="submit"
            disabled={loading || !agreed || specs.length === 0 || coverage.length === 0}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('checkingLursoft')}
              </span>
            ) : t('submitButton')}
          </button>
        </form>
      </main>
    </div>
  )
}
