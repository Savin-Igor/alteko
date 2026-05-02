import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({
  email: z.string().email(),
  reportId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Неверный формат email' }, { status: 400 })
  }

  const { email, reportId } = parsed.data

  const report = await prisma.expenseReport.findUnique({
    where: { id: reportId },
    select: { id: true, status: true },
  })
  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  // Upsert user by email — no password, no name required at this step
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, fullName: '' },
    update: {},
    select: { id: true },
  })

  // Link report to user (update uploadedBy only if it's a guest upload)
  const existingUploader = await prisma.expenseReport.findUnique({
    where: { id: reportId },
    select: { uploadedBy: true },
  })

  // Only claim if uploaded by same user or still anonymous
  if (!existingUploader?.uploadedBy) {
    await prisma.expenseReport.update({
      where: { id: reportId },
      data: { uploadedBy: user.id },
    })
  }

  return NextResponse.json({ userId: user.id, alreadyKnown: false })
}
