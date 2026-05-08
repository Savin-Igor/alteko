import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

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

interface PayloadPostSummary {
  slug: string
  slugLv?: string | null
  publishedAt: string
  updatedAt?: string
}

async function fetchPublishedPosts(): Promise<PayloadPostSummary[]> {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { published: { equals: true } },
      sort: '-publishedAt',
      depth: 0,
      limit: 500,
      pagination: false,
    })
    return docs.map((d) => ({
      slug: d.slug as string,
      slugLv: (d as unknown as { slugLv?: string | null }).slugLv ?? null,
      publishedAt: d.publishedAt as string,
      updatedAt: (d as { updatedAt?: string }).updatedAt,
    }))
  } catch {
    // Payload/DB unavailable at build time — fall back to an empty blog list.
    // The sitemap still emits the static product pages so SEO is not broken.
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Blog articles — pulled from Payload so the sitemap matches what
  // is actually published. LV slug uses slugLv when filled, otherwise
  // falls back to the shared slug; RU always uses the shared slug.
  const posts = await fetchPublishedPosts()
  for (const post of posts) {
    const lvSlug = post.slugLv && post.slugLv.length > 0 ? post.slugLv : post.slug
    const ruSlug = post.slug
    const lvUrl = url(`/blog/${lvSlug}`)
    const ruUrl = url(`/ru/blog/${ruSlug}`)
    entries.push({
      url: lvUrl,
      lastModified: new Date(post.updatedAt ?? post.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          lv: lvUrl,
          ru: ruUrl,
        },
      },
    })
  }

  return entries
}
