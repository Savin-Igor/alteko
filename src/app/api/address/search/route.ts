import { NextRequest, NextResponse } from 'next/server'
import { IS_STUB, STUB_ADDRESS_SUGGESTIONS } from '@/lib/stubs'

export const runtime = 'nodejs'

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

function formatAddress(raw: string): string {
  return raw.replace(/, (Latvija|Latvia)$/, '').trim()
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim()
  const city = req.nextUrl.searchParams.get('city')?.trim()
  if (!query || query.length < 3) return NextResponse.json([])

  const fullQuery = city ? `${city}, ${query}` : query

  if (IS_STUB) {
    const results = STUB_ADDRESS_SUGGESTIONS.filter((s) =>
      s.address.toLowerCase().includes(query.toLowerCase()),
    )
    return NextResponse.json(results.length > 0 ? results : STUB_ADDRESS_SUGGESTIONS)
  }

  // TODO: replace with Jāņa sēta v3 API once API key is available
  // Endpoint: /v3/{key}/search?layers=adrese&cs=wgs84&iso_code=LVA
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', fullQuery)
  url.searchParams.set('countrycodes', 'lv')
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '7')
  url.searchParams.set('addressdetails', '1')

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'Accept-Language': 'lv,ru;q=0.8,en;q=0.5',
        'User-Agent': 'alteko-platform/1.0 (info@alteko.lv)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return NextResponse.json([])

    const data: NominatimResult[] = await res.json()
    const suggestions = data.map((r) => ({
      id: String(r.place_id),
      address: formatAddress(r.display_name),
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
    }))
    return NextResponse.json(suggestions)
  } catch {
    return NextResponse.json([])
  }
}
