/**
 * One-time migration: Prisma BlogPost rows → Payload CMS documents.
 *
 * Run AFTER starting the dev server once (so Payload creates its tables):
 *   npx tsx scripts/migrate-blog-to-payload.ts
 *
 * What it does:
 * - Reads all BlogPost rows from the Prisma table (grouped by slug)
 * - Creates one Payload document per slug with localized fields for LV and RU
 * - Converts plain Markdown content to Payload Lexical format (standard nodes only)
 *   Custom MDX components (Callout, StatsTable) must be re-entered manually in admin.
 *
 * After verifying migration in the admin:
 * - Remove BlogPost model from prisma/schema.prisma
 * - Delete prisma/seed-blog.ts
 * - Run: npx prisma migrate dev --name remove-blog-post
 */

import { PrismaClient } from '@prisma/client'
import { getPayload } from 'payload'
import config from '../payload.config'

const prisma = new PrismaClient()

async function convertMarkdownToLexical(markdown: string): Promise<object> {
  // Minimal Lexical state: wrap plain text paragraphs.
  // Payload's Markdown converter requires a running Lexical instance (browser env).
  // For the migration we create a simple document structure; editors can then
  // enrich content with blocks via the admin UI.
  const paragraphs = markdown
    .split('\n\n')
    .map((block) => block.trim())
    .filter(Boolean)
    .map((text) => ({
      type: 'paragraph',
      children: [{ type: 'text', text: text.replace(/<[^>]+>/g, '').substring(0, 1000) }],
      direction: 'ltr' as const,
      format: '',
      indent: 0,
      version: 1,
    }))

  return {
    root: {
      type: 'root',
      children: paragraphs.length > 0 ? paragraphs : [
        { type: 'paragraph', children: [{ type: 'text', text: '' }], direction: 'ltr', format: '', indent: 0, version: 1 },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

async function main() {
  const payload = await getPayload({ config })

  const rows = await prisma.blogPost.findMany({
    orderBy: [{ slug: 'asc' }, { locale: 'asc' }],
  })

  // Group by slug
  const bySlug = new Map<string, typeof rows>()
  for (const row of rows) {
    const group = bySlug.get(row.slug) ?? []
    group.push(row)
    bySlug.set(row.slug, group)
  }

  console.log(`Migrating ${bySlug.size} articles (${rows.length} locale rows)...`)

  for (const [slug, localeRows] of bySlug) {
    const lv = localeRows.find((r) => r.locale === 'lv')
    const ru = localeRows.find((r) => r.locale === 'ru')

    if (!lv && !ru) continue

    const base = lv ?? ru!

    // Check if already exists
    const existing = await payload.find({
      collection: 'blog-posts',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`  ⏭  ${slug} — already exists, skipping`)
      continue
    }

    // Create document in default locale (lv)
    const lvContent = lv ? await convertMarkdownToLexical(lv.content) : null
    const lvTags = lv ? lv.tags.map((tag) => ({ tag })) : []

    const doc = await payload.create({
      collection: 'blog-posts',
      locale: 'lv',
      data: {
        slug,
        title: lv?.title ?? ru?.title ?? '',
        description: lv?.description ?? ru?.description ?? '',
        content: lvContent ?? await convertMarkdownToLexical(''),
        tags: lvTags,
        readMinutes: base.readMinutes,
        publishedAt: base.publishedAt.toISOString(),
        published: base.published,
      },
    })

    // Update RU locale
    if (ru) {
      const ruContent = await convertMarkdownToLexical(ru.content)
      const ruTags = ru.tags.map((tag) => ({ tag }))

      await payload.update({
        collection: 'blog-posts',
        id: doc.id,
        locale: 'ru',
        data: {
          title: ru.title,
          description: ru.description,
          content: ruContent,
          tags: ruTags,
        },
      })
    }

    console.log(`  ✅ ${slug} — migrated (LV: ${!!lv}, RU: ${!!ru})`)
  }

  console.log('\nDone. Next steps:')
  console.log('1. Open /admin and review migrated articles')
  console.log('2. Manually re-enter Callout and StatsTable blocks for each article')
  console.log('3. Upload hero images to Media and link to posts')
  console.log('4. When verified, drop BlogPost from schema and delete seed-blog.ts')

  await prisma.$disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
