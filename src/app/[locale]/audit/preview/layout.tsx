import type { Metadata } from 'next'
import { noIndexMetadata } from '@/lib/seo'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return noIndexMetadata(locale, {
    lv: 'Analizējam jūsu rēķinu — ALTEKO',
    ru: 'Анализируем ваш счёт — ALTEKO',
  })
}

export default function AuditPreviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
