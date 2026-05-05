import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { SiteFooter } from '@/components/ui/SiteFooter'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contractors.landing' })
  return {
    title: `${t('heroTitle')} — ALTEKO`,
    description: t('heroSubtitle'),
  }
}

const STATS = [
  { valueKey: '€50–200', labelKey: 'statsCommissionLabel' },
  { valueKey: '23 500+', labelKey: 'statsDealsLabel' },
  { valueKey: '100%', labelKey: 'statsLeadsLabel' },
] as const

const STEPS = [
  { n: '01', titleKey: 'step1Title', descKey: 'step1Desc' },
  { n: '02', titleKey: 'step2Title', descKey: 'step2Desc' },
  { n: '03', titleKey: 'step3Title', descKey: 'step3Desc' },
] as const

export default async function ContractorsLandingPage({ params }: Props) {
  const { locale } = await params
  void locale
  const t = await getTranslations('contractors.landing')

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="px-4 py-16 bg-primary-light border-b border-blue-100">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 leading-snug">
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>
          <Link href="/contractors/register" className="btn-primary inline-block w-auto px-10 mt-4">
            {t('heroCta')}
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-12 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 text-center">
          {STATS.map((s) => (
            <div key={s.labelKey} className="card py-5">
              <p className="text-2xl font-bold text-primary">{s.valueKey}</p>
              <p className="text-xs text-gray-500 mt-1 leading-snug">{t(s.labelKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-4 py-12 bg-gray-50 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
            {t('howHeading')}
          </h2>
          <div className="space-y-4">
            {STEPS.map((step) => (
              <div key={step.n} className="card flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {step.n}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{t(step.titleKey)}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{t(step.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-900">{t('ctaHeading')}</h2>
          <Link href="/contractors/register" className="btn-primary block">
            {t('ctaButton')}
          </Link>
          <p className="text-xs text-gray-400">{t('ctaNote')}</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
