const SERIES_IMAGES: Record<string, string> = {
  '103': '/buildings/series-103.png',
  '104': '/buildings/series-104.png',
  '119': '/buildings/series-119.png',
  '467': '/buildings/series-467.png',
  '602': '/buildings/series-602.png',
}

const FALLBACK = '/buildings/series-unknown.png'

/** Returns the image path for a building series, or the fallback image. */
export function getSeriesImage(series: string | null | undefined): string {
  if (!series) return FALLBACK
  return SERIES_IMAGES[series.trim()] ?? FALLBACK
}

/** Extracts a series number from a blog slug (e.g. "seriya-119-latviya" → "119"). */
export function seriesFromSlug(slug: string): string | null {
  const match = slug.match(/\b(103|104|119|316|318|467|602)\b/)
  return match ? match[1] : null
}
