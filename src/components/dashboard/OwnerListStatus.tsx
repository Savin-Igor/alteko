import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

interface Props {
  buildingId: string
  locale: string
  ownerListUpdatedAt: Date | null
  ownerListCount: number | null
}

const STALE_AFTER_DAYS = 180

/**
 * Owner list freshness indicator. Surfaces a warning when the list is
 * older than 6 months (180 days) or has never been uploaded — that's
 * the threshold at which Altum / BIS reject voting protocols as
 * non-current.
 */
export async function OwnerListStatus({
  buildingId,
  locale,
  ownerListUpdatedAt,
  ownerListCount,
}: Props) {
  const t = await getTranslations({
    locale,
    namespace: 'dashboard.valdes.ownerList',
  })
  const isRu = locale === 'ru'

  const now = Date.now()
  const ageDays = ownerListUpdatedAt
    ? Math.floor((now - ownerListUpdatedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null
  const isStale = ageDays === null || ageDays > STALE_AFTER_DAYS

  return (
    <section
      aria-labelledby="dashboard-owner-list"
      className="bg-white border border-gray-200 rounded-xl p-5"
    >
      <h2
        id="dashboard-owner-list"
        className="text-sm font-semibold text-gray-900 mb-3"
      >
        {t('heading')}
      </h2>

      {ownerListUpdatedAt ? (
        <div className="text-sm text-gray-700 space-y-1 mb-3">
          <p>
            {t('updatedAt', {
              date: ownerListUpdatedAt.toLocaleDateString(
                isRu ? 'ru-RU' : 'lv-LV',
              ),
            })}
          </p>
          {ownerListCount !== null && (
            <p className="text-xs text-gray-500">
              {t('ownerCount', { count: ownerListCount })}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-700 mb-3">{t('neverUploaded')}</p>
      )}

      {isStale && (
        <div className="bg-warning-light border border-warning/20 text-gray-800 text-xs leading-relaxed rounded-lg px-3 py-2 mb-3">
          {ageDays === null
            ? t('staleNeverUploaded')
            : t('staleWarning', { days: ageDays })}
        </div>
      )}

      <Link
        href={`/dashboard/voting?buildingId=${buildingId}`}
        className="inline-flex items-center justify-center text-sm font-semibold border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
      >
        {t('uploadCta')}
      </Link>
    </section>
  )
}
