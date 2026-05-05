import { NextRequest, NextResponse } from 'next/server'
import { IS_STUB, STUB_ADDRESS_SUGGESTIONS } from '@/lib/stubs'

export const runtime = 'nodejs'

interface NominatimAddress {
  house_number?: string
  road?: string
  suburb?: string
  city?: string
  town?: string
  village?: string
  county?: string
}

interface NominatimResult {
  place_id: number
  lat: string
  lon: string
  type: string
  class: string
  address: NominatimAddress
}

function formatAddress(addr: NominatimAddress): string {
  const road = addr.road ?? ''
  const num = addr.house_number ?? ''
  return [road, num].filter(Boolean).join(' ')
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim()
  const city = req.nextUrl.searchParams.get('city')?.trim()
  if (!query || query.length < 3) return NextResponse.json([])

  if (IS_STUB) {
    const results = STUB_ADDRESS_SUGGESTIONS.filter((s) =>
      s.address.toLowerCase().includes(query.toLowerCase()),
    )
    return NextResponse.json(results.length > 0 ? results : STUB_ADDRESS_SUGGESTIONS)
  }

  // Use Nominatim structured search for precise results.
  // street= accepts "house_number road" — gives much cleaner results than free-text.
  // TODO: replace with Jāņa sēta v3 API once API key is available.
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('street', query)
  if (city) url.searchParams.set('city', city)
  url.searchParams.set('countrycodes', 'lv')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '7')

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'Accept-Language': 'lv',
        'User-Agent': 'alteko-platform/1.0 (info@alteko.lv)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return NextResponse.json([])

    const data: NominatimResult[] = await res.json()

    const seen = new Set<string>()
    const suggestions = data
      .filter((r) => r.address.road)
      .map((r) => ({
        id: String(r.place_id),
        address: formatAddress(r.address),
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lon),
      }))
      .filter((s) => {
        if (!s.address.trim() || seen.has(s.address)) return false
        seen.add(s.address)
        return true
      })

    return NextResponse.json(suggestions)
  } catch {
    return NextResponse.json([])
  }
}
