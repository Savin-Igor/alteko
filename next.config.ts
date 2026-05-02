import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import createMDX from '@next/mdx'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

const config: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
}

export default withNextIntl(withMDX(config))
