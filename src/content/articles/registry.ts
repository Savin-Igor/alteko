import type { ComponentType } from 'react'

// RU articles
import { AltumSubsidiyaContent, altumSubsidiyaMeta } from './ru/altum-subsidiya-2025'
import { NormaTeplaContent, normaTeplaМeta } from './ru/norma-tepla'
import { Seriya119Content, seriya119Meta } from './ru/seriya-119'
import { KakStroislisPanelyotyContent, kakStroislisPanelyotyMeta } from './ru/kak-stroilis-panelyoty'
import { ZachemStroiliSovetskieDomaCon, zachemnStroiliSovetskieDomaMeta } from './ru/zachem-stroili-sovetskie-doma'
import { Pochemu9EtazheyContent, pochemu9EtazheyMeta } from './ru/pochemu-9-etazhey'
import { ZhiznDoPosleRenovaciiContent, zhiznDoPosleRenovaciiMeta } from './ru/zhizn-do-posle-renovacii'
import { Seriya602Content, seriya602Meta } from './ru/seriya-602'
import { KakChitatSchetContent, kakChitatSchetMeta } from './ru/kak-chitat-schet'
import { SovetskiePodyezdyContent, sovetskiePodyezdyMeta } from './ru/sovetskie-podyezdy'

// LV articles (stubs until translated)
import { AltumSubsidijaContent, altumSubsidijaMeta } from './lv/altum-subsidija-2025'
import { NormaTeplaLvContent, normaTeplaLvMeta } from './lv/norma-tepla'
import { Serija119Content, serija119Meta } from './lv/serija-119'
import { KaCelaPanelumajas, kaCelaPanelumajasMeta } from './lv/ka-cela-panelumajas'
import { KapecCelaPardomjuMajasContent, kapecCelaPardomjuMajasMeta } from './lv/kapec-cela-padomju-majas'
import { Kapec9StaviContent, kapec9StaviMeta } from './lv/kapec-9-stavi'
import { DzivePirmsUnPecRenovacijasContent, dzivePirmsUnPecRenovacijasMeta } from './lv/dzive-pirms-un-pec-renovacijas'
import { Serija602Content, serija602Meta } from './lv/serija-602'
import { KaLasitKomunaloRekinuContent, kaLasitKomunaloRekinuMeta } from './lv/ka-lasit-komunalo-rekinu'
import { PadomjuKapnutelpasContent, padomjuKapnutelpasMeta } from './lv/padomju-kapnutelpas'

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
  {
    slug: 'kak-chitat-schet-kommunalka',
    publishedAt: '2025-05-06',
    readMinutes: 7,
    tags: ['расходы', 'аудит'],
    locales: {
      ru: { ...kakChitatSchetMeta, Content: KakChitatSchetContent },
      lv: { ...kaLasitKomunaloRekinuMeta, Content: KaLasitKomunaloRekinuContent },
    },
  },
  {
    slug: 'zhizn-do-i-posle-renovacii',
    publishedAt: '2025-05-13',
    readMinutes: 8,
    tags: ['реновация', 'экономия'],
    locales: {
      ru: { ...zhiznDoPosleRenovaciiMeta, Content: ZhiznDoPosleRenovaciiContent },
      lv: { ...dzivePirmsUnPecRenovacijasMeta, Content: DzivePirmsUnPecRenovacijasContent },
    },
  },
  {
    slug: 'pochemu-9-etazhey-a-ne-10',
    publishedAt: '2025-05-20',
    readMinutes: 5,
    tags: ['история', 'факты'],
    locales: {
      ru: { ...pochemu9EtazheyMeta, Content: Pochemu9EtazheyContent },
      lv: { ...kapec9StaviMeta, Content: Kapec9StaviContent },
    },
  },
  {
    slug: 'zachem-stroili-sovetskie-doma',
    publishedAt: '2025-05-27',
    readMinutes: 7,
    tags: ['история', 'общество'],
    locales: {
      ru: { ...zachemnStroiliSovetskieDomaMeta, Content: ZachemStroiliSovetskieDomaCon },
      lv: { ...kapecCelaPardomjuMajasMeta, Content: KapecCelaPardomjuMajasContent },
    },
  },
  {
    slug: 'kak-stroilis-sovetskie-panelyoty',
    publishedAt: '2025-06-03',
    readMinutes: 6,
    tags: ['история', 'строительство'],
    locales: {
      ru: { ...kakStroislisPanelyotyMeta, Content: KakStroislisPanelyotyContent },
      lv: { ...kaCelaPanelumajasMeta, Content: KaCelaPanelumajas },
    },
  },
  {
    slug: 'seriya-602-holodnye-torcy',
    publishedAt: '2025-06-10',
    readMinutes: 6,
    tags: ['отопление', 'серия 602'],
    locales: {
      ru: { ...seriya602Meta, Content: Seriya602Content },
      lv: { ...serija602Meta, Content: Serija602Content },
    },
  },
  {
    slug: 'sovetskie-podyezdy-dva-cveta',
    publishedAt: '2025-06-17',
    readMinutes: 5,
    tags: ['история', 'факты'],
    locales: {
      ru: { ...sovetskiePodyezdyMeta, Content: SovetskiePodyezdyContent },
      lv: { ...padomjuKapnutelpasMeta, Content: PadomjuKapnutelpasContent },
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
