'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { InfoBanner } from '@/components/ui/InfoBanner'

// ─── Types ────────────────────────────────────────────────────

interface OrderData {
  id: string
  paymentStatus: string
  amountEur: string
  language: string
  reportFileKey: string | null
  emailSentAt: string | null
  orderedByEmail: string
  createdAt: string
  downloadUrl: string | null
  building: {
    address: string
    cadastralCode: string
    energyClass: string | null
    constructionYear: number | null
    series: string | null
  }
}

// ─── Helpers ──────────────────────────────────────────────────

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  if (local.length <= 2) return `${local[0]}***@${domain}`
  return `${local[0]}${local[1]}***@${domain}`
}

function shortRef(id: string): string {
  return id.slice(-8).toUpperCase()
}

// ─── Sub-components ───────────────────────────────────────────

function CancelledState({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="text-center space-y-4 max-w-sm mx-auto py-12">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
        <span className="text-2xl text-gray-400">✕</span>
      </div>
      <h1 className="text-xl font-bold text-gray-900">{t('status.cancelled.title')}</h1>
      <p className="text-gray-500 text-sm leading-relaxed">{t('status.cancelled.description')}</p>
      <Link href="/" className="btn-primary block mt-4">{t('status.cancelled.backHome')}</Link>
    </div>
  )
}

function PendingState({ order, t }: { order: OrderData; t: ReturnType<typeof useTranslations> }) {
  const [, setRefreshCount] = useState(0)
  const [stopped, setStopped] = useState(false)
  const ref = shortRef(order.id)

  // Poll every 10s for up to 3 minutes
  useEffect(() => {
    if (stopped) return
    const interval = setInterval(() => {
      setRefreshCount((c) => {
        if (c >= 17) { setStopped(true); return c }
        window.location.reload()
        return c + 1
      })
    }, 10_000)
    return () => clearInterval(interval)
  }, [stopped])

  return (
    <div className="space-y-5 max-w-md mx-auto py-8">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⏳</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{t('status.pending.title')}</h1>
      </div>

      <div className="card space-y-3 bg-blue-50 border-blue-200">
        <p className="text-sm font-medium text-gray-900">{t('status.pending.orderRef', { id: ref })}</p>
        <p className="text-sm text-gray-700 leading-relaxed">
          {t('status.pending.description', { amount: order.amountEur, ref })}
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          {t('status.pending.bankInstructions')}
        </p>
      </div>

      {stopped && (
        <InfoBanner variant="warning">
          {t('status.pending.waitMessage' in t.raw('status.pending') ? 'status.pending.waitMessage' : 'status.pending.contact')}
        </InfoBanner>
      )}

      <button
        className="btn-secondary w-full"
        onClick={() => window.location.reload()}
      >
        {t('status.pending.refresh')}
      </button>

      <p className="text-center text-xs text-gray-400">
        <a href="mailto:info@alteko.lv" className="text-primary hover:underline">
          {t('status.pending.contact')}
        </a>
      </p>
    </div>
  )
}

function ProcessingState({ order, t }: { order: OrderData; t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="space-y-5 max-w-md mx-auto py-8">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{t('status.processing.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('status.processing.description')}</p>
      </div>

      <div className="card space-y-2">
        <p className="text-xs text-gray-500">{t('status.processing.emailLabel')}</p>
        <p className="text-sm font-medium text-gray-900">{maskEmail(order.orderedByEmail)}</p>
      </div>

      <div className="card bg-gray-50 space-y-1">
        <p className="text-sm font-medium text-gray-800">{order.building.address}</p>
        {order.building.energyClass && (
          <p className="text-xs text-gray-500">
            {order.building.series ?? ''} · {order.building.constructionYear ?? ''} · {order.building.energyClass}
          </p>
        )}
      </div>

      <button
        className="btn-secondary w-full"
        onClick={() => window.location.reload()}
      >
        {t('status.pending.refresh')}
      </button>
    </div>
  )
}

function ReadyState({ order, t, locale }: { order: OrderData; t: ReturnType<typeof useTranslations>; locale: string }) {
  const buildingUrl = `${locale === 'ru' ? '/ru' : ''}/building/${order.building.cadastralCode}`

  return (
    <div className="space-y-6 max-w-md mx-auto py-8">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📄</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{t('status.ready.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{order.building.address}</p>
      </div>

      {/* Primary CTA — download */}
      <a
        href={`/api/readiness-report/${order.id}/download`}
        className="btn-primary block text-center w-full"
        target="_blank"
        rel="noopener noreferrer"
      >
        ↓ {t('status.ready.download')}
      </a>

      {/* Next step explanation */}
      <div className="card space-y-2">
        <p className="text-sm font-semibold text-gray-900">{t('status.ready.nextStepHeading')}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{t('status.ready.nextStepText')}</p>
        <Link href={buildingUrl as '/'} className="text-sm text-primary hover:underline">
          {order.building.address} →
        </Link>
      </div>

      {/* Upsell — Valdes darba telpa */}
      <div className="card border-primary/20 bg-blue-50 space-y-2">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider">
          {t('status.ready.upgradeHeading')}
        </p>
        <p className="text-sm font-bold text-gray-900">{t('status.ready.upgradeTitle')}</p>
        <p className="text-sm text-gray-600">{t('status.ready.upgradeDescription')}</p>
        <p className="text-xs text-gray-500">{t('status.ready.upgradePrice')}</p>
        <Link href="/dashboard" className="btn-secondary block text-center text-sm">
          {t('status.ready.upgradeLink')}
        </Link>
      </div>

      {/* Share */}
      <p className="text-center text-xs text-gray-400">
        <a
          href={`mailto:?subject=${encodeURIComponent(order.building.address)}&body=${encodeURIComponent(`/readiness-report/order/${order.id}`)}`}
          className="text-primary hover:underline"
        >
          {t('status.ready.shareLabel')}
        </a>
      </p>
    </div>
  )
}

function NotFoundState({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="text-center space-y-4 max-w-sm mx-auto py-12">
      <h1 className="text-xl font-bold text-gray-900">{t('status.notFound.title')}</h1>
      <p className="text-gray-500 text-sm">{t('status.notFound.description')}</p>
      <a href="mailto:info@alteko.lv" className="btn-secondary block">
        {t('status.notFound.contact')}
      </a>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────

export default function OrderStatusPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const orderId = params.orderId as string
  const locale = params.locale as string
  const statusParam = searchParams.get('status')
  const t = useTranslations('readinessReport')

  const [order, setOrder] = useState<OrderData | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/readiness-report/${orderId}`)
      if (res.status === 404) { setNotFound(true); setLoading(false); return }
      if (!res.ok) { setLoading(false); return }
      const data = await res.json()
      setOrder(data)
    } catch {
      // keep loading state, show error on next render
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-4">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && (notFound || !order) && <NotFoundState t={t} />}

        {!loading && order && statusParam === 'cancelled' && <CancelledState t={t} />}

        {!loading && order && statusParam !== 'cancelled' && order.paymentStatus === 'pending' && (
          <PendingState order={order} t={t} />
        )}

        {!loading && order && statusParam !== 'cancelled' && order.paymentStatus === 'succeeded' && !order.reportFileKey && (
          <ProcessingState order={order} t={t} />
        )}

        {!loading && order && statusParam !== 'cancelled' && order.paymentStatus === 'succeeded' && order.reportFileKey && (
          <ReadyState order={order} t={t} locale={locale} />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
