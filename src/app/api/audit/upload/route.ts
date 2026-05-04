import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadFile, buildReportKey } from '@/lib/s3'
import { auth } from '@/auth'
import { IS_STUB } from '@/lib/stubs'
import { issueParseToken } from '@/lib/auth/parse-token'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(req: NextRequest) {
  const session = await auth()
  // uploadedBy is nullable — anonymous uploads allowed; email gate links later
  const userId = session?.user?.id ?? null

  const formData = await req.formData()
  const file       = formData.get('file') as File | null
  const buildingId = formData.get('buildingId') as string | null
  const periodYear  = parseInt(formData.get('periodYear') as string)
  const periodMonth = parseInt(formData.get('periodMonth') as string)

  if (!file || !buildingId || isNaN(periodYear) || isNaN(periodMonth)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json(
      { error: 'Нужен PDF-файл. Получить его можно в личном кабинете на сайте управляющей компании.' },
      { status: 422 },
    )
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Файл слишком большой. Максимальный размер — 10 МБ.' }, { status: 422 })
  }

  const building = await prisma.building.findUnique({ where: { id: buildingId } })
  if (!building) return NextResponse.json({ error: 'Building not found' }, { status: 404 })

  const existing = await prisma.expenseReport.findUnique({
    where: { buildingId_periodYear_periodMonth: { buildingId, periodYear, periodMonth } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Отчёт за этот период уже загружен.' }, { status: 409 })
  }

  let rawFileKey: string
  if (IS_STUB) {
    // Skip S3 — parse route will use stub data regardless
    rawFileKey = `stub/${buildingId}/${periodYear}-${periodMonth}.pdf`
  } else {
    const buffer = Buffer.from(await file.arrayBuffer())
    rawFileKey = buildReportKey(buildingId, periodYear, periodMonth)
    await uploadFile(rawFileKey, buffer, 'application/pdf')
  }

  const report = await prisma.expenseReport.create({
    data: { buildingId, periodYear, periodMonth, rawFileKey, status: 'PENDING', uploadedBy: userId ?? undefined },
  })

  const parseToken = issueParseToken(report.id)
  return NextResponse.json({ reportId: report.id, parseToken })
}
