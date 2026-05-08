#!/usr/bin/env node
/**
 * Postinstall patcher for Payload's loadEnv.js.
 *
 * Why: Payload 3.x ships compiled JS that does `import nextEnvImport from
 * '@next/env'` against a CJS module that has no `.default` field. Plain Node
 * ESM handles this fine, but `tsx` (used for our seed scripts via the `seed:*`
 * npm aliases) compiles the import to `import_env.default` and crashes with
 * `Cannot destructure property 'loadEnvConfig' of 'import_env.default'`.
 *
 * The fix is one keyword: `import * as nextEnvImport` instead of
 * `import nextEnvImport`. The compiled CJS form of `import *` is just
 * `require('@next/env')`, which preserves the named export `loadEnvConfig`
 * regardless of whether `.default` exists.
 *
 * This script is idempotent — runs as `npm postinstall`, no-ops if the file
 * is already patched or the package layout differs from expected.
 *
 * Tracking: issue #151.
 */

const fs = require('fs')
const path = require('path')

const target = path.resolve(__dirname, '..', 'node_modules', 'payload', 'dist', 'bin', 'loadEnv.js')

if (!fs.existsSync(target)) {
  // Payload not yet installed (e.g. CI step ordering). Nothing to patch.
  process.exit(0)
}

const original = fs.readFileSync(target, 'utf8')
const NEEDLE = "import nextEnvImport from '@next/env';"
const REPLACEMENT = "import * as nextEnvImport from '@next/env';"

if (!original.includes(NEEDLE)) {
  // Either already patched or a future Payload version that doesn't have this bug.
  process.exit(0)
}

const patched = original.replace(NEEDLE, REPLACEMENT)
fs.writeFileSync(target, patched)
console.log('[patch-payload-loadenv] applied @next/env CJS-interop fix to payload/dist/bin/loadEnv.js')
