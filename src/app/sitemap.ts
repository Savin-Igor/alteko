import type { MetadataRoute } from 'next'
import { articles } from '@/content/articles/registry'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://alteko.lv'

function url(path: string) {
  return `${BASE}${path}`
}

// Static pages present in both locales
const STATIC_PAGES = ['', '/renovation', '/blog', '/contractors/register']

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  // Static pages — LV (no prefix) + RU (/ru/)
  for (const path of STATIC_PAGES) {
    entries.push({
      url: url(path || '/'),
      lastModified: new Date(),
      changeFrequency: path === '' ? 'weekly' : 'monthly',
      priority: path === '' ? 1.0 : 0.8,
      alternates: {
        languages: {
          lv: url(path || '/'),
          ru: url(`/ru${path || '/'}`),
        },
      },
    })
  }

  // Blog articles — each slug in both locales
  for (const article of articles) {
    entries.push({
      url: url(`/blog/${article.slug}`),
      lastModified: new Date(article.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          lv: url(`/blog/${article.slug}`),
          ru: url(`/ru/blog/${article.slug}`),
        },
      },
    })
  }

  return entries
}
