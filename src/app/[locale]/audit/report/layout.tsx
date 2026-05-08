import type { Metadata } from 'next'
import { noIndexMetadata } from '@/lib/seo'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return noIndexMetadata(locale, {
    lv: 'Audita atskaite — ALTEKO',
    ru: 'Отчёт об аудите — ALTEKO',
  })
}

export default function AuditReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
