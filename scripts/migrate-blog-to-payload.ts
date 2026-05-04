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

type LexicalTextNode = {
  type: 'text'
  text: string
  format: number
  version: 1
}

type LexicalNode =
  | { type: 'paragraph'; children: LexicalTextNode[]; direction: 'ltr'; format: ''; indent: 0; version: 1 }
  | { type: 'heading'; tag: 'h2' | 'h3' | 'h4'; children: LexicalTextNode[]; direction: 'ltr'; format: ''; indent: 0; version: 1 }
  | { type: 'list'; listType: 'bullet'; start: 1; children: { type: 'listitem'; value: number; children: LexicalTextNode[]; direction: 'ltr'; format: ''; indent: 0; version: 1 }[]; direction: 'ltr'; format: ''; indent: 0; version: 1 }
  | { type: 'horizontalrule'; version: 1 }

function parseInlineText(text: string): LexicalTextNode[] {
  // Parse **bold**, *italic*, `code`, [link](url) → strip link, keep text
  const nodes: LexicalTextNode[] = []
  // Remove markdown links: [text](url) → text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '')

  // Split on **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/)
  for (const part of parts) {
    if (!part) continue
    if (part.startsWith('**') && part.endsWith('**')) {
      nodes.push({ type: 'text', text: part.slice(2, -2), format: 1, version: 1 }) // bold
    } else if (part.startsWith('*') && part.endsWith('*')) {
      nodes.push({ type: 'text', text: part.slice(1, -1), format: 2, version: 1 }) // italic
    } else if (part.startsWith('`') && part.endsWith('`')) {
      nodes.push({ type: 'text', text: part.slice(1, -1), format: 16, version: 1 }) // code
    } else {
      nodes.push({ type: 'text', text: part, format: 0, version: 1 })
    }
  }
  return nodes.length > 0 ? nodes : [{ type: 'text', text: '', format: 0, version: 1 }]
}

async function convertMarkdownToLexical(markdown: string): Promise<object> {
  // Strip MDX import/export lines and JSX components (both self-closing and block form)
  const cleaned = markdown
    .replace(/^import .+$/gm, '')
    .replace(/^export .+$/gm, '')
    .replace(/<(Callout|StatsTable|StatsRow|InlineCta)[\s\S]*?<\/\1>/g, '')
    .replace(/<(Callout|StatsTable|StatsRow|InlineCta)[^>]*\/>/g, '')
    .replace(/<(Callout|StatsTable|StatsRow|InlineCta)[^>]*>/g, '')
    .replace(/<\/(Callout|StatsTable|StatsRow|InlineCta)>/g, '')
    // Remove stray JSX remnants like "/>"
    .replace(/^\s*\/>\s*$/gm, '')
    .trim()

  const blocks = cleaned.split('\n\n').map((b) => b.trim()).filter(Boolean)
  const children: LexicalNode[] = []

  for (const block of blocks) {
    // Heading detection
    const h2 = block.match(/^#{1,2}\s+(.+)$/)
    const h3 = block.match(/^###\s+(.+)$/)
    const h4 = block.match(/^####\s+(.+)$/)

    if (h4) {
      children.push({ type: 'heading', tag: 'h4', children: parseInlineText(h4[1]), direction: 'ltr', format: '', indent: 0, version: 1 })
      continue
    }
    if (h3) {
      children.push({ type: 'heading', tag: 'h3', children: parseInlineText(h3[1]), direction: 'ltr', format: '', indent: 0, version: 1 })
      continue
    }
    if (h2) {
      children.push({ type: 'heading', tag: 'h2', children: parseInlineText(h2[1]), direction: 'ltr', format: '', indent: 0, version: 1 })
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(block)) {
      children.push({ type: 'horizontalrule', version: 1 })
      continue
    }

    // Bullet list (lines starting with - or *)
    const listLines = block.split('\n').filter((l) => /^[-*]\s/.test(l.trim()))
    if (listLines.length > 0 && listLines.length === block.split('\n').filter(Boolean).length) {
      children.push({
        type: 'list',
        listType: 'bullet',
        start: 1,
        children: listLines.map((line, i) => ({
          type: 'listitem' as const,
          value: i + 1,
          children: parseInlineText(line.replace(/^[-*]\s+/, '')),
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0 as const,
          version: 1 as const,
        })),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      })
      continue
    }

    // Markdown table — skip (complex, let editor re-enter)
    if (block.includes('|') && block.split('\n').every((l) => l.trim().startsWith('|') || /^[-|]+$/.test(l.trim()))) {
      children.push({ type: 'paragraph', children: [{ type: 'text', text: '[Таблица — введите вручную в редакторе]', format: 2, version: 1 }], direction: 'ltr', format: '', indent: 0, version: 1 })
      continue
    }

    // Regular paragraph
    children.push({
      type: 'paragraph',
      children: parseInlineText(block.replace(/\n/g, ' ')),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    })
  }

  return {
    root: {
      type: 'root',
      children: children.length > 0 ? children : [
        { type: 'paragraph', children: [{ type: 'text', text: '', format: 0, version: 1 }], direction: 'ltr', format: '', indent: 0, version: 1 },
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
