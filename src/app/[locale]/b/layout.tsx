import type { Metadata } from 'next'
import { noIndexMetadata } from '@/lib/seo'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return noIndexMetadata(locale, {
    lv: 'Atskaite — ALTEKO',
    ru: 'Отчёт — ALTEKO',
  })
}

export default function PublicReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
