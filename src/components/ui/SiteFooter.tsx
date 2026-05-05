'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export function SiteFooter() {
  const t = useTranslations('footer')

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-bold text-gray-900 hover:text-primary transition-colors">
              ALTEKO
            </Link>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              {t('description')}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t('servicesTitle')}
            </p>
            <nav className="space-y-2 text-sm">
              <Link href="/audit" className="block text-gray-500 hover:text-gray-900 transition-colors">
                {t('auditLink')}
              </Link>
              <Link href="/renovation" className="block text-gray-500 hover:text-gray-900 transition-colors">
                {t('renovationLink')}
              </Link>
              <Link href="/financing" className="block text-gray-500 hover:text-gray-900 transition-colors">
                {t('calculatorLink')}
              </Link>
              <Link href="/blog" className="block text-gray-500 hover:text-gray-900 transition-colors">
                {t('blogLink')}
              </Link>
            </nav>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t('contractorsTitle')}
            </p>
            <nav className="space-y-2 text-sm">
              <Link href="/contractors" className="block text-gray-500 hover:text-gray-900 transition-colors">
                {t('contractorsLandingLink')}
              </Link>
              <Link href="/contractors/register" className="block text-gray-500 hover:text-gray-900 transition-colors">
                {t('contractorsRegisterLink')}
              </Link>
              <Link href="/contractors#how" className="block text-gray-500 hover:text-gray-900 transition-colors">
                {t('contractorsHowLink')}
              </Link>
            </nav>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t('legalTitle')}
            </p>
            <nav className="space-y-2 text-sm">
              <Link href="/privacy" className="block text-gray-500 hover:text-gray-900 transition-colors">
                {t('privacyLink')}
              </Link>
              <Link href="/terms" className="block text-gray-500 hover:text-gray-900 transition-colors">
                {t('termsLink')}
              </Link>
              <a
                href={`mailto:${t('contactsEmail')}`}
                className="block text-gray-500 hover:text-gray-900 transition-colors"
              >
                {t('contactsEmail')}
              </a>
            </nav>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 text-xs text-gray-400">
          {t('copyright')}
        </div>
      </div>
    </footer>
  )
}
