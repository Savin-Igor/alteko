import type { Metadata } from 'next'
import { noIndexMetadata } from '@/lib/seo'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return noIndexMetadata(locale, {
    lv: 'Renovācijas priekšskatījums — ALTEKO',
    ru: 'Предпросмотр реновации — ALTEKO',
  })
}

export default function RenovationPreviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
