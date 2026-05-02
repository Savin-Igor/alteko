import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return locale === 'lv'
    ? { title: 'Blogs — ALTEKO', description: 'Raksti par komunālajiem izdevumiem un renovāciju Latvijā.' }
    : { title: 'Блог — ALTEKO: ЖКХ и реновация в Латвии', description: 'Статьи об экономии на коммунальных расходах, субсидии Altum и реновации в Латвии.' }
}

const TAG_COLORS: Record<string, string> = {
  'реновация': 'bg-primary-light text-primary',
  'субсидии': 'bg-success-light text-success',
  'отопление': 'bg-warning-light text-warning',
  'расходы': 'bg-gray-100 text-gray-600',
  'renovācija': 'bg-primary-light text-primary',
  'subsīdijas': 'bg-success-light text-success',
  'apkure': 'bg-warning-light text-warning',
  'izdevumi': 'bg-gray-100 text-gray-600',
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'lv' | 'ru')) notFound()

  const posts = await prisma.blogPost.findMany({
    where: { locale, published: true },
    orderBy: { publishedAt: 'desc' },
    select: { slug: true, title: true, description: true, publishedAt: true, readMinutes: true, tags: true },
  })

  const isLv = locale === 'lv'

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-10 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isLv ? 'Blogs' : 'Блог'}
          </h1>
          <p className="text-gray-500">
            {isLv
              ? 'Komunālie izdevumi, subsīdijas un renovācija Latvijā — tikai konkrēti fakti.'
              : 'Коммунальные расходы, субсидии и реновация в Латвии — только конкретика.'}
          </p>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card block hover:border-gray-300 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 group-hover:text-primary transition-colors leading-snug mb-1">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-gray-400">
                      {post.publishedAt.toLocaleDateString(
                        isLv ? 'lv-LV' : 'ru-RU',
                        { year: 'numeric', month: 'long', day: 'numeric' },
                      )}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{post.readMinutes} {isLv ? 'min.' : 'мин.'}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 hidden sm:flex flex-col gap-1 items-end">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 card text-center space-y-3">
          <p className="font-medium text-gray-900">
            {isLv ? 'Pārbaudiet savas mājas izdevumus' : 'Проверьте расходы вашего дома'}
          </p>
          <p className="text-sm text-gray-500">
            {isLv ? 'Bez maksas. 30 sekundes.' : 'Бесплатно. 30 секунд.'}
          </p>
          <Link href="/#hero" className="btn-primary inline-block w-auto px-8">
            {isLv ? 'Atrast savu māju →' : 'Найти свой дом →'}
          </Link>
        </div>
      </main>

      <footer className="px-4 py-6 border-t border-gray-100 text-center text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600">ALTEKO</Link>
        {' · '}
        <Link href="/blog" className="hover:text-gray-600">{isLv ? 'Blogs' : 'Блог'}</Link>
        {' · '}
        <Link href="/contractors/register" className="hover:text-gray-600">
          {isLv ? 'Būvuzņēmējiem' : 'Для подрядчиков'}
        </Link>
      </footer>
    </div>
  )
}
