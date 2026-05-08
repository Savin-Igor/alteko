import type { Metadata } from 'next'
import { noIndexMetadata } from '@/lib/seo'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return noIndexMetadata(locale, {
    lv: 'Vadības panelis — ALTEKO',
    ru: 'Панель управления — ALTEKO',
  })
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
