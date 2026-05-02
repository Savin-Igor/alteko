import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { PageHeader } from '@/components/ui'

export default async function VerifyRequestPage() {
  const t = await getTranslations('auth')

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader variant="minimal" />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 4h16v16H4z" stroke="#2563EB" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M4 4l8 8 8-8" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-gray-900">{t('checkEmail')}</h1>
          <p className="text-gray-500 leading-relaxed">
            {t('checkEmailDesc')}
          </p>
          <p className="text-sm text-gray-400">
            {t('linkExpiry')}
          </p>

          <Link href="/auth/signin" className="text-sm text-primary hover:underline block">
            {t('requestNew')}
          </Link>

          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 block">
            {t('backToMainShort')}
          </Link>
        </div>
      </main>
    </div>
  )
}
