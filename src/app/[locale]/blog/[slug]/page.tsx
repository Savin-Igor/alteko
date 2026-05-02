import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { useMDXComponents } from '@/mdx-components'
import { routing } from '@/i18n/routing'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug_locale: { slug, locale } } })
  if (!post) return {}
  return { title: `${post.title} — ALTEKO`, description: post.description }
}

export default async function BlogArticlePage({ params }: Props) {
  const { locale, slug } = await params
  if (!routing.locales.includes(locale as 'lv' | 'ru')) notFound()

  const post = await prisma.blogPost.findUnique({
    where: { slug_locale: { slug, locale } },
  })
  if (!post || !post.published) notFound()

  const others = await prisma.blogPost.findMany({
    where: { locale, published: true, NOT: { slug } },
    orderBy: { publishedAt: 'desc' },
    take: 2,
    select: { slug: true, title: true, readMinutes: true },
  })

  const isLv = locale === 'lv'
  const components = useMDXComponents({})

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/blog" className="hover:text-gray-600">{isLv ? 'Blogs' : 'Блог'}</Link>
          <span>›</span>
          <span className="text-gray-600 truncate">{post.title}</span>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 bg-primary-light text-primary rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">{post.title}</h1>
          <p className="text-gray-500 leading-relaxed mb-4">{post.description}</p>
          <div className="flex items-center gap-3 text-sm text-gray-400 border-t border-gray-100 pt-4">
            <span>
              {post.publishedAt.toLocaleDateString(
                isLv ? 'lv-LV' : 'ru-RU',
                { year: 'numeric', month: 'long', day: 'numeric' },
              )}
            </span>
            <span>·</span>
            <span>{post.readMinutes} {isLv ? 'min.' : 'мин.'}</span>
          </div>
        </header>

        <article className="prose prose-sm max-w-none">
          <MDXRemote source={post.content} components={components} />
        </article>

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
