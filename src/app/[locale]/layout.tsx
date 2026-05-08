import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { localizedAlternates } from '@/lib/seo'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://alteko.lv'

interface MetadataParams {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: MetadataParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  const title = t('title')
  const description = t('description')
  const ogLocale = locale === 'lv' ? 'lv_LV' : 'ru_LV'
  const altLocale = locale === 'lv' ? 'ru_LV' : 'lv_LV'

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: 'ALTEKO',
    alternates: localizedAlternates({ path: '/', locale }),
    openGraph: {
      title,
      description,
      siteName: 'ALTEKO',
      type: 'website',
      locale: ogLocale,
      alternateLocale: altLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'lv' | 'ru')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      {/* suppressHydrationWarning silences the mismatch caused by browser
          extensions (Grammarly adds data-new-gr-c-s-check-loaded /
          data-gr-ext-installed to <body> before React hydrates). It only
          suppresses one level — child components still flag real mismatches. */}
      <body className="min-h-screen bg-white" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
