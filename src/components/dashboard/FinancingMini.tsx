import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Badge } from '@/components/ui'

export interface FinancingMiniRow {
  scenarioType: string
  windowStatus: 'OPEN' | 'EXPECTED' | 'CLOSED' | 'UNKNOWN'
  estimatedSubsidyPercent: number | null
  monthlyPaymentPerApartment: number | null
}

interface Props {
  locale: string
  scenarios: FinancingMiniRow[]
}

const WINDOW_BADGE: Record<
  FinancingMiniRow['windowStatus'],
  'active' | 'pending' | 'cancelled' | 'done'
> = {
  OPEN: 'active',
  EXPECTED: 'pending',
  CLOSED: 'cancelled',
  UNKNOWN: 'pending',
}

/**
 * 5-row scenario table for the dashboard. Status badge + per-apartment
 * monthly payment estimate; full breakdown lives at /financing.
 */
export async function FinancingMini({ locale, scenarios }: Props) {
  const t = await getTranslations({
    locale,
    namespace: 'dashboard.valdes.financing',
  })
  const tWindow = await getTranslations({
    locale,
    namespace: 'financing.windowStatus',
  })
  const tScenario = await getTranslations({
    locale,
    namespace: 'financing.scenarioType',
  })

  return (
    <section
      aria-labelledby="dashboard-financing"
      className="bg-white border border-gray-200 rounded-xl overflow-hidden"
    >
      <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2
          id="dashboard-financing"
          className="text-sm font-semibold text-gray-900"
        >
          {t('heading')}
        </h2>
        <Link
          href="/financing"
          className="text-xs text-primary hover:underline font-medium"
        >
          {t('viewAll')}
        </Link>
      </header>

      {scenarios.length === 0 ? (
        <div className="px-5 py-6 text-sm text-gray-500">{t('empty')}</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {scenarios.map((s) => (
            <li
              key={s.scenarioType}
              className="px-5 py-3 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {tScenario(s.scenarioType)}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {s.estimatedSubsidyPercent !== null
                    ? t('subsidyShort', {
                        percent: Math.round(s.estimatedSubsidyPercent),
                      })
                    : '—'}
                  {s.monthlyPaymentPerApartment !== null
                    ? ` · ${t('monthlyShort', {
                        amount: Math.round(s.monthlyPaymentPerApartment),
                      })}`
                    : ''}
                </p>
              </div>
              <Badge
                status={WINDOW_BADGE[s.windowStatus]}
                label={tWindow(s.windowStatus)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
