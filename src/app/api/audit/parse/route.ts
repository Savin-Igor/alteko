import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parsePdfExpense } from '@/lib/llm'
import { getPresignedDownloadUrl } from '@/lib/s3'
import { auth } from '@/auth'
import { IS_STUB, STUB_PARSED_BILL } from '@/lib/stubs'
import { verifyParseToken } from '@/lib/auth/parse-token'
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

  const body = await req.json() as { reportId: string; parseToken?: string }
  const { reportId, parseToken } = body
  if (!reportId) return NextResponse.json({ error: 'reportId required' }, { status: 400 })

  const report = await prisma.expenseReport.findUnique({
    where: { id: reportId },
    include: { building: true },
  })
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  // Authorization: authenticated owner OR valid short-lived parse token (for anonymous uploads)
  const isOwner = !!session?.user?.id && report.uploadedBy === session.user.id
  const hasValidToken = !!parseToken && verifyParseToken(parseToken, reportId)
  if (!isOwner && !hasValidToken) {
    return NextResponse.json({ error: 'Forbidden — provide parseToken from upload response' }, { status: 403 })
  }

  await prisma.expenseReport.update({ where: { id: reportId }, data: { status: 'PROCESSING' } })

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any

    if (IS_STUB) {
      parsed = STUB_PARSED_BILL
    } else {
      const signedUrl = await getPresignedDownloadUrl(report.rawFileKey)
      const pdfRes = await fetch(signedUrl)
      if (!pdfRes.ok) throw new Error('Failed to fetch PDF from storage')
      const pdfBase64 = Buffer.from(await pdfRes.arrayBuffer()).toString('base64')
      parsed = await parsePdfExpense(pdfBase64, report.building.address)
    }

    await prisma.$transaction([
      prisma.expenseItem.deleteMany({ where: { reportId } }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...parsed.items.map((item: any) =>
        prisma.expenseItem.create({
          data: {
            reportId,
            category:     normalizeCategory(item.category),
            rawLabel:     item.rawLabel,
            amountTotal:  item.amountTotal,
            amountPerM2:  item.amountPerM2,
            amountPerApt: item.amountPerApt,
            unit:         item.unit ?? null,
          },
        }),
      ),
      prisma.expenseReport.update({
        where: { id: reportId },
        data: {
          status:      'PROCESSED',
          processedAt: new Date(),
          parsedData:  parsed as object,
        },
      }),
    ])

    return NextResponse.json({ reportId, status: 'PROCESSED', itemCount: parsed.items.length })
  } catch (err) {
    await prisma.expenseReport.update({ where: { id: reportId }, data: { status: 'FAILED' } })
    console.error('PDF parse failed:', err)
    return NextResponse.json(
      { error: 'Не удалось прочитать счёт. Попробуйте другой файл.' },
      { status: 422 },
    )
  }
}
