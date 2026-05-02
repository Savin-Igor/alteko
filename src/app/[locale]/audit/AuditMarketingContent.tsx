'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { AddressSearch } from '@/components/AddressSearch'
import { SiteHeader } from '@/components/ui/SiteHeader'

interface FaqItem { q: string; a: string }
interface Category { label: string; desc: string }

export function AuditMarketingContent() {
  const t = useTranslations('audit.marketing')
  const router = useRouter()
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [pending, setPending] = useState<{ id: string; address: string; lat: number; lon: number } | null>(null)

  const faqItems = t.raw('faq.items') as FaqItem[]
  const categories = t.raw('whatIs.categories') as Category[]
  const boardsBullets = t.raw('boards.bullets') as string[]

  async function handleSubmit() {
    if (!pending) return
    setResolving(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        lat: String(pending.lat),
        lon: String(pending.lon),
        address: pending.address,
      })
      const res = await fetch(`/api/address/resolve?${params}`)
      const building = await res.json()

      if (building.found && building.cadastralCode) {
        router.push(`/building/${building.cadastralCode}`)
      } else if (building.cadastralCode) {
        router.push(`/building/${building.cadastralCode}?address=${encodeURIComponent(pending.address)}`)
      } else {
        setError(t('hero.errorNotFound'))
      }
    } catch {
      setError(t('hero.errorConnection'))
    } finally {
      setResolving(false)
    }
  }

  function renderAddressBlock() {
    return (
      <div className="space-y-3 text-left">
        <AddressSearch onSelect={(s) => { setPending(s); setError(null) }} />
        {error && (
          <p className="text-sm text-danger bg-danger-light border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}
        <button
          disabled={resolving || !pending}
          onClick={handleSubmit}
          className="btn-primary"
        >
          {resolving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('hero.ctaLoading')}
            </span>
          ) : t('hero.cta')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* 1. HERO */}
      <section id="hero" className="px-4 pt-14 pb-16 bg-white flex flex-col items-center">
        <div className="w-full max-w-lg text-center">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
            {t('hero.title')}<br />
            <span className="text-primary">{t('hero.titleAccent')}</span>
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {t('hero.description')}
          </p>
          {renderAddressBlock()}
        </div>
      </section>

      {/* 2. WHAT IS AUDIT */}
      <section className="px-4 py-14 bg-gray-50 border-y border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
            {t('whatIs.heading')}
          </h2>
          <p className="text-gray-500 text-center mb-8 leading-relaxed max-w-lg mx-auto">
            {t('whatIs.description')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div key={cat.label} className="card space-y-1.5">
                <p className="font-semibold text-gray-900">{cat.label}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FOR BOARDS */}
      <section className="px-4 py-14 bg-primary-light border-y border-blue-100">
        <div className="max-w-2xl mx-auto md:flex items-center gap-8">
          <div className="flex-1 mb-6 md:mb-0">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              {t('boards.tagline')}
            </p>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t('boards.heading')}
            </h2>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {t('boards.description')}
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              {boardsBullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="status-dot-success mt-1.5 flex-shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="btn-primary w-auto inline-block px-8">
              {t('boards.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FAQ */}
      <section className="px-4 py-14 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            {t('faq.heading')}
          </h2>
          <div className="card divide-y divide-gray-100 p-0 overflow-hidden">
            {faqItems.map((item, i) => (
              <div key={i}>
                <button
                  type="button"
                  className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 min-h-[56px] hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className="text-sm font-medium text-gray-900 leading-snug">{item.q}</span>
                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    className={`flex-shrink-0 mt-0.5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CTA */}
      <section className="px-4 py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('cta.heading')}</h2>
          <p className="text-sm text-gray-500 mb-6">{t('cta.sub')}</p>
          <button
            className="btn-secondary w-auto inline-block px-10"
            onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('hero.cta')}
          </button>
        </div>
      </section>

      <footer className="px-4 py-6 border-t border-gray-100 text-center text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600">ALTEKO</Link>
        {' · '}
        <Link href="/renovation" className="hover:text-gray-600">{t('footer.renovation')}</Link>
        {' · '}
        <Link href="/blog" className="hover:text-gray-600">{t('footer.blog')}</Link>
      </footer>
    </div>
  )
}
