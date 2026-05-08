import { getTranslations } from 'next-intl/server'
import { CampaignStatus } from '@prisma/client'
import { NewCampaignButton } from './NewCampaignButton'

export interface CampaignRow {
  id: string
  title: string
  decisionType: string
  status: CampaignStatus
  deadline: Date | null
  intentionsYesCount: number
  intentionsNoCount: number
  intentionsAbstainCount: number
}

interface Props {
  buildingId: string
  locale: string
  campaigns: CampaignRow[]
}

const STATUS_ORDER: CampaignStatus[] = [
  CampaignStatus.ACTIVE,
  CampaignStatus.DRAFT,
  CampaignStatus.COMPLETED,
  CampaignStatus.CANCELLED,
]

const STATUS_DOT: Record<CampaignStatus, string> = {
  ACTIVE: 'bg-success',
  DRAFT: 'bg-warning',
  COMPLETED: 'bg-gray-400',
  CANCELLED: 'bg-gray-300',
}

/**
 * Decision-campaign list grouped by status. Shows a "new from
 * template" CTA in the header — picks one of the 7 prebuilt
 * DecisionTemplate entries and creates a DRAFT campaign.
 */
export async function CampaignList({ buildingId, locale, campaigns }: Props) {
  const t = await getTranslations({
    locale,
    namespace: 'dashboard.valdes.campaigns',
  })

  const grouped = new Map<CampaignStatus, CampaignRow[]>()
  for (const c of campaigns) {
    const list = grouped.get(c.status) ?? []
    list.push(c)
    grouped.set(c.status, list)
  }

  const isRu = locale === 'ru'

  return (
    <section
      aria-labelledby="dashboard-campaigns"
      className="bg-white border border-gray-200 rounded-xl overflow-hidden"
    >
      <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <h2
          id="dashboard-campaigns"
          className="text-sm font-semibold text-gray-900"
        >
          {t('heading')}
        </h2>
        <NewCampaignButton buildingId={buildingId} />
      </header>

      {campaigns.length === 0 ? (
        <div className="px-5 py-6 text-sm text-gray-500">{t('empty')}</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {STATUS_ORDER.filter((s) => grouped.has(s)).map((status) => (
            <div key={status} className="px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${STATUS_DOT[status]}`}
                  aria-hidden
                />
                {t(`status.${status}`)}
              </p>
              <ul className="space-y-2">
                {grouped.get(status)!.map((c) => (
                  <li key={c.id} className="text-sm">
                    <p className="text-gray-900 font-medium leading-snug">
                      {c.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('intentionsSummary', {
                        yes: c.intentionsYesCount,
                        no: c.intentionsNoCount,
                        abstain: c.intentionsAbstainCount,
                      })}
                      {c.deadline && (
                        <>
                          {' · '}
                          {t('deadline', {
                            date: c.deadline.toLocaleDateString(
                              isRu ? 'ru-RU' : 'lv-LV',
                            ),
                          })}
                        </>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
