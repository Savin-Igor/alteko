import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export interface ReadinessOverviewData {
  energyScore: number | null
  fundingEligibilityScore: number | null
  documentReadinessScore: number | null
  ownerDecisionReadinessScore: number | null
  financialFeasibilityScore: number | null
  procurementTransparencyScore: number | null
  legalConfidenceStatus: string
  dataConfidenceStatus: string
  computedAt: Date | null
}

interface Props {
  cadastralCode: string
  locale: string
  data: ReadinessOverviewData | null
}

const SCORE_KEYS = [
  'energyScore',
  'fundingEligibilityScore',
  'documentReadinessScore',
  'ownerDecisionReadinessScore',
  'financialFeasibilityScore',
  'procurementTransparencyScore',
] as const

const CONFIDENCE_STYLE: Record<string, string> = {
  PROFESSIONAL_VERIFIED: 'bg-green-100 text-green-800',
  BOARD_VERIFIED: 'bg-blue-100 text-blue-800',
  USER_UPLOADED: 'bg-yellow-100 text-yellow-800',
  PUBLIC_DATA: 'bg-gray-100 text-gray-600',
}

function ScoreBar({ value }: { value: number | null }) {
  if (value === null)
    return <div className="h-1.5 rounded-full bg-gray-100 w-full" />
  const pct = Math.min(Math.max(value, 0), 100)
  const color =
    pct >= 65 ? 'bg-success' : pct >= 35 ? 'bg-warning' : 'bg-danger'
  return (
    <div className="h-1.5 rounded-full bg-gray-100 w-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/**
 * Compact readiness score grid for the Valdes dashboard. Reuses the
 * same six numeric components as the building page but skips the
 * `nextBestAction` row (it lives in the dedicated top-of-page banner).
 */
export async function ReadinessOverview({ cadastralCode, locale, data }: Props) {
  const t = await getTranslations({ locale, namespace: 'building.readiness' })
  const tValdes = await getTranslations({
    locale,
    namespace: 'dashboard.valdes.readiness',
  })
  const isRu = locale === 'ru'

  const confidenceKey = data?.dataConfidenceStatus ?? 'PUBLIC_DATA'
  const confidenceLabel = t(`confidence.${confidenceKey}`)
  const confidenceStyle =
    CONFIDENCE_STYLE[confidenceKey] ?? CONFIDENCE_STYLE.PUBLIC_DATA

  return (
    <section
      aria-labelledby="dashboard-readiness"
      className="bg-white border border-gray-200 rounded-xl overflow-hidden"
    >
      <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <h2
          id="dashboard-readiness"
          className="text-sm font-semibold text-gray-900"
        >
          {tValdes('heading')}
        </h2>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${confidenceStyle}`}
        >
          {confidenceLabel}
        </span>
      </header>

      {data ? (
        <>
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {SCORE_KEYS.map((key) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    {t(`components.${key}`)}
                  </span>
                  <span className="text-xs font-medium text-gray-900 tabular-nums w-8 text-right">
                    {data[key] !== null ? data[key] : '—'}
                  </span>
                </div>
                <ScoreBar value={data[key]} />
              </div>
            ))}
          </div>

          <footer className="px-5 pb-4 flex items-center justify-between text-xs text-gray-500">
            {data.computedAt ? (
              <span>
                {t('computedAt', {
                  date: data.computedAt.toLocaleDateString(
                    isRu ? 'ru-RU' : 'lv-LV',
                  ),
                })}
              </span>
            ) : (
              <span>—</span>
            )}
            <Link
              href={`/building/${cadastralCode}`}
              className="text-primary hover:underline font-medium"
            >
              {tValdes('viewFullCard')}
            </Link>
          </footer>
        </>
      ) : (
        <div className="px-5 py-6 text-sm text-gray-500">
          {tValdes('empty')}
        </div>
      )}
    </section>
  )
}
