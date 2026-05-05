import type { Block } from 'payload'

export const StatsTableBlock: Block = {
  slug: 'stats-table',
  labels: { singular: 'Stats Table', plural: 'Stats Tables' },
  fields: [
    {
      name: 'rows',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
        {
          name: 'color',
          type: 'select',
          options: [
            { label: 'Default (gray)', value: 'default' },
            { label: 'Warning (orange)', value: 'warning' },
            { label: 'Danger (red)', value: 'danger' },
            { label: 'Success (green)', value: 'success' },
          ],
        },
      ],
    },
  ],
}
