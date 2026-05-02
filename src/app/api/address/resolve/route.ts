import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'
import { prisma } from '@/lib/prisma'
import { IS_STUB, stubBuildingForAddress } from '@/lib/stubs'
import type { EnergyClass } from '@prisma/client'

export const runtime = 'nodejs'

interface WfsResponse {
  features?: Array<{ properties: Record<string, unknown> }>
}

async function fetchCadastralCode(lat: number, lon: number): Promise<string | null> {
  const buffer = 0.0002
  const bbox = `${lon - buffer},${lat - buffer},${lon + buffer},${lat + buffer},EPSG:4326`
  const url = new URL(env.LVM_GEOSERVER_URL)
  url.searchParams.set('service', 'WFS')
  url.searchParams.set('version', '2.0.0')
  url.searchParams.set('request', 'GetFeature')
  url.searchParams.set('typeName', 'publicwfs:kkbuilding')
  url.searchParams.set('outputFormat', 'application/json')
  url.searchParams.set('srsName', 'EPSG:4326')
  url.searchParams.set('bbox', bbox)
  url.searchParams.set('count', '1')

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const data: WfsResponse = await res.json()
    const props = data.features?.[0]?.properties
    if (!props) return null
    return (props['code'] as string) ?? null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const lat = parseFloat(req.nextUrl.searchParams.get('lat') ?? '')
  const lon = parseFloat(req.nextUrl.searchParams.get('lon') ?? '')
  const address = req.nextUrl.searchParams.get('address') ?? ''

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 })
  }

  if (IS_STUB) {
    const stub = stubBuildingForAddress(address)
    const building = await prisma.building.upsert({
      where: { cadastralCode: stub.cadastralCode },
      create: {
        address:          stub.address,
        cadastralCode:    stub.cadastralCode,
        series:           stub.series,
        constructionYear: stub.constructionYear,
        totalAreaM2:      stub.totalAreaM2,
        apartmentCount:   stub.apartmentCount,
        energyClass:      stub.energyClass as EnergyClass,
        district:         stub.district,
        lat:              stub.lat,
        lon:              stub.lon,
      },
      update: {},
      select: {
        id: true, address: true, cadastralCode: true, series: true,
        constructionYear: true, totalAreaM2: true, apartmentCount: true,
        energyClass: true, district: true,
      },
    })
    return NextResponse.json({ ...building, found: true })
  }

  const cadastralCode = await fetchCadastralCode(lat, lon)
  if (!cadastralCode) return NextResponse.json({ found: false, address })

  const building = await prisma.building.findUnique({
    where: { cadastralCode },
    select: {
      id: true, address: true, cadastralCode: true, series: true,
      constructionYear: true, totalAreaM2: true, apartmentCount: true,
      energyClass: true, district: true,
    },
  })

  if (!building) return NextResponse.json({ found: false, cadastralCode, address })
  return NextResponse.json({ ...building, found: true })
}
