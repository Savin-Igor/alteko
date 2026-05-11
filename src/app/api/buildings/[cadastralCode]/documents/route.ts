/**
 * Building documents — board-side checklist (#124).
 *
 * Lets board members upload one of the 8 BuildingDocumentType records
 * per building (uniqueness enforced by Prisma) and read back the
 * current state with presigned download URLs. Files land in S3 via
 * the shared uploadFile() helper.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
  uploadFile,
  deleteFile,
  getPresignedDownloadUrl,
} from '@/lib/s3'
import { checkRateLimit, getClientIp, rateLimitExceeded } from '@/lib/rate-limit'
import { BuildingDocumentType } from '@prisma/client'

export const runtime = 'nodejs'

const BOARD_ROLES = new Set(['BOARD_MEMBER', 'ASSOCIATION_ADMIN', 'PLATFORM_ADMIN'])
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
])
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB — matches host nginx client_max_body_size

interface RouteParams {
  params: Promise<{ cadastralCode: string }>
}

function isDocumentType(value: string): value is BuildingDocumentType {
  return (Object.values(BuildingDocumentType) as string[]).includes(value)
}

function buildKey(buildingId: string, docType: BuildingDocumentType, ext: string) {
  return `building-documents/${buildingId}/${docType}.${ext}`
}

function extFromMime(mime: string): string {
  if (mime === 'application/pdf') return 'pdf'
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  return 'bin'
}

async function authorizeBoard() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (!user || !BOARD_ROLES.has(user.role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { userId: session.user.id }
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { allowed } = checkRateLimit(getClientIp(_req))
  if (!allowed) return rateLimitExceeded()

  const auth = await authorizeBoard()
  if ('error' in auth) return auth.error

  const { cadastralCode } = await params
  const building = await prisma.building.findUnique({
    where: { cadastralCode },
    select: { id: true },
  })
  if (!building) {
    return NextResponse.json({ error: 'Building not found' }, { status: 404 })
  }

  const documents = await prisma.buildingDocument.findMany({
    where: { buildingId: building.id },
    orderBy: { uploadedAt: 'desc' },
  })

  // Generate short-lived presigned URLs (1h) for already-uploaded files.
  const items = await Promise.all(
    documents.map(async (doc) => ({
      documentType: doc.documentType,
      uploadedAt: doc.uploadedAt,
      expiresAt: doc.expiresAt,
      downloadUrl: doc.fileKey
        ? await getPresignedDownloadUrl(doc.fileKey).catch(() => null)
        : null,
    })),
  )

  return NextResponse.json({ items })
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const authResult = await authorizeBoard()
  if ('error' in authResult) return authResult.error

  const { cadastralCode } = await params
  const building = await prisma.building.findUnique({
    where: { cadastralCode },
    select: { id: true },
  })
  if (!building) {
    return NextResponse.json({ error: 'Building not found' }, { status: 404 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const rawType = formData.get('documentType')
  const rawExpiry = formData.get('expiresAt')

  if (!file || typeof rawType !== 'string') {
    return NextResponse.json(
      { error: 'Missing required fields: file, documentType' },
      { status: 400 },
    )
  }
  if (!isDocumentType(rawType)) {
    return NextResponse.json({ error: 'Unknown documentType' }, { status: 400 })
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type — accepted: PDF, JPG, PNG' },
      { status: 415 },
    )
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File size out of range (1 byte–${MAX_FILE_SIZE} bytes)` },
      { status: 413 },
    )
  }

  const ext = extFromMime(file.type)
  const key = buildKey(building.id, rawType, ext)
  const bytes = new Uint8Array(await file.arrayBuffer())

  // Replacing an existing document — delete the old S3 object first to
  // avoid orphans (the unique [buildingId, documentType] constraint
  // means only one row exists per type, but the old fileKey may differ
  // when the extension changes).
  const existing = await prisma.buildingDocument.findUnique({
    where: {
      buildingId_documentType: { buildingId: building.id, documentType: rawType },
    },
  })
  if (existing?.fileKey && existing.fileKey !== key) {
    await deleteFile(existing.fileKey).catch(() => null)
  }

  await uploadFile(key, bytes, file.type)

  const expiresAt =
    typeof rawExpiry === 'string' && rawExpiry.length > 0
      ? new Date(rawExpiry)
      : null
  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    return NextResponse.json({ error: 'Invalid expiresAt' }, { status: 400 })
  }

  const doc = await prisma.buildingDocument.upsert({
    where: {
      buildingId_documentType: { buildingId: building.id, documentType: rawType },
    },
    create: {
      buildingId: building.id,
      documentType: rawType,
      fileKey: key,
      uploadedBy: authResult.userId,
      expiresAt,
    },
    update: {
      fileKey: key,
      uploadedBy: authResult.userId,
      uploadedAt: new Date(),
      expiresAt,
    },
  })

  return NextResponse.json({
    documentType: doc.documentType,
    uploadedAt: doc.uploadedAt,
    expiresAt: doc.expiresAt,
  })
}
