import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@/env'

function getClient() {
  return new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  })
}

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<void> {
  const client = getClient()
  await client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const client = getClient()
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
    { expiresIn },
  )
}

export async function deleteFile(key: string): Promise<void> {
  const client = getClient()
  await client.send(
    new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
  )
}

export function buildReportKey(buildingId: string, year: number, month: number): string {
  return `reports/${buildingId}/${year}-${String(month).padStart(2, '0')}.pdf`
}

export function buildDocumentKey(projectId: string, docType: string, lang: string): string {
  return `documents/${projectId}/${docType}-${lang}.pdf`
}

export function buildProtocolKey(campaignId: string): string {
  return `protocols/${campaignId}/protocol.pdf`
}

export function buildReadinessReportKey(orderId: string, lang: string): string {
  return `readiness-reports/${orderId}/report-${lang.toLowerCase()}.pdf`
}
