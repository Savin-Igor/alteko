import type { CollectionConfig } from 'payload'
import {
  lexicalEditor,
  HeadingFeature,
  BlocksFeature,
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  UnorderedListFeature,
  OrderedListFeature,
  HorizontalRuleFeature,
  BlockquoteFeature,
  EXPERIMENTAL_TableFeature,
  ChecklistFeature,
  UploadFeature,
  AlignFeature,
  InlineCodeFeature,
} from '@payloadcms/richtext-lexical'
import { CalloutBlock } from './blocks/CalloutBlock'
import { StatsTableBlock } from './blocks/StatsTableBlock'
import { InlineCtaBlock } from './blocks/InlineCtaBlock'
import { VideoEmbedBlock } from './blocks/VideoEmbedBlock'
import { FAQBlock } from './blocks/FAQBlock'
import { AlertBannerBlock } from './blocks/AlertBannerBlock'
import { ComparisonTableBlock } from './blocks/ComparisonTableBlock'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt', 'published'],
    group: 'Blog',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL identifier — shared across LV and RU. Example: seriya-119-latviya',
      },
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'Used for SEO and article preview on the blog listing page.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      editor: lexicalEditor({
        features: [
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
          BoldFeature(),
          ItalicFeature(),
          LinkFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
          HorizontalRuleFeature(),
          BlockquoteFeature(),
          EXPERIMENTAL_TableFeature(),
          ChecklistFeature(),
          UploadFeature({ enabledCollections: ['media'] }),
          AlignFeature(),
          InlineCodeFeature(),
          BlocksFeature({
            blocks: [
              CalloutBlock,
              StatsTableBlock,
              InlineCtaBlock,
              VideoEmbedBlock,
              FAQBlock,
              AlertBannerBlock,
              ComparisonTableBlock,
            ],
          }),
        ],
      }),
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Displayed at the top of the article. Recommended: 1200×630 px.',
      },
    },
    {
      name: 'tags',
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'readMinutes',
      type: 'number',
      required: true,
      admin: {
        description: 'Estimated reading time in minutes.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Only published articles appear on the website.',
      },
    },
  ],
}
