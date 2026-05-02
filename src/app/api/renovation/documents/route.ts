import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateRenovationSavings } from '@/lib/calculator/renovation'
import { calculateAltumSubsidy, estimateRenovationCost } from '@/lib/calculator/altum'
import { generateIntentDocument, generateAgendaDocument } from '@/lib/documents/generate'
import { uploadFile, getPresignedDownloadUrl, buildDocumentKey } from '@/lib/s3'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { buildingId } = await req.json() as { buildingId: string }
  if (!buildingId) {
    return NextResponse.json({ error: 'buildingId required' }, { status: 400 })
  }

  const building = await prisma.building.findUnique({
    where: { id: buildingId },
    select: {
      address: true,
      cadastralCode: true,
      totalAreaM2: true,
      apartmentCount: true,
      energyClass: true,
    },
  })
  if (!building) {
    return NextResponse.json({ error: 'Building not found' }, { status: 404 })
  }

  const totalAreaM2 = Number(building.totalAreaM2) || 3000
  const apartmentCount = building.apartmentCount || 60

  // Get heating data for savings calc
  const latestReport = await prisma.expenseReport.findFirst({
    where: { buildingId, status: 'PROCESSED' },
    orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    include: { items: { where: { category: 'HEATING' } } },
  })

  const heatingPerM2 = latestReport?.items[0]
    ? Number(latestReport.items[0].amountPerM2)
    : 2.1

  const savings = calculateRenovationSavings({
    currentHeatingPerM2PerMonth: heatingPerM2,
    totalAreaM2,
    currentEnergyClass: building.energyClass,
    apartmentCount,
  })

  const costEstimate = estimateRenovationCost(totalAreaM2)
  const subsidy = calculateAltumSubsidy(
    { totalRenovationCost: costEstimate.mid, buildingAreaM2: totalAreaM2, apartmentCount },
    savings.annualSavings,
  )

  const now = new Date()
  const dateStr = now.toLocaleDateString('ru-RU')
  const meetingDateStr = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('ru-RU')

  const intentData = {
    buildingAddress: building.address,
    cadastralCode: building.cadastralCode,
    totalAreaM2,
    apartmentCount,
    currentEnergyClass: building.energyClass ?? 'неизвестен',
    estimatedCostMin: costEstimate.low,
    estimatedCostMax: costEstimate.high,
    subsidyPercent: Math.round(subsidy.subsidyPercent),
    monthlySavingsPerApt: Math.round(savings.monthlySavingsPerApt),
    date: dateStr,
  }

  const agendaData = {
    buildingAddress: building.address,
    meetingDate: meetingDateStr,
    subsidyPercent: Math.round(subsidy.subsidyPercent),
    monthlySavingsPerApt: Math.round(savings.monthlySavingsPerApt),
    estimatedCostMin: costEstimate.low,
    estimatedCostMax: costEstimate.high,
  }

  const projectId = buildingId
  const [intentRu, intentLv, agendaRu, agendaLv] = await Promise.all([
    generateIntentDocument(intentData, 'ru'),
    generateIntentDocument(intentData, 'lv'),
    generateAgendaDocument(agendaData, 'ru'),
    generateAgendaDocument(agendaData, 'lv'),
  ])

  const keys = {
    intentRu: buildDocumentKey(projectId, 'intent', 'ru'),
    intentLv: buildDocumentKey(projectId, 'intent', 'lv'),
    agendaRu: buildDocumentKey(projectId, 'agenda', 'ru'),
    agendaLv: buildDocumentKey(projectId, 'agenda', 'lv'),
  }

  await Promise.all([
    uploadFile(keys.intentRu, intentRu, 'application/pdf'),
    uploadFile(keys.intentLv, intentLv, 'application/pdf'),
    uploadFile(keys.agendaRu, agendaRu, 'application/pdf'),
    uploadFile(keys.agendaLv, agendaLv, 'application/pdf'),
  ])

  const [urlIntentRu, urlIntentLv, urlAgendaRu, urlAgendaLv] = await Promise.all([
    getPresignedDownloadUrl(keys.intentRu),
    getPresignedDownloadUrl(keys.intentLv),
    getPresignedDownloadUrl(keys.agendaRu),
    getPresignedDownloadUrl(keys.agendaLv),
  ])

  return NextResponse.json({
    documents: {
      intentRu: urlIntentRu,
      intentLv: urlIntentLv,
      agendaRu: urlAgendaRu,
      agendaLv: urlAgendaLv,
    },
  })
}
