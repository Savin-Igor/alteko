import type { Metadata } from 'next'
import { noIndexMetadata } from '@/lib/seo'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return noIndexMetadata(locale, {
    lv: 'Īpašnieku balsošana — ALTEKO',
    ru: 'Голосование собственников — ALTEKO',
  })
}

export default function VotingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
