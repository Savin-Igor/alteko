'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { PageHeader, InfoBanner } from '@/components/ui'

export default function SignInPage() {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)

    const result = await signIn('email', {
      email: email.trim(),
      redirect: false,
      callbackUrl: '/dashboard',
    })

    setLoading(false)

    if (result?.error) {
      setError(t('errorSendFailed'))
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col">
        <PageHeader variant="minimal" />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-sm text-center space-y-4">
            <div className="w-14 h-14 bg-success-light rounded-full flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12l5 5L20 7" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{t('checkEmail')}</h1>
            <p className="text-gray-500 leading-relaxed">
              {t.rich('emailSentBody', {
                email: () => <span className="font-medium text-gray-900">{email}</span>,
              })}
            </p>
            <p className="text-xs text-gray-400">
              {t('spamCheck')}
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="text-sm text-primary hover:underline"
            >
              {t('tryAnother')}
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader variant="minimal" />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('signIn')}</h1>
            <p className="text-gray-500 text-sm">
              {t('signInDesc')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="signin-email" className="text-sm font-medium text-gray-700 block mb-1">
                {t('emailLabel')}
              </label>
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                required
                autoComplete="email"
                className="input-field"
              />
            </div>

            {error && <InfoBanner variant="error">{error}</InfoBanner>}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('sending')}
                </span>
              ) : t('sendLink')}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center">
            {t('noPassword')}
          </p>

          <div className="border-t border-gray-100 pt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
              {t('backToMain')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
