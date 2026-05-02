import type { ComponentType } from 'react'

// RU articles
import { AltumSubsidiyaContent, altumSubsidiyaMeta } from './ru/altum-subsidiya-2025'
import { NormaTeplaContent, normaTeplaМeta } from './ru/norma-tepla'
import { Seriya119Content, seriya119Meta } from './ru/seriya-119'

// LV articles (stubs until translated)
import { AltumSubsidijaContent, altumSubsidijaMeta } from './lv/altum-subsidija-2025'
import { NormaTeplaLvContent, normaTeplaLvMeta } from './lv/norma-tepla'
import { Serija119Content, serija119Meta } from './lv/serija-119'

export type Locale = 'lv' | 'ru'

export interface ArticleLocale {
  title: string
  description: string
  Content: ComponentType
}

export interface Article {
  slug: string
  publishedAt: string
  readMinutes: number
  tags: string[]
  locales: Partial<Record<Locale, ArticleLocale>>
}

export const articles: Article[] = [
  {
    slug: 'subsidiya-altum-renovaciya-2025',
    publishedAt: '2025-04-15',
    readMinutes: 8,
    tags: ['реновация', 'субсидии'],
    locales: {
      ru: { ...altumSubsidiyaMeta, Content: AltumSubsidiyaContent },
      lv: { ...altumSubsidijaMeta, Content: AltumSubsidijaContent },
    },
  },
  {
    slug: 'norma-rashoda-tepla-latviya',
    publishedAt: '2025-04-22',
    readMinutes: 6,
    tags: ['отопление', 'расходы'],
    locales: {
      ru: { ...normaTeplaМeta, Content: NormaTeplaContent },
      lv: { ...normaTeplaLvMeta, Content: NormaTeplaLvContent },
    },
  },
  {
    slug: 'seriya-119-latviya',
    publishedAt: '2025-04-29',
    readMinutes: 7,
    tags: ['отопление', 'реновация'],
    locales: {
      ru: { ...seriya119Meta, Content: Seriya119Content },
      lv: { ...serija119Meta, Content: Serija119Content },
    },
  },
]

export function getArticle(slug: string, locale: Locale) {
  const article = articles.find((a) => a.slug === slug)
  if (!article) return null
  const localeData = article.locales[locale] ?? article.locales.ru
  if (!localeData) return null
  return { ...article, ...localeData }
}

export interface ArticleInfo extends ArticleLocale {
  slug: string
  publishedAt: string
  readMinutes: number
  tags: string[]
}

export function getArticlesForLocale(locale: Locale): ArticleInfo[] {
  const result: ArticleInfo[] = []
  for (const a of articles) {
    const localeData = a.locales[locale] ?? a.locales.ru
    if (!localeData) continue
    result.push({
      slug: a.slug,
      publishedAt: a.publishedAt,
      readMinutes: a.readMinutes,
      tags: a.tags,
      ...localeData,
    })
  }
  return result
}

export type { ArticleInfo as ArticleWithLocale }
