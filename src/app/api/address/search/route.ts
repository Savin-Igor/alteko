import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'
import { IS_STUB, STUB_ADDRESS_SUGGESTIONS } from '@/lib/stubs'

export const runtime = 'nodejs'

interface JanaSetaResult {
  name: string
  x: number
  y: number
}

interface JanaSetaResponse {
  adrese?: JanaSetaResult[]
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim()
  if (!query || query.length < 3) return NextResponse.json([])

  if (IS_STUB) {
    const q = query.toLowerCase()
    const results = STUB_ADDRESS_SUGGESTIONS.filter((s) =>
      s.address.toLowerCase().includes(q),
    )
    return NextResponse.json(results.length > 0 ? results : STUB_ADDRESS_SUGGESTIONS)
  }

  // Jāņa sēta v3 Search API: https://developers.kartes.lv/en/search/
  // Endpoint: /v3/{apiKey}/search — key in path, not query param
  const url = new URL(`/v3/${env.JANA_SETA_API_KEY}/search`, env.JANA_SETA_API_URL)
  url.searchParams.set('q', query)
  url.searchParams.set('layers', 'adrese')
  url.searchParams.set('fields', 'name,x,y')
  url.searchParams.set('cs', 'wgs84')
  url.searchParams.set('limit', '6')
  url.searchParams.set('iso_code', 'LVA')

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return NextResponse.json([])

    const data: JanaSetaResponse = await res.json()
    const suggestions = (data.adrese ?? []).map((r) => ({
      id: `${r.y},${r.x}`,
      address: r.name,
      lat: r.y,
      lon: r.x,
    }))
    return NextResponse.json(suggestions)
  } catch {
    return NextResponse.json([])
  }
}
