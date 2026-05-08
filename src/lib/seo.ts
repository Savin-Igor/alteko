import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://alteko.lv'

interface LocalizedAlternatesInput {
  /** Locale-agnostic path starting with '/'. Use '/' for home. */
  path: string
  /** Resolved request locale ('lv' | 'ru'). */
  locale: string
}

/**
 * Build canonical + hreflang alternates for a localized page.
 *
 * Routing: defaultLocale=lv has no prefix, ru is served under /ru.
 * Canonical points at the current-locale URL; hreflang covers both
 * locales plus x-default (LV).
 */
export function localizedAlternates({
  path,
  locale,
}: LocalizedAlternatesInput): NonNullable<Metadata['alternates']> {
  const normalized = path === '/' ? '' : path
  const lvUrl = `${SITE_URL}${normalized || '/'}`
  const ruUrl = `${SITE_URL}/ru${normalized}`
  const canonical = locale === 'ru' ? ruUrl : lvUrl

  return {
    canonical,
    languages: {
      lv: lvUrl,
      ru: ruUrl,
      'x-default': lvUrl,
    },
  }
}

/**
 * Robots metadata for pages that should not be indexed (process flows,
 * token-gated views, dashboards). Crawlers may still follow links so
 * shared chrome (header/footer) keeps its link equity.
 */
export const noIndexRobots: NonNullable<Metadata['robots']> = {
  index: false,
  follow: true,
}

/**
 * Build noindex metadata for a private subtree. Localized title is
 * passed in (LV / RU pair). Used in nested layouts that wrap process
 * flows, dashboards, and token-gated views.
 */
export function noIndexMetadata(
  locale: string,
  titles: { lv: string; ru: string },
): Metadata {
  return {
    title: locale === 'ru' ? titles.ru : titles.lv,
    robots: noIndexRobots,
  }
}
