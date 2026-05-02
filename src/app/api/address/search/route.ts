import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim()
  if (!query || query.length < 2) {
    return NextResponse.json([])
  }

  const url = new URL('/api/', env.JANA_SETA_API_URL)
  url.searchParams.set('method', 'addressSearch')
  url.searchParams.set('query', query)
  url.searchParams.set('limit', '5')
  url.searchParams.set('types', 'building')
  url.searchParams.set('key', env.JANA_SETA_API_KEY)

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return NextResponse.json([])
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([])
  }
}
