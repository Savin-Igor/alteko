'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { SiteFooter } from '@/components/ui/SiteFooter'

type Step = 'form' | 'processing' | 'success' | 'error'

export default function ReadinessReportOrderPage() {
  const t = useTranslations('readinessReport')
  const searchParams = useSearchParams()
  const cadastralCode = searchParams.get('cadastralCode') ?? ''
  const address = searchParams.get('address') ?? ''

  const [step, setStep] = useState<Step>('form')
  const [email, setEmail] = useState('')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [amountEur, setAmountEur] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState<'LV' | 'RU'>('LV')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep('processing')
    setError(null)

    try {
      const res = await fetch('/api/readiness-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cadastralCode, email, language }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Order failed')
      }

      const data = await res.json()
      setOrderId(data.orderId)
      setAmountEur(data.amountEur)

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStep('error')
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-success-light flex items-center justify-center mx-auto">
              <span className="status-dot-success w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{t('success.title')}</h1>
            <p className="text-gray-500">{t('success.description', { email })}</p>
            {orderId && (
              <p className="text-xs text-gray-400">{t('success.orderId', { id: orderId })}</p>
            )}
            {amountEur && (
              <p className="text-sm font-medium text-gray-700">{t('success.amount', { amount: amountEur })}</p>
            )}
            <Link href="/" className="btn-primary block mt-4">{t('success.backHome')}</Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 min-h-[44px]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('back')}
        </Link>

        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
          </div>

          {address && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-medium">{address}</p>
              <p className="text-xs text-gray-400 mt-0.5">{cadastralCode}</p>
            </div>
          )}

          {/* What's included */}
          <div className="card space-y-2">
            <p className="text-sm font-semibold text-gray-900">{t('includes.heading')}</p>
            <ul className="space-y-1.5">
              {(t.raw('includes.items') as string[]).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="status-dot-success mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing note */}
          <div className="text-sm text-gray-500 leading-relaxed">
            {t('pricingNote')}
          </div>

          {/* Order form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('emailLabel')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('languageLabel')}
              </label>
              <div className="flex gap-3">
                {(['LV', 'RU'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      language === lang
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {lang === 'LV' ? 'Latviešu' : 'Русский'}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-danger">{error}</p>
            )}

            <button
              type="submit"
              disabled={step === 'processing'}
              className="btn-primary w-full"
            >
              {step === 'processing' ? t('submitting') : t('submit')}
            </button>

            <p className="text-xs text-gray-400 text-center">{t('legalNote')}</p>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
