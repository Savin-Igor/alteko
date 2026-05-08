import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { localizedAlternates } from '@/lib/seo'
import { AuditMarketingContent } from './AuditMarketingContent'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'audit.marketing.metadata' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates({ path: '/audit', locale }),
  }
}

export default function AuditPage() {
  return <AuditMarketingContent />
}
