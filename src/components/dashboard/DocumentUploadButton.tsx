'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface Props {
  cadastralCode: string
  documentType: string
  hasFile: boolean
}

const ACCEPT = 'application/pdf,image/jpeg,image/png'
const MAX_BYTES = 25 * 1024 * 1024

/**
 * Inline upload button for one document slot. Opens a small popover
 * with file picker + optional expiry date, posts multipart form to
 * /api/buildings/[cadastralCode]/documents, and triggers a router
 * refresh so the parent server component re-fetches.
 */
export function DocumentUploadButton({
  cadastralCode,
  documentType,
  hasFile,
}: Props) {
  const t = useTranslations('dashboard.valdes.documents')
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = new FormData(e.currentTarget)
    const file = form.get('file')
    if (!(file instanceof File) || file.size === 0) {
      setError(t('errorNoFile'))
      return
    }
    if (file.size > MAX_BYTES) {
      setError(t('errorTooLarge'))
      return
    }
    form.append('documentType', documentType)

    setIsUploading(true)
    try {
      const res = await fetch(
        `/api/buildings/${encodeURIComponent(cadastralCode)}/documents`,
        { method: 'POST', body: form },
      )
      if (!res.ok) {
        const payload = await res.json().catch(() => ({ error: 'Upload failed' }))
        setError(payload.error ?? t('errorGeneric'))
        return
      }
      setOpen(false)
      startTransition(() => router.refresh())
    } catch {
      setError(t('errorGeneric'))
    } finally {
      setIsUploading(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-primary hover:underline"
      >
        {hasFile ? t('replace') : t('upload')}
      </button>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2"
    >
      <input
        type="file"
        name="file"
        accept={ACCEPT}
        required
        className="text-xs"
      />
      <label className="text-xs text-gray-600 flex items-center gap-2">
        <span>{t('expiryLabel')}</span>
        <input
          type="date"
          name="expiresAt"
          className="border border-gray-200 rounded px-2 py-1 text-xs"
        />
      </label>
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isUploading || isPending}
          className="text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-md disabled:opacity-50"
        >
          {isUploading ? t('uploading') : t('submit')}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setError(null)
          }}
          className="text-xs text-gray-500 hover:text-gray-800"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  )
}
