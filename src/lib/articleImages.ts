const ARTICLE_IMAGES: Record<string, string> = {
  'subsidiya-altum-renovaciya-2025': '/buildings/altum-subsidy.png',
  'norma-rashoda-tepla-latviya': '/buildings/heat-norm.png',
  'seriya-119-latviya': '/buildings/series-119.png',
}

export function getArticleImage(slug: string): string | null {
  return ARTICLE_IMAGES[slug] ?? null
}
