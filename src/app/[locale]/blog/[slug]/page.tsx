import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { articles, getArticle, getArticlesForLocale, type Locale } from '@/content/articles/registry'
import { routing } from '@/i18n/routing'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    articles.map((a) => ({ locale, slug: a.slug })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const article = getArticle(slug, locale as Locale)
  if (!article) return {}
  return { title: `${article.title} — ALTEKO`, description: article.description }
}

export default async function BlogArticlePage({ params }: Props) {
  const { locale, slug } = await params
  if (!routing.locales.includes(locale as Locale)) notFound()

  const article = getArticle(slug, locale as Locale)
  if (!article) notFound()

  const { Content } = article
  const others = getArticlesForLocale(locale as Locale).filter((a) => a.slug !== slug).slice(0, 2)
  const isLv = locale === 'lv'

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/blog" className="hover:text-gray-600">{isLv ? 'Blogs' : 'Блог'}</Link>
          <span>›</span>
          <span className="text-gray-600 truncate">{article.title}</span>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            {article.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 bg-primary-light text-primary rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">{article.title}</h1>
          <p className="text-gray-500 leading-relaxed mb-4">{article.description}</p>
          <div className="flex items-center gap-3 text-sm text-gray-400 border-t border-gray-100 pt-4">
            <span>
              {new Date(article.publishedAt).toLocaleDateString(
                isLv ? 'lv-LV' : 'ru-RU',
                { year: 'numeric', month: 'long', day: 'numeric' },
              )}
            </span>
            <span>·</span>
            <span>{article.readMinutes} {isLv ? 'min.' : 'мин.'}</span>
          </div>
        </header>

        <Content />

        <div className="mt-10 card text-center space-y-3">
          <p className="font-semibold text-gray-900">
            {isLv ? 'Pārbaudiet savas mājas izdevumus tūlīt' : 'Проверьте расходы вашего дома прямо сейчас'}
          </p>
          <p className="text-sm text-gray-500">
            {isLv ? 'Bez maksas. Bez reģistrācijas. 30 sekundes.' : 'Бесплатно. Без регистрации. Результат за 30 секунд.'}
          </p>
          <Link href="/#hero" className="btn-primary inline-block w-auto px-8">
            {isLv ? 'Atrast savu māju →' : 'Найти свой дом →'}
          </Link>
        </div>

        {others.length > 0 && (
          <div className="mt-10">
            <p className="text-sm font-semibold text-gray-700 mb-4">
              {isLv ? 'Lasiet arī' : 'Читайте также'}
            </p>
            <div className="space-y-3">
              {others.map((a) => (
                <Link key={a.slug} href={`/blog/${a.slug}`} className="card block hover:border-gray-300 transition-colors group">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{a.readMinutes} {isLv ? 'min.' : 'мин.'}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="px-4 py-6 border-t border-gray-100 text-center text-xs text-gray-400 mt-8">
        <Link href="/" className="hover:text-gray-600">ALTEKO</Link>
        {' · '}
        <Link href="/blog" className="hover:text-gray-600">{isLv ? 'Blogs' : 'Блог'}</Link>
      </footer>
    </div>
  )
}
