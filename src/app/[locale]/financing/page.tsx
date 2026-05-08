import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { InfoBanner } from '@/components/ui/InfoBanner'
import { Badge } from '@/components/ui'
import { localizedAlternates } from '@/lib/seo'

interface MetadataParams {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: MetadataParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'financing.metadata' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates({ path: '/financing', locale }),
  }
}

interface ScenarioCard {
  key: string
  windowBadge: 'active' | 'pending' | 'cancelled'
  windowLabel: string
  amountNote: string
  conditionItems: string[]
  reasonNote: string
}

export default async function FinancingPage() {
  const t = await getTranslations('financing')
  const rawScenarios = t.raw('scenarios') as Record<string, unknown>
  const scenarios = Object.keys(rawScenarios)
    .filter((k) => !isNaN(Number(k)))
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => rawScenarios[k] as ScenarioCard)

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="px-4 py-12 bg-white">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('hero.title')}
          </h1>
          <p className="text-gray-500 leading-relaxed max-w-lg mx-auto">
            {t('hero.description')}
          </p>
        </div>
      </section>

      {/* SCF closure notice */}
      <section className="px-4 pb-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <InfoBanner variant="warning">
            <strong>{t('altumClosureNotice.title')}</strong>
            <p className="mt-1 text-orange-800/90 leading-relaxed">
              {t('altumClosureNotice.body')}
            </p>
          </InfoBanner>
        </div>
      </section>

      {/* Scenarios */}
      <section className="px-4 py-8 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('scenarios.heading')}</h2>

          {scenarios.map((s) => (
            <div key={s.key} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-gray-900 leading-snug">{s.key}</h3>
                <Badge
                  status={s.windowBadge}
                  label={s.windowLabel}
                />
              </div>

              <p className="text-sm font-medium text-gray-700">{s.amountNote}</p>

              <ul className="space-y-1">
                {s.conditionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="status-dot-warning mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="text-xs text-gray-400 italic">{s.reasonNote}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Readiness CTA */}
      <section className="px-4 py-12 bg-white border-t border-gray-100">
        <div className="max-w-md mx-auto text-center space-y-4">
          <h2 className="text-lg font-bold text-gray-900">{t('cta.heading')}</h2>
          <p className="text-gray-500 leading-relaxed">{t('cta.description')}</p>
          <Link href="/" className="btn-primary block">
            {t('cta.button')}
          </Link>
          <p className="text-xs text-gray-400">{t('cta.note')}</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
