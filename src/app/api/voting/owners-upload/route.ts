import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export const runtime = 'nodejs'

interface OwnerRow {
  apartmentNumber: string
  areaM2: number
  ownershipShare: number
  zemesgramataRef?: string
}

function parseCsv(text: string): OwnerRow[] {
  const lines = text.trim().split('\n')
  const rows: OwnerRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line?.trim()) continue
    const parts = line.split(/[;,]/).map((p) => p.trim().replace(/^"|"$/g, ''))
    if (parts.length < 3) continue

    const apartmentNumber = parts[0]!
    const areaM2 = parseFloat(parts[1]!)
    const ownershipShare = parseFloat(parts[2]!)
    const zemesgramataRef = parts[3] ?? undefined

    if (!apartmentNumber || isNaN(areaM2) || isNaN(ownershipShare)) continue

    rows.push({ apartmentNumber, areaM2, ownershipShare, zemesgramataRef })
  }

  return rows
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (user?.role !== 'ASSOCIATION_ADMIN' && user?.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const buildingId = formData.get('buildingId') as string | null

  if (!file || !buildingId) {
    return NextResponse.json({ error: 'file and buildingId required' }, { status: 400 })
  }

  const text = await file.text()
  const rows = parseCsv(text)

  if (rows.length === 0) {
    return NextResponse.json({ error: 'CSV пустой или неверный формат. Ожидается: квартира;площадь_м2;доля;zemesgramata_ref' }, { status: 422 })
  }

  // Validate shares sum to ~100%
  const totalShare = rows.reduce((s, r) => s + r.ownershipShare, 0)
  if (Math.abs(totalShare - 100) > 5) {
    return NextResponse.json({
      error: `Сумма долей = ${totalShare.toFixed(1)}%. Должно быть ~100%.`,
    }, { status: 422 })
  }

  const shareDecimal = rows.map((r) => ({ ...r, ownershipShare: r.ownershipShare / 100 }))

  let upserted = 0
  for (const row of shareDecimal) {
    await prisma.apartment.upsert({
      where: { buildingId_apartmentNumber: { buildingId, apartmentNumber: row.apartmentNumber } },
      create: {
        buildingId,
        apartmentNumber: row.apartmentNumber,
        areaM2: row.areaM2,
        ownershipShare: row.ownershipShare,
        zemesgramataRef: row.zemesgramataRef ?? null,
      },
      update: {
        areaM2: row.areaM2,
        ownershipShare: row.ownershipShare,
        zemesgramataRef: row.zemesgramataRef ?? null,
      },
    })
    upserted++
  }

  return NextResponse.json({ upserted, total: rows.length })
}
