import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'
import { IS_STUB, STUB_ADDRESS_SUGGESTIONS } from '@/lib/stubs'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim()
  const city = req.nextUrl.searchParams.get('city')?.trim()
  if (!query || query.length < 2) return NextResponse.json([])

  const fullQuery = city ? `${city}, ${query}` : query

  if (IS_STUB) {
    const results = STUB_ADDRESS_SUGGESTIONS.filter((s) =>
      s.address.toLowerCase().includes(query.toLowerCase()),
    )
    return NextResponse.json(results.length > 0 ? results : STUB_ADDRESS_SUGGESTIONS)
  }

  const url = new URL('/api/', env.JANA_SETA_API_URL)
  url.searchParams.set('method', 'addressSearch')
  url.searchParams.set('query', fullQuery)
  url.searchParams.set('limit', '7')
  url.searchParams.set('types', 'building')
  url.searchParams.set('key', env.JANA_SETA_API_KEY)

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return NextResponse.json([])
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json([])
  }
}
