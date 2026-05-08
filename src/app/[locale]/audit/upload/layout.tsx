import type { Metadata } from 'next'
import { noIndexMetadata } from '@/lib/seo'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return noIndexMetadata(locale, {
    lv: 'Augšupielādējiet rēķinu — ALTEKO',
    ru: 'Загрузите счёт — ALTEKO',
  })
}

export default function AuditUploadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
