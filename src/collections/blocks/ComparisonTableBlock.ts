import type { Block } from 'payload'

export const ComparisonTableBlock: Block = {
  slug: 'comparison-table',
  labels: { singular: 'Comparison Table', plural: 'Comparison Tables' },
  fields: [
    {
      name: 'beforeLabel',
      type: 'text',
      required: true,
      defaultValue: 'Before',
      admin: {
        description: 'Label for the left column. Example: "Before renovation"',
      },
    },
    {
      name: 'afterLabel',
      type: 'text',
      required: true,
      defaultValue: 'After',
      admin: {
        description: 'Label for the right column. Example: "After renovation"',
      },
    },
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
          admin: { description: 'Row parameter name. Example: "Energy class"' },
        },
        {
          name: 'before',
          type: 'text',
          required: true,
          admin: { description: 'Value before renovation. Example: "F"' },
        },
        {
          name: 'after',
          type: 'text',
          required: true,
          admin: { description: 'Value after renovation. Example: "C"' },
        },
      ],
    },
  ],
}
