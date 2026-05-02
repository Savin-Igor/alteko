'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { AddressSearch } from '@/components/AddressSearch'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { SiteHeader } from '@/components/ui/SiteHeader'

const DOT: Record<string, string> = {
  danger: 'status-dot-danger',
  warning: 'status-dot-warning',
  success: 'status-dot-success',
}
const TEXT_COLOR: Record<string, string> = {
  danger: 'text-danger',
  warning: 'text-warning',
  success: 'text-success',
}

interface SampleRow {
  label: string
  value: string
  norm: string
  dev: string
  variant: 'danger' | 'warning' | 'success'
}

interface ProblemStat { value: string; label: string }
interface Step { n: string; title: string; desc: string }
interface RenovationStat { value: string; label: string }
interface Source { name: string; desc: string }
interface FaqItem { q: string; a: string }
interface BlogPost { href: string; title: string; tag: string; mins: number }

const SOURCE_HREFS = [
  'https://www.vzd.gov.lv',
  'https://data.gov.lv',
  'https://www.sprk.gov.lv',
  'https://www.altum.lv',
]

const RENOVATION_COLORS = ['text-primary', 'text-success', 'text-success', 'text-gray-700']
const PROBLEM_COLORS = ['text-danger', 'text-warning', 'text-warning', 'text-danger']

