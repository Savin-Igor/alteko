/**
 * Upload hero images to Payload Media and link them to blog posts.
 *
 * Run:
 *   npx tsx scripts/upload-hero-images.ts
 */

import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '../payload.config'

const ARTICLES_DIR = path.join(process.cwd(), 'public/articles')

const IMAGE_MAP: Record<string, { file: string; alt: string }> = {
  'sovetskie-podyezdy-dva-cveta': {
    file: 'soviet-entrance-hall.png',
    alt: 'Soviet apartment building entrance hallway with two-tone painted walls',
  },
  'seriya-602-holodnye-torcy': {
    file: 'series-602-cold-end.png',
    alt: 'Floor plan thermal diagram showing cold end apartments in Soviet panel building',
  },
  'kak-stroilis-sovetskie-panelyoty': {
    file: 'panel-construction.png',
    alt: 'Soviet concrete panel factory and construction crane lifting a wall panel',
  },
  'zachem-stroili-sovetskie-doma': {
    file: 'soviet-ideology.png',
    alt: 'Split view: dark communal corridor vs bright Soviet panel apartment interior',
  },
  'pochemu-9-etazhey-a-ne-10': {
    file: 'nine-floors-logic.png',
    alt: 'Soviet 9-story apartment building with fire truck aerial ladder reaching the roof',
  },
  'zhizn-do-i-posle-renovacii': {
    file: 'before-after-renovation.png',
    alt: 'Soviet apartment building before and after renovation comparison',
  },
  'kak-chitat-schet-kommunalka': {
    file: 'utility-bill-breakdown.png',
    alt: 'Utility bill cost breakdown with colored bars showing heating as largest expense',
  },
  'norma-rashoda-tepla-latviya': {
    file: 'heat-norm.png',
    alt: 'Heat consumption norm diagram for Latvian apartment buildings',
  },
  'subsidiya-altum-renovaciya-2025': {
    file: 'altum-subsidy.png',
    alt: 'Altum subsidy financing split for apartment building renovation in Latvia',
  },
}

async function main() {
  const payload = await getPayload({ config })

  for (const [slug, { file, alt }] of Object.entries(IMAGE_MAP)) {
    const filePath = path.join(ARTICLES_DIR, file)

    if (!fs.existsSync(filePath)) {
      console.log(`⚠ Skipping ${slug}: file not found (${file})`)
      continue
    }

    // Find blog post
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    const post = docs[0]
    if (!post) {
      console.log(`⚠ Skipping ${slug}: blog post not found`)
      continue
    }

    if (post.heroImage) {
      console.log(`✓ ${slug}: hero image already set, skipping`)
      continue
    }

    // Upload media
    const fileBuffer = fs.readFileSync(filePath)
    const { size } = fs.statSync(filePath)

    console.log(`↑ Uploading ${file} (${Math.round(size / 1024)}KB)...`)

    const media = await payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data: fileBuffer,
        mimetype: 'image/png',
        name: file,
        size,
      },
    })

    // Link to blog post
    await payload.update({
      collection: 'blog-posts',
      id: post.id,
      data: { heroImage: media.id },
    })

    console.log(`✓ ${slug} → media #${media.id} (${media.url})`)
  }

  console.log('\nDone.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
