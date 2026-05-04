import type { Block } from 'payload'

export const InlineCtaBlock: Block = {
  slug: 'inline-cta',
  labels: { singular: 'Inline CTA', plural: 'Inline CTAs' },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      defaultValue: 'Найти свой дом →',
    },
    {
      name: 'href',
      type: 'text',
      required: true,
      defaultValue: '/#hero',
    },
    {
      name: 'note',
      type: 'text',
    },
  ],
}
