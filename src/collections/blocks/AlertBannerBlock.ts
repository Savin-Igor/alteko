import type { Block } from 'payload'

export const AlertBannerBlock: Block = {
  slug: 'alert-banner',
  labels: { singular: 'Alert Banner', plural: 'Alert Banners' },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Warning', value: 'warning' },
        { label: 'Danger', value: 'danger' },
      ],
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
  ],
}
