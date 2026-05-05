import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Link } from '@/i18n/navigation'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { LexicalContent } from '@/components/blog/LexicalContent'
import { routing } from '@/i18n/routing'

// Payload CMS blog post fields — partial typing for dynamic collection
interface PayloadBlogPost {
  meta?: { title?: string; description?: string }
  heroImage?: { url?: string; alt?: string; width?: number; height?: number } | null
  [key: string]: unknown
}

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'blog-posts',
    locale: locale as 'lv' | 'ru',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  const post = docs[0]
  if (!post) return {}

  const typedPost = post as unknown as PayloadBlogPost
  const meta = typedPost.meta
  const heroImage = typedPost.heroImage

  return {
    title: meta?.title ?? `${post.title} — ALTEKO`,
    description: meta?.description ?? (post.description as string),
    openGraph: heroImage?.url
      ? { images: [{ url: heroImage.url as string }] }
      : undefined,
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const { locale, slug } = await params
  if (!routing.locales.includes(locale as 'lv' | 'ru')) notFound()

  const t = await getTranslations('blog')
  const tNav = await getTranslations('nav')

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'blog-posts',
    locale: locale as 'lv' | 'ru',
    where: {
      and: [
        { slug: { equals: slug } },
        { published: { equals: true } },
      ],
    },
    limit: 1,
    depth: 1,
  })

  const post = docs[0]
  if (!post) notFound()

  const { docs: others } = await payload.find({
    collection: 'blog-posts',
    locale: locale as 'lv' | 'ru',
    where: {
      and: [
        { published: { equals: true } },
        { slug: { not_equals: slug } },
      ],
    },
    sort: '-publishedAt',
    limit: 2,
    depth: 0,
  })

  const tags = (post.tags as Array<{ tag: string }> ?? []).map((item) => item.tag)
  const heroImage = (post as unknown as PayloadBlogPost).heroImage
  const heroImageUrl: string | null = heroImage?.url ?? null

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/blog" className="hover:text-gray-600">{t('title')}</Link>
          <span>›</span>
          <span className="text-gray-600 truncate">{post.title as string}</span>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            {tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 bg-primary-light text-primary rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">{post.title as string}</h1>
          <p className="text-gray-500 leading-relaxed mb-4">{post.description as string}</p>
          <div className="flex items-center gap-3 text-sm text-gray-400 border-t border-gray-100 pt-4">
            <span>
              {new Date(post.publishedAt as string).toLocaleDateString(
                locale === 'lv' ? 'lv-LV' : 'ru-RU',
                { year: 'numeric', month: 'long', day: 'numeric' },
              )}
            </span>
            <span>·</span>
            <span>{post.readMinutes as number} {t('readMin')}</span>
          </div>
        </header>

        {heroImageUrl && (
          <Image
            src={heroImageUrl}
            alt={post.title as string}
            width={1200}
            height={630}
            className="w-full h-auto rounded-xl mb-8"
            priority
          />
        )}

        <LexicalContent data={post.content} />

        <div className="mt-10 card text-center space-y-3">
          <p className="font-semibold text-gray-900">
            {t('checkHomeArticle')}
          </p>
          <p className="text-sm text-gray-500">
            {t('checkHomeArticleSub')}
          </p>
          <Link href="/#hero" className="btn-primary inline-block w-auto px-8">
            {tNav('findHome')}
          </Link>
        </div>

        {others.length > 0 && (
          <div className="mt-10">
            <p className="text-sm font-semibold text-gray-700 mb-4">
              {t('readMore')}
            </p>
            <div className="space-y-3">
              {others.map((a) => (
                <Link key={a.slug as string} href={`/blog/${a.slug}`} className="card block hover:border-gray-300 transition-colors group">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">{a.title as string}</p>
                  <p className="text-xs text-gray-400 mt-1">{a.readMinutes as number} {t('readMin')}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
