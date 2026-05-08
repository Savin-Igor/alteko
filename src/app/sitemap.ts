import type { MetadataRoute } from 'next'
import { articles } from '@/content/articles/registry'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://alteko.lv'

function url(path: string) {
  return `${BASE}${path}`
}

// Static pages present in both locales (publicly indexable).
// Process flows (/audit/upload, /audit/preview, /audit/report/*),
// auth, dashboards, /b/[token], /voting/*, /readiness-report/order/*
// are intentionally excluded from sitemap.xml (private / per-token).
const STATIC_PAGES = [
  '',
  '/audit',
  '/renovation',
  '/financing',
  '/contractors',
  '/contractors/register',
  '/blog',
  '/privacy',
  '/terms',
]

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
