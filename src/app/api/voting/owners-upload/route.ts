import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export const runtime = 'nodejs'

// Issue #119: owner list staleness threshold — warn if list older than 6 months
const OWNER_LIST_STALE_DAYS = 180

interface OwnerRow {
  apartmentNumber: string
  areaM2: number
  ownershipShare: number
  zemesgramataRef?: string
}

interface ParseResult {
  rows: OwnerRow[]
  errors: string[]
}

function parseCsv(text: string): ParseResult {
  const lines = text.trim().split('\n')
  const rows: OwnerRow[] = []
  const errors: string[] = []

  if (lines.length < 2) {
    errors.push('CSV must contain a header row and at least one data row.')
    return { rows, errors }
  }

  // Issue #119: validate header columns
  const header = lines[0]!.split(/[;,]/).map((p) => p.trim().replace(/^"|"$/g, '').toLowerCase())
  const hasApartment = header.some((h) => h.includes('apartment') || h.includes('dzīvoklis') || h.includes('кварт'))
  const hasArea = header.some((h) => h.includes('area') || h.includes('platib') || h.includes('площадь'))
  const hasShare = header.some((h) => h.includes('share') || h.includes('daļa') || h.includes('доля'))

  if (!hasApartment || !hasArea || !hasShare) {
    errors.push(
      `Header row must contain columns for apartment number, area (m²), and ownership share. ` +
      `Found: ${header.join(', ')}. ` +
      `Expected format: apartment_number;area_m2;ownership_share_percent[;zemesgramata_ref]`
    )
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line?.trim()) continue
    const parts = line.split(/[;,]/).map((p) => p.trim().replace(/^"|"$/g, ''))
    if (parts.length < 3) {
      errors.push(`Row ${i + 1}: expected at least 3 columns, got ${parts.length}`)
      continue
    }

    const apartmentNumber = parts[0]!
    const areaM2 = parseFloat(parts[1]!)
    const ownershipShare = parseFloat(parts[2]!)
    const zemesgramataRef = parts[3] ?? undefined

    if (!apartmentNumber) {
      errors.push(`Row ${i + 1}: apartment number is empty`)
      continue
    }
    if (isNaN(areaM2) || areaM2 <= 0) {
      errors.push(`Row ${i + 1}: invalid area "${parts[1]}" — must be a positive number`)
      continue
    }
    if (isNaN(ownershipShare) || ownershipShare <= 0 || ownershipShare > 100) {
      errors.push(`Row ${i + 1}: invalid ownership share "${parts[2]}" — must be 0–100`)
      continue
    }

    rows.push({ apartmentNumber, areaM2, ownershipShare, zemesgramataRef })
  }

  return { rows, errors }
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
  const { rows, errors } = parseCsv(text)

  if (errors.length > 0 && rows.length === 0) {
    return NextResponse.json({
      error: 'CSV parsing failed',
      details: errors,
    }, { status: 422 })
  }

  if (rows.length === 0) {
    return NextResponse.json({
      error: 'CSV is empty or has no valid rows. Expected: apartment;area_m2;share_percent[;zemesgramata_ref]',
    }, { status: 422 })
  }

  // Validate shares sum to ~100%
  const totalShare = rows.reduce((s, r) => s + r.ownershipShare, 0)
  if (Math.abs(totalShare - 100) > 5) {
    return NextResponse.json({
      error: `Sum of ownership shares = ${totalShare.toFixed(1)}%. Must be ~100%.`,
    }, { status: 422 })
  }

  // Issue #119: compare row count with building.apartmentCount
  const building = await prisma.building.findUnique({
    where: { id: buildingId },
    select: { apartmentCount: true, ownerListUpdatedAt: true },
  })

  const warnings: string[] = []

  if (building?.apartmentCount) {
    const diff = Math.abs(rows.length - building.apartmentCount)
    const diffPercent = diff / building.apartmentCount
    if (diffPercent > 0.1) {
      warnings.push(
        `CSV has ${rows.length} apartments but building record shows ${building.apartmentCount}. ` +
        `Difference > 10% — please verify the list is complete.`
      )
    }
  }

  if (errors.length > 0) {
    warnings.push(...errors.map((e) => `Parse warning: ${e}`))
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

  // Issue #119: update staleness tracking fields
  const now = new Date()
  await prisma.building.update({
    where: { id: buildingId },
    data: {
      ownerListUpdatedAt: now,
      ownerListCount: rows.length,
    },
  })

  // Issue #119: warn if previous list was stale
  if (building?.ownerListUpdatedAt) {
    const daysSinceUpdate =
      (now.getTime() - building.ownerListUpdatedAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate > OWNER_LIST_STALE_DAYS) {
      warnings.push(
        `Previous owner list was ${Math.round(daysSinceUpdate)} days old (threshold: ${OWNER_LIST_STALE_DAYS} days). ` +
        `Ownership may have changed — verify with Zemesgrāmata extract.`
      )
    }
  }

  return NextResponse.json({
    upserted,
    total: rows.length,
    ownerListUpdatedAt: now.toISOString(),
    warnings: warnings.length > 0 ? warnings : undefined,
  })
}
