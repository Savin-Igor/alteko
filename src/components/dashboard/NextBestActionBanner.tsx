import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

interface Props {
  cadastralCode: string
  locale: string
  nextBestAction: string | null
  nextBestActionRu: string | null
}

/**
 * Top-of-page CTA banner that surfaces the readiness rules engine's
 * "next best action" recommendation in the active locale, with a deep
 * link into the building's full card.
 *
 * Falls back to a generic prompt when no readiness score exists yet.
 */
export async function NextBestActionBanner({
  cadastralCode,
  locale,
  nextBestAction,
  nextBestActionRu,
}: Props) {
  const t = await getTranslations({ locale, namespace: 'dashboard.valdes.nextBestAction' })
  const isRu = locale === 'ru'

  const action =
    isRu && nextBestActionRu
      ? nextBestActionRu
      : nextBestAction ?? t('fallback')

  return (
    <section
      aria-labelledby="dashboard-next-best-action"
      className="bg-primary text-white rounded-xl p-5 shadow-sm"
    >
      <p
        id="dashboard-next-best-action"
        className="text-xs uppercase tracking-wide opacity-80 mb-1"
      >
        {t('label')}
      </p>
      <p className="text-base font-medium leading-snug mb-4">{action}</p>
      <Link
        href={`/building/${cadastralCode}`}
        className="inline-flex items-center justify-center text-sm font-semibold bg-white text-primary px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
      >
        {t('cta')}
      </Link>
    </section>
  )
}
