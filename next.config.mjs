import { withPayload } from '@payloadcms/next/withPayload'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const i18nConfigPath = path.resolve(__dirname, './src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  outputFileTracingExcludes: {
    '*': ['data/**'],
  },
  // Next.js 15 standalone tracing misses some internal modules referenced
  // dynamically (e.g. next/dist/lib/metadata/metadata-constants), causing
  // production crashes with "Cannot find module ...". Force-include the
  // whole next/dist/lib tree to side-step the trace gap.
  outputFileTracingIncludes: {
    '*': ['./node_modules/next/dist/lib/**/*'],
  },
  webpack(webpackConfig, { webpack }) {
    if (!webpackConfig.resolve) webpackConfig.resolve = {}

    // Next.js RSC compilation stores resolve.alias as an array.
    // withNextIntl plugin only patches the object form and is silently
    // dropped for RSC bundles. Handle both forms here.
    if (Array.isArray(webpackConfig.resolve.alias)) {
      webpackConfig.resolve.alias = [
        ...webpackConfig.resolve.alias.filter((a) => a.name !== 'next-intl/config'),
        { name: 'next-intl/config', alias: i18nConfigPath },
      ]
    } else {
      if (!webpackConfig.resolve.alias) webpackConfig.resolve.alias = {}
      webpackConfig.resolve.alias['next-intl/config'] = i18nConfigPath
    }

    // Prevent webpack context scan from entering the Docker Postgres data directory.
    // That directory is owned by the postgres container user (uid 70) and is unreadable
    // by the build user, which causes a fatal EACCES during FlightClientEntryPlugin scan.
    webpackConfig.plugins.push(new webpack.ContextExclusionPlugin(/[\\/]data[\\/]/))
    webpackConfig.watchOptions = {
      ...webpackConfig.watchOptions,
      ignored: ['**/node_modules/**', '**/data/**'],
    }

    return webpackConfig
  },
}

export default withPayload(config)
