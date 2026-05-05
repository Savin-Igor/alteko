import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import path from 'path'
import { fileURLToPath } from 'url'
import { Users } from './src/collections/Users'
import { Media } from './src/collections/Media'
import { BlogPosts } from './src/collections/BlogPosts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    suppressHydrationWarning: true,
  },
  collections: [Users, Media, BlogPosts],
  editor: lexicalEditor(),
  plugins: [
    mcpPlugin({
      collections: {
        'blog-posts': {
          enabled: true,
          description: 'Blog articles in LV and RU about renovation and energy costs in Latvian Soviet-era apartment buildings.',
        },
        media: {
          enabled: { find: true, create: true, update: true, delete: false },
          description: 'Article hero images and media files.',
        },
      },
    }),
    seoPlugin({
      collections: ['blog-posts'],
      generateTitle: ({ doc }) => `${doc?.title ?? ''} — ALTEKO`,
      generateDescription: ({ doc }) => doc?.description ?? '',
      generateImage: ({ doc }) => doc?.heroImage,
      generateURL: ({ doc }) =>
        `https://alteko.lv/blog/${doc?.slug ?? ''}`,
      uploadsCollection: 'media',
    }),
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    schemaName: 'payload',
  }),
  localization: {
    locales: [
      { label: 'Latviešu', code: 'lv' },
      { label: 'Русский', code: 'ru' },
    ],
    defaultLocale: 'lv',
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  upload: {
    limits: {
      fileSize: 10_000_000, // 10 MB
    },
  },
})
