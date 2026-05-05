/**
 * Short-lived HMAC token for /api/audit/parse authorization.
 *
 * Issued by /api/audit/upload, required by /api/audit/parse.
 * Prevents unauthenticated callers from triggering GPT-4o calls
 * by guessing a reportId UUID (BOLA / issue #41).
 *
 * Token format: base64(reportId + ":" + expiresAt + ":" + hmac)
 * TTL: 2 hours — enough time to complete parsing after upload
 */

import { createHmac, timingSafeEqual } from 'crypto'

const TTL_MS = 2 * 60 * 60 * 1000

function getSecret(): string {
  const s = process.env.NEXTAUTH_SECRET
  if (!s) throw new Error('NEXTAUTH_SECRET not set')
  return s
}

export function issueParseToken(reportId: string): string {
  const expiresAt = Date.now() + TTL_MS
  const payload = `${reportId}:${expiresAt}`
  const hmac = createHmac('sha256', getSecret()).update(payload).digest('hex')
  return Buffer.from(`${payload}:${hmac}`).toString('base64url')
}

export function verifyParseToken(token: string, reportId: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const parts = decoded.split(':')
    if (parts.length !== 3) return false
    const [tokenReportId, expiresAtStr, hmac] = parts as [string, string, string]
    if (tokenReportId !== reportId) return false
    if (Date.now() > parseInt(expiresAtStr, 10)) return false
    const payload = `${tokenReportId}:${expiresAtStr}`
    const expected = createHmac('sha256', getSecret()).update(payload).digest('hex')
    return timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}
