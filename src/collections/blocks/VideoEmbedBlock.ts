import type { Block } from 'payload'

export const VideoEmbedBlock: Block = {
  slug: 'video-embed',
  labels: { singular: 'Video Embed', plural: 'Video Embeds' },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description: 'YouTube or Vimeo URL. Example: https://www.youtube.com/watch?v=...',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional caption displayed below the video.',
      },
    },
  ],
}
