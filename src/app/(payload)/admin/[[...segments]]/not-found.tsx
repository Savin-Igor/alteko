import { NotFoundPage } from '@payloadcms/next/views'
import config from '@payload-config'

export default async function NotFound() {
  return NotFoundPage({
    config,
    importMap: {},
    params: Promise.resolve({ segments: [] }),
    searchParams: Promise.resolve({}),
  })
}
