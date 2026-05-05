import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

// ─── Types ────────────────────────────────────────────────────

export interface ScoreData {
  energyScore: number | null
  fundingEligibilityScore: number | null
  documentReadinessScore: number | null
  ownerDecisionReadinessScore: number | null
  financialFeasibilityScore: number | null
  procurementTransparencyScore: number | null
  legalConfidenceStatus: string
  dataConfidenceStatus: string
  nextBestAction: string
  nextBestActionRu: string | null
  computedAt?: Date | string | null
}

interface Props {
  score: ScoreData | null
  /** Inline partial score derived from public data when full score not in DB */
  partialScore?: {
    energyScore: number | null
    fundingEligibilityScore: number | null
  } | null
  cadastralCode: string
  address: string
  isRu: boolean
}

// ─── Score bar ────────────────────────────────────────────────

function ScoreBar({ value }: { value: number | null }) {
  if (value === null) return (
    <div className="h-1.5 rounded-full bg-gray-100 w-full" />
  )
  const pct = Math.min(Math.max(value, 0), 100)
  const color = pct >= 65 ? 'bg-success' : pct >= 35 ? 'bg-warning' : 'bg-danger'
  return (
    <div className="h-1.5 rounded-full bg-gray-100 w-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ─── Confidence badge ─────────────────────────────────────────

const CONFIDENCE_STYLE: Record<string, string> = {
  PROFESSIONAL_VERIFIED: 'bg-green-100 text-green-800',
  BOARD_VERIFIED: 'bg-blue-100 text-blue-800',
  USER_UPLOADED: 'bg-yellow-100 text-yellow-800',
  PUBLIC_DATA: 'bg-gray-100 text-gray-600',
}

// ─── Component ────────────────────────────────────────────────

export function ReadinessScoreCard({ score, partialScore, cadastralCode, address, isRu }: Props) {
  const t = useTranslations('building.readiness')
  const tBuilding = useTranslations('building')

  const isPublicOnly = !score || score.dataConfidenceStatus === 'PUBLIC_DATA'
  const confidenceKey = score?.dataConfidenceStatus ?? 'PUBLIC_DATA'
  const confidenceLabel = t(`confidence.${confidenceKey}`)
  const confidenceStyle = CONFIDENCE_STYLE[confidenceKey] ?? CONFIDENCE_STYLE.PUBLIC_DATA

  const nextAction = score
    ? (isRu && score.nextBestActionRu ? score.nextBestActionRu : score.nextBestAction)
    : null

  // Rows for partial (public-only) view
  const partialRows: Array<{ key: string; value: number | null }> = partialScore
    ? [
        { key: 'energyScore', value: partialScore.energyScore },
        { key: 'fundingEligibilityScore', value: partialScore.fundingEligibilityScore },
      ]
    : []

  // Rows for full score view
  const fullRows: Array<{ key: string; value: number | null }> = score
    ? [
        { key: 'energyScore', value: score.energyScore },
        { key: 'fundingEligibilityScore', value: score.fundingEligibilityScore },
        { key: 'documentReadinessScore', value: score.documentReadinessScore },
        { key: 'ownerDecisionReadinessScore', value: score.ownerDecisionReadinessScore },
        { key: 'financialFeasibilityScore', value: score.financialFeasibilityScore },
        { key: 'procurementTransparencyScore', value: score.procurementTransparencyScore },
      ]
    : []

  const rows = score ? fullRows : partialRows

  const orderHref = `/readiness-report/order?cadastralCode=${cadastralCode}&address=${encodeURIComponent(address)}`

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900">{t('scoreHeading')}</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${confidenceStyle}`}>
          {confidenceLabel}
        </span>
      </div>

      {/* Next best action */}
      {nextAction && (
        <div className="px-5 py-3 bg-primary-light border-b border-primary/10">
          <p className="text-xs font-medium text-primary mb-0.5">{t('nextAction')}</p>
          <p className="text-sm text-gray-800 leading-snug">{nextAction}</p>
        </div>
      )}

      {/* Score rows */}
      {rows.length > 0 && (
        <div className="px-5 py-3 space-y-3">
          {isPublicOnly && (
            <p className="text-xs text-gray-400 italic">{t('partialNote')}</p>
          )}
          {rows.map(({ key, value }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{t(`components.${key}`)}</span>
                <span className="text-xs font-medium text-gray-900 tabular-nums w-8 text-right">
                  {value !== null ? value : '—'}
                </span>
              </div>
              <ScoreBar value={value} />
            </div>
          ))}
        </div>
      )}

      {/* Status fields for full score */}
      {score && (
        <div className="px-5 pb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <span className="text-gray-500">{t('components.legalConfidenceStatus')}</span>
          <span className="text-gray-700 font-medium">{score.legalConfidenceStatus}</span>
          <span className="text-gray-500">{t('components.dataConfidenceStatus')}</span>
          <span className="text-gray-700 font-medium">{confidenceLabel}</span>
          {score.computedAt && (
            <>
              <span className="text-gray-400 col-span-2 mt-1">
                {t('computedAt', { date: new Date(score.computedAt).toLocaleDateString(isRu ? 'ru-RU' : 'lv-LV') })}
              </span>
            </>
          )}
        </div>
      )}

      {/* CTA — always show for public data, or if no score at all */}
      {isPublicOnly && (
        <div className="px-5 pb-4 pt-1">
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            {t('publicDataNote')}
          </p>
          <Link
            href={orderHref}
            className="btn-primary block text-center text-sm"
          >
            {tBuilding('readinessReportCta')}
          </Link>
        </div>
      )}
    </div>
  )
}
