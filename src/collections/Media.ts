import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
    },
  ],
  upload: {
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 210, position: 'centre' },
      { name: 'hero', width: 1200, height: 630, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  },
}
