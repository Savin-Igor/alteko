/**
 * Issue #109 — GDPR raw PDF cleanup endpoint.
 *
 * Deletes raw PDF files from S3 for reports that were successfully processed
 * but whose raw file was not deleted at parse time (e.g. due to a transient
 * S3 error). Called by a periodic job or admin action.
 *
 * Only PLATFORM_ADMIN can trigger this endpoint.
 */
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/s3'

export const runtime = 'nodejs'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (user?.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Find processed reports whose raw file has not been deleted yet
  const orphaned = await prisma.expenseReport.findMany({
    where: {
      status: 'PROCESSED',
      rawFileDeletedAt: null,
      rawFileKey: { not: '' },
    },
    select: { id: true, rawFileKey: true },
    take: 100,
  })

  let deleted = 0
  let failed = 0

  for (const report of orphaned) {
    try {
      await deleteFile(report.rawFileKey)
      await prisma.expenseReport.update({
        where: { id: report.id },
        data: { rawFileDeletedAt: new Date() },
      })
      deleted++
    } catch {
      failed++
    }
  }

  return NextResponse.json({ scanned: orphaned.length, deleted, failed })
}
