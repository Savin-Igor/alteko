# Payload CMS — Migration Plan

Migration of the ALTEKO blog from Prisma+PostgreSQL+next-mdx-remote to Payload CMS 3.x.

**Status:** Planned — implementation in progress

---

## Why Payload CMS

| Need | Before | After |
|------|--------|-------|
| Add/edit articles | Edit TypeScript seed file + `npx prisma db seed` | Admin UI at `/admin` |
| Images per article | Hardcoded `slug→file` map in code | Media collection, upload in admin |
| Localization | 2 DB rows per article (one per locale) | 1 document, field-level locale (LV/RU) |
| SEO meta | Only title + description | Full meta: title, description, OG image (via plugin) |
| Content format | Raw MDX string in DB | Lexical rich text with structured blocks |

---

## Architecture Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Content format | Lexical rich text + custom Blocks | CMS-native, editor-friendly, no raw code |
| Locale strategy | Field-level (one document, localized fields) | Simpler than separate rows per locale |
| Database | PostgreSQL via `@payloadcms/db-postgres` | No infrastructure change |
| API in RSC | Payload Local API (`getPayload`) | Zero network overhead |
| Admin route | `/admin` | Payload default |
| Image storage | Payload Media collection, local disk → S3 | Start simple, upgrade later |
| SEO | `@payloadcms/plugin-seo` | Official plugin, localized meta |

---

## Custom Lexical Blocks

These replace the MDX components currently embedded as raw JSX in article content:

| Block | Replaces | Fields |
|-------|---------|--------|
| `CalloutBlock` | `<Callout type="..." title="...">` | type (info/warning/success), title, body |
| `StatsTableBlock` | `<StatsTable>/<StatsRow>` | rows: { label, value, color }[] |
| `InlineCtaBlock` | `<InlineCta label="..." note="...">` | href, label, note |

---

## BlogPost Collection Schema

```ts
// src/collections/BlogPosts.ts

{
  slug: 'blog-posts',
  fields: [
    { name: 'slug',        type: 'text',     required: true, unique: true },  // not localized
    { name: 'title',       type: 'text',     required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
    { name: 'content',     type: 'richText', required: true, localized: true },
    { name: 'heroImage',   type: 'upload',   relationTo: 'media' },           // not localized
    { name: 'tags',        type: 'array',    localized: true, fields: [{ name: 'tag', type: 'text' }] },
    { name: 'readMinutes', type: 'number',   required: true },                 // not localized
    { name: 'publishedAt', type: 'date',     required: true },                 // not localized
    { name: 'published',   type: 'checkbox', defaultValue: false },            // not localized
  ],
  localization: { locales: ['lv', 'ru'], defaultLocale: 'lv' },
}
```

---

## URL Structure (unchanged)

| Locale | URL |
|--------|-----|
| Latvian (default) | `/blog/[slug]` |
| Russian | `/ru/blog/[slug]` |

The `slug` field is not localized — same value in both languages.

---

## Content Migration Strategy

3 article pairs (6 DB rows) → 3 Payload documents.

1. **Auto-migrate**: standard Markdown content via `@payloadcms/richtext-lexical` converters
2. **Manual**: re-enter `<Callout>` and `<StatsTable>` as Lexical Blocks in admin UI (3 articles)
3. **Images**: upload existing `/public/buildings/*.png` to Payload Media, link to posts
4. **Rollback**: keep old `BlogPost` Prisma table until migration verified, then drop

---

## Implementation Stages

| # | Stage | Status |
|---|-------|--------|
| 0 | Upgrade Next.js 14 → 15 | Planned |
| 1 | Install Payload CMS + configure locales | Planned |
| 2 | Define BlogPost collection + custom Lexical blocks | Planned |
| 3 | Add Media collection + heroImage field | Planned |
| 4 | SEO plugin — localized meta + OG image | Planned |
| 5 | Replace Prisma queries with Payload Local API | Planned |
| 6 | Content migration script + manual re-entry | Planned |
| 7 | Admin access control + first-run setup | Planned |

---

## Key Files

```
payload.config.ts                           ← root Payload config
src/collections/BlogPosts.ts                ← collection schema + blocks
src/collections/Media.ts                    ← media collection
src/app/(payload)/admin/[[...segments]]/    ← admin UI routes
src/app/(frontend)/[locale]/blog/           ← blog pages (moved to route group)
scripts/migrate-blog-to-payload.ts          ← one-time migration script
```

---

## Prerequisite Note

Payload CMS 3.x requires **Next.js 15+**. The project was on 14.2.29.
No `cookies()` / `headers()` sync usage found in source — upgrade risk is low.

*Related docs: `technical/data-model.md`, `product/content-plan-blog.md`*
