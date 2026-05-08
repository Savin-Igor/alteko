import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Link } from '@/i18n/navigation'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { BlogCoverIcon } from '@/components/ui/BlogCoverIcon'
import { routing } from '@/i18n/routing'
import { localizedAlternates } from '@/lib/seo'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog.metadata' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates({ path: '/blog', locale }),
  }
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

  const payload = await getPayload({ config })
  const { docs: posts } = await payload.find({
    collection: 'blog-posts',
    locale: locale as 'lv' | 'ru',
    where: { published: { equals: true } },
    sort: '-publishedAt',
    depth: 0,
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
          {posts.map((post) => {
            const tags = (post.tags as Array<{ tag: string }> ?? []).map((item) => item.tag)
            const publishedAt = new Date(post.publishedAt as string)
            const slugLv = (post as unknown as { slugLv?: string | null }).slugLv
            const linkSlug = locale === 'lv' && slugLv ? slugLv : (post.slug as string)

            return (
              <Link
                key={post.slug as string}
                href={`/blog/${linkSlug}`}
                className="card block hover:border-gray-300 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <BlogCoverIcon tags={tags} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h2 className="font-semibold text-gray-900 group-hover:text-primary transition-colors leading-snug">
                        {post.title as string}
                      </h2>
                      <div className="flex-shrink-0 hidden sm:flex flex-col gap-1 items-end">
                        {tags.slice(0, 2).map((tag) => (
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
                      {post.description as string}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs text-gray-400">
                        {publishedAt.toLocaleDateString(
                          locale === 'lv' ? 'lv-LV' : 'ru-RU',
                          { year: 'numeric', month: 'long', day: 'numeric' },
                        )}
                      </span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{post.readMinutes as number} {t('readMin')}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
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
