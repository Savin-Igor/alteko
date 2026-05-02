import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateRenovationSavings } from '@/lib/calculator/renovation'
import { calculateAltumSubsidy, estimateRenovationCost } from '@/lib/calculator/altum'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const buildingId = req.nextUrl.searchParams.get('buildingId')
  if (!buildingId) {
    return NextResponse.json({ error: 'buildingId required' }, { status: 400 })
  }

  const building = await prisma.building.findUnique({
    where: { id: buildingId },
    select: {
      id: true,
      series: true,
      totalAreaM2: true,
      apartmentCount: true,
      energyClass: true,
    },
  })
  if (!building) {
    return NextResponse.json({ error: 'Building not found' }, { status: 404 })
  }

  // Get average heating cost from last 3 processed reports
  const recentReports = await prisma.expenseReport.findMany({
    where: { buildingId, status: 'PROCESSED' },
    orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    take: 3,
    include: {
      items: { where: { category: 'HEATING' }, select: { amountPerM2: true } },
    },
  })

  const heatingValues = recentReports
    .flatMap((r) => r.items.map((i) => Number(i.amountPerM2)))
    .filter((v) => v > 0)

  // Fallback: use segment average if no personal data
  const avgHeatingPerM2 = heatingValues.length > 0
    ? heatingValues.reduce((s, v) => s + v, 0) / heatingValues.length
    : 2.1  // Latvian average for series buildings

  const totalAreaM2 = Number(building.totalAreaM2) || 3000
  const apartmentCount = building.apartmentCount || 60

  const savings = calculateRenovationSavings({
    currentHeatingPerM2PerMonth: avgHeatingPerM2,
    totalAreaM2,
    currentEnergyClass: building.energyClass,
    apartmentCount,
  })

  const costEstimate = estimateRenovationCost(totalAreaM2)
  const subsidyMid = calculateAltumSubsidy(
    { totalRenovationCost: costEstimate.mid, buildingAreaM2: totalAreaM2, apartmentCount },
    savings.annualSavings,
  )

  return NextResponse.json({
    building: {
      series: building.series,
      totalAreaM2,
      apartmentCount,
      energyClass: building.energyClass,
    },
    savings,
    costEstimate,
    subsidy: subsidyMid,
    isPersonalized: heatingValues.length > 0,
  })
}
