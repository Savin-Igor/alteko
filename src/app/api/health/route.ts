/**
 * Health endpoint for orchestrator probes (Docker, Kubernetes, Coolify, etc.).
 *
 * - Liveness: process is up, responds 200 with status payload.
 * - Readiness: DB is reachable via SELECT 1; degrades to 503 when not.
 *
 * No auth — exposed publicly so probes can hit it without credentials.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const startedAt = Date.now()
  let dbStatus: 'ok' | 'degraded' = 'ok'

  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    dbStatus = 'degraded'
  }

  const body = {
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    db: dbStatus,
    version: process.env.APP_VERSION ?? 'dev',
    uptimeSeconds: Math.round(process.uptime()),
    latencyMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(body, {
    status: dbStatus === 'ok' ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  })
}