export default function HomePage() {
  const t = useTranslations('home')
  const router = useRouter()
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [pendingSuggestion, setPendingSuggestion] = useState<{
    id: string; address: string; lat: number; lon: number
  } | null>(null)

  const sampleRows = t.raw('sample.rows') as SampleRow[]
  const problemStats = t.raw('problem.stats') as ProblemStat[]
  const steps = t.raw('steps.items') as Step[]
  const renovationStats = t.raw('renovation.stats') as RenovationStat[]
  const boardsBullets = t.raw('boards.bullets') as string[]
  const sources = t.raw('trust.sources') as Source[]
  const faqItems = t.raw('faq.items') as FaqItem[]
  const blogPosts = t.raw('blogPreview.posts') as BlogPost[]

  async function handleAddressSelect(suggestion: {
    id: string; address: string; lat: number; lon: number
  }) {
    setResolving(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        lat: String(suggestion.lat),
        lon: String(suggestion.lon),
        address: suggestion.address,
      })
      const res = await fetch(`/api/address/resolve?${params}`)
      const building = await res.json()

      if (building.found && building.cadastralCode) {
        router.push(`/building/${building.cadastralCode}`)
      } else if (building.cadastralCode) {
        router.push(`/building/${building.cadastralCode}?address=${encodeURIComponent(suggestion.address)}`)
      } else {
        setError(t('hero.errorNotFound'))
      }
    } catch {
      setError(t('hero.errorConnection'))
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="px-4 pt-14 pb-16 bg-white flex flex-col items-center"
      >
        <div className="w-full max-w-xl text-center">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
            {t('hero.titleQuestion')}<br />
            <span className="text-primary">{t('hero.titleAnswer')}</span>
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {t('hero.description')}
          </p>

          <div className="space-y-3 text-left">
            <AddressSearch onSelect={(s) => { setPendingSuggestion(s); setError(null) }} />

            {error && (
              <p className="text-sm text-danger bg-danger-light border border-red-200 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              disabled={resolving || !pendingSuggestion}
              onClick={() => pendingSuggestion && handleAddressSelect(pendingSuggestion)}
              className="btn-primary"
            >
              {resolving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('hero.ctaLoading')}
                </span>
              ) : (
                t('hero.cta')
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-5 text-xs text-gray-400">
            <span>{t('hero.journey.step1')}</span>
            <span>→</span>
            <span>{t('hero.journey.step2')}</span>
            <span>→</span>
            <span>{t('hero.journey.step3')}</span>
          </div>

          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
            <span>{t('hero.stats.free')}</span>
            <span>·</span>
            <span>{t('hero.stats.buildings')}</span>
          </div>

        </div>
      </section>

      {/* ── 2. HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
            {t('steps.heading')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step) => (
              <div key={step.n} className="card space-y-3">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {step.n}
                </div>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button
              className="btn-secondary w-auto px-10 inline-flex items-center justify-center"
              onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('steps.cta')}
            </button>
            <p className="text-xs text-gray-400 mt-2">{t('steps.ctaNote')}</p>
          </div>
        </div>
      </section>

      {/* ── 3. PROBLEM ───────────────────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {t('problem.heading')}
          </h2>
          <p className="text-gray-500 text-center mb-8 leading-relaxed">
            {t('problem.description')}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {problemStats.map((stat, i) => (
              <div key={i} className="card text-center py-4 space-y-1">
                <p className={`text-2xl font-bold ${PROBLEM_COLORS[i]}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 4. SAMPLE RESULT ─────────────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-gray-50 border-y border-gray-100">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">
            {t('sample.heading')}
          </h2>
          <p className="text-xs text-gray-400 text-center mb-6">
            {t('sample.subtitle')}
          </p>

          <div className="card p-0 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {sampleRows.map((row) => (
                <div key={row.label} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={DOT[row.variant]} aria-hidden="true" />
                    <span className="text-sm text-gray-800">{row.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{row.value}</span>
                    <span className="text-xs text-gray-400 ml-1.5">{t('sample.normLabel')} {row.norm}</span>
                    <span className={`text-xs font-semibold ml-2 ${TEXT_COLOR[row.variant]}`}>
                      {row.dev}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 bg-danger-light border-t border-red-100 flex items-center justify-between">
              <span className="text-sm font-medium text-danger">{t('sample.yearOverpay')}</span>
              <span className="text-metric font-bold text-danger">{t('sample.yearOverpayValue')}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">
            {t('sample.perApartment')}
          </p>
        </div>
      </section>

      {/* ── 5. RENOVATION ────────────────────────────────────────────────────── */}
      <section id="renovation" className="px-4 py-14 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t('renovation.heading')}
            </h2>
            <p className="text-gray-500 leading-relaxed">
              {t('renovation.description')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {renovationStats.map((s, i) => (
              <div key={i} className="card text-center py-4">
                <p className={`text-xl font-bold ${RENOVATION_COLORS[i]}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              {t('renovation.note')}
            </p>
            <Link href="/renovation" className="btn-secondary w-auto inline-block px-8">
              {t('renovation.cta')}
            </Link>
          </div>

        </div>
      </section>

      {/* ── 6. FOR BOARDS ────────────────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-primary-light border-y border-blue-100">
        <div className="max-w-3xl mx-auto md:flex items-center gap-8">
          <div className="flex-1 mb-6 md:mb-0">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              {t('boards.tagline')}
            </p>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {t('boards.heading')}
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {boardsBullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="status-dot-success mt-1.5" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="btn-secondary w-auto inline-block px-8">
              {t('boards.cta')}
            </Link>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {t('boards.ctaNote')}
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. TRUST ─────────────────────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">{t('trust.heading')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {sources.map((src, i) => (
              <div key={src.name} className="card flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <a
                    href={SOURCE_HREFS[i]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors"
                  >
                    {src.name}
                  </a>
                  <p className="text-sm text-gray-500 mt-0.5">{src.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 card bg-gray-50">
            <p className="text-sm text-gray-600">
              <strong>{t('trust.privacyLabel')}</strong> {t('trust.privacy')}
            </p>
          </div>
        </div>
      </section>

      {/* ── 8. FAQ ───────────────────────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
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
                  <span className="text-sm font-medium text-gray-900 leading-snug">
                    {item.q}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`flex-shrink-0 mt-0.5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. BLOG PREVIEW ──────────────────────────────────────────────────── */}
      <section className="px-4 py-14 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{t('blogPreview.heading')}</h2>
            <Link href="/blog" className="text-sm text-primary font-medium hover:underline">
              {t('blogPreview.all')}
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {blogPosts.map((post) => (
              <Link
                key={post.href}
                href={post.href}
                className="card hover:border-gray-300 transition-colors group space-y-2"
              >
                <span className="text-xs px-2.5 py-1 bg-primary-light text-primary rounded-full font-medium inline-block">
                  {post.tag}
                </span>
                <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors leading-snug">
                  {post.title}
                </p>
                <p className="text-xs text-gray-400">{post.mins} {t('blogPreview.min')}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
