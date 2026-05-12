import { NextRequest, NextResponse } from 'next/server'

interface Counter {
  count: number
  reset: number
}

// In-memory sliding-window rate limiter.
// Works for single-container Node.js deployment; not suitable for edge runtime.
// State is lost on container restart — acceptable since rate limits are soft defenses.
const store = new Map<string, Counter>()

export function checkRateLimit(
  ip: string,
  limit = 60,
  windowMs = 60_000,
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || now >= entry.reset) {
    store.set(ip, { count: 1, reset: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count }
}

// Extracts real client IP, respecting X-Forwarded-For from nginx proxy.
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? '127.0.0.1'
}

// Produces a 429 response with standard Retry-After header.
export function rateLimitExceeded(): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429, headers: { 'Retry-After': '60' } },
  )
}
