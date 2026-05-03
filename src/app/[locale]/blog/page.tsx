import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { BlogCoverIcon } from '@/components/ui/BlogCoverIcon'
import { seriesFromSlug, getSeriesImage } from '@/lib/buildingImages'
import { routing } from '@/i18n/routing'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog.metadata' })
  return { title: t('title'), description: t('description') }
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

  const t = await getTranslations('blog')
  const tNav = await getTranslations('nav')

  const posts = await prisma.blogPost.findMany({
    where: { locale, published: true },
    orderBy: { publishedAt: 'desc' },
    select: { slug: true, title: true, description: true, publishedAt: true, readMinutes: true, tags: true },
  })

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-10 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-500">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card block hover:border-gray-300 transition-colors group"
            >
              <div className="flex items-start gap-4">
                {(() => {
                  const series = seriesFromSlug(post.slug)
                  return series ? (
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden relative">
                      <Image
                        src={getSeriesImage(series)}
                        alt={`Серия ${series}`}
                        fill
                        className="object-cover object-center"
                      />
                    </div>
                  ) : (
                    <BlogCoverIcon tags={post.tags} />
                  )
                })()}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h2 className="font-semibold text-gray-900 group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </h2>
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
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-gray-400">
                      {post.publishedAt.toLocaleDateString(
                        locale === 'lv' ? 'lv-LV' : 'ru-RU',
                        { year: 'numeric', month: 'long', day: 'numeric' },
                      )}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{post.readMinutes} {t('readMin')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 card text-center space-y-3">
          <p className="font-medium text-gray-900">
            {t('checkHome')}
          </p>
          <p className="text-sm text-gray-500">
            {t('checkHomeSub')}
          </p>
          <Link href="/#hero" className="btn-primary inline-block w-auto px-8">
            {tNav('findHome')}
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
