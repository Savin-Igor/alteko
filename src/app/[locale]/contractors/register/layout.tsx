import type { Metadata } from 'next'
import { localizedAlternates } from '@/lib/seo'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isRu = locale === 'ru'
  return {
    title: isRu
      ? 'Регистрация подрядчика — ALTEKO'
      : 'Darbuzņēmēja reģistrācija — ALTEKO',
    description: isRu
      ? 'Подключитесь к ALTEKO как подрядчик: фиксированная подписка, без success fee, прозрачный отбор поставщиков.'
      : 'Pievienojieties ALTEKO kā darbuzņēmējs: fiksēta abonēšana, bez success fee, caurskatāma piegādātāju atlase.',
    alternates: localizedAlternates({ path: '/contractors/register', locale }),
  }
}

export default function ContractorsRegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
