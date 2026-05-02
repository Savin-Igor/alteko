import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parsePdfExpense } from '@/lib/llm'
import { getPresignedDownloadUrl } from '@/lib/s3'
import { auth } from '@/auth'
import type { ExpenseCategory } from '@prisma/client'

export const runtime = 'nodejs'
export const maxDuration = 60

const VALID_CATEGORIES = new Set<string>([
  'HEATING', 'COLD_WATER', 'HOT_WATER', 'WASTEWATER',
  'WASTE', 'CLEANING', 'REPAIR_FUND', 'ADMINISTRATION', 'ELEVATOR', 'OTHER',
])

function normalizeCategory(cat: string): ExpenseCategory {
  const upper = cat.toUpperCase()
  return (VALID_CATEGORIES.has(upper) ? upper : 'OTHER') as ExpenseCategory
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { reportId } = await req.json() as { reportId: string }
  if (!reportId) {
    return NextResponse.json({ error: 'reportId required' }, { status: 400 })
  }

  const report = await prisma.expenseReport.findUnique({
    where: { id: reportId },
    include: { building: true },
  })

  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  if (report.uploadedBy !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.expenseReport.update({
    where: { id: reportId },
    data: { status: 'PROCESSING' },
  })

  try {
    // Fetch PDF from S3 as base64
    const signedUrl = await getPresignedDownloadUrl(report.rawFileKey)
    const pdfRes = await fetch(signedUrl)
    if (!pdfRes.ok) throw new Error('Failed to fetch PDF from storage')
    const pdfBuffer = await pdfRes.arrayBuffer()
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')

    const parsed = await parsePdfExpense(pdfBase64, report.building.address)

    // Persist items
    await prisma.$transaction([
      prisma.expenseItem.deleteMany({ where: { reportId } }),
      ...parsed.items.map((item) =>
        prisma.expenseItem.create({
          data: {
            reportId,
            category: normalizeCategory(item.category),
            rawLabel: item.rawLabel,
            amountTotal: item.amountTotal,
            amountPerM2: item.amountPerM2,
            amountPerApt: item.amountPerApt,
            unit: item.unit,
          },
        }),
      ),
      prisma.expenseReport.update({
        where: { id: reportId },
        data: {
          status: 'PROCESSED',
          parsedData: parsed as object,
          processedAt: new Date(),
          periodYear: parsed.periodYear,
          periodMonth: parsed.periodMonth,
        },
      }),
    ])

    return NextResponse.json({
      reportId,
      status: 'PROCESSED',
      confidence: parsed.parseConfidence,
      itemCount: parsed.items.length,
    })
  } catch (err) {
    await prisma.expenseReport.update({
      where: { id: reportId },
      data: { status: 'FAILED' },
    })
    console.error('PDF parse failed:', err)
    return NextResponse.json(
      { error: 'Не удалось прочитать счёт. Возможно, это скан низкого качества. Попробуйте другой файл.' },
      { status: 422 },
    )
  }
}
