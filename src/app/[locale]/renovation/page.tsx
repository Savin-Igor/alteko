import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { SiteHeader } from '@/components/ui/SiteHeader'

interface MetadataParams {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: MetadataParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'renovation.metadata' })
  return {
    title: t('title'),
    description: t('description'),
  }
}

interface Stat { value: string; label: string }
interface ProcessStep { n: string; title: string; desc: string; cta?: string }

export default async function RenovationMarketingPage() {
  const t = await getTranslations('renovation')
  const stats = t.raw('stats') as Stat[]
  const steps = t.raw('process.steps') as ProcessStep[]

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 leading-snug">
            {t('hero.titleStart')}<br />
            <span className="text-primary">{t('hero.titleEnd')}</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">
            {t('hero.description')}
          </p>
          <Link href="/" className="btn-primary inline-block w-auto px-8 mt-4">
            {t('hero.cta')}
          </Link>
          <p className="text-xs text-gray-400">
            {t('hero.note')}
          </p>
        </div>
      </section>

      {/* Numbers */}
      <section className="px-4 py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="card py-4">
              <p className="text-xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1 leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          {t('sourcesNote')}
        </p>
      </section>

      {/* Process steps */}
      <section className="px-4 py-12 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
            {t('process.heading')}
          </h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={step.n} className="card flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {step.n}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                  {i === 0 && step.cta && (
                    <Link href="/" className="mt-2 inline-block text-sm text-primary font-medium hover:underline">
                      {step.cta} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Altum explanation */}
      <section className="px-4 py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-xl font-bold text-gray-900">{t('altum.heading')}</h2>
          <p className="text-gray-600 leading-relaxed">
            {t('altum.p1')}
          </p>
          <p className="text-gray-600 leading-relaxed">
            {t('altum.p2')}
          </p>
          <Link
            href="/blog/subsidiya-altum-renovaciya-2025"
            className="text-sm text-primary font-medium hover:underline"
          >
            {t('altum.guideLink')}
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 bg-white border-t border-gray-100">
        <div className="max-w-md mx-auto text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            {t('cta.heading')}
          </h2>
          <p className="text-gray-500">
            {t('cta.description')}
          </p>
          <Link href="/" className="btn-primary block">
            {t('cta.button')}
          </Link>
          <p className="text-xs text-gray-400">{t('cta.note')}</p>
        </div>
      </section>

      <footer className="px-4 py-6 border-t border-gray-100 text-center text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600">ALTEKO</Link>
        {' · '}
        <Link href="/blog" className="hover:text-gray-600">{t('footer.blog')}</Link>
        {' · '}
        <Link href="/contractors/register" className="hover:text-gray-600">{t('footer.contractors')}</Link>
      </footer>
    </div>
  )
}
