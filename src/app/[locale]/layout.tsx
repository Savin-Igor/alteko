import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ALTEKO — Аудит расходов вашего дома',
  description: 'Узнайте, переплачивает ли ваш дом за коммунальные услуги. Бесплатно, за 30 секунд.',
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
      <body className="min-h-screen bg-white">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
