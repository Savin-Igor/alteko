import type { Metadata } from 'next'
import { noIndexMetadata } from '@/lib/seo'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return noIndexMetadata(locale, {
    lv: 'Pieslēgties — ALTEKO',
    ru: 'Вход — ALTEKO',
  })
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
