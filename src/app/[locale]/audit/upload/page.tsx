'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { FileDropzone, InfoBanner, PageHeader } from '@/components/ui'

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1

function UploadForm() {
  const t = useTranslations('audit.upload')
  const tMonths = useTranslations('audit')
  const months = tMonths.raw('months') as string[]

  const router = useRouter()
  const searchParams = useSearchParams()
  const buildingId = searchParams.get('building') ?? ''
  const cadastralCode = searchParams.get('cadastralCode') ?? ''
  const address = searchParams.get('address') ?? ''

  const [file, setFile] = useState<File | null>(null)
  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(CURRENT_MONTH)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload() {
    if (!file || !buildingId) return
    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('buildingId', buildingId)
    formData.append('periodYear', String(year))
    formData.append('periodMonth', String(month))

    try {
      const res = await fetch('/api/audit/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? t('errorUpload'))
        return
      }
      router.push(`/audit/preview?reportId=${data.reportId}&building=${buildingId}&cadastralCode=${cadastralCode}`)
    } catch {
      setError(t('errorConnection'))
    } finally {
      setUploading(false)
    }
  }

  const backHref = cadastralCode ? `/building/${cadastralCode}` : '/'

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader variant="breadcrumb" backHref={backHref} backLabel={address || t('back')} />

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        {address && (
          <p className="text-sm font-medium text-gray-700 mb-4">{address}</p>
        )}

        <h1 className="text-xl font-semibold text-gray-900 mb-1">{t('title')}</h1>
        <p className="text-sm text-gray-500 mb-6">{t('subtitle')}</p>

        <div className="space-y-4">
          <FileDropzone
            onFile={setFile}
            file={file}
            accept="application/pdf"
            maxSizeMB={10}
            hint={t('fileHint')}
            onError={setError}
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1" htmlFor="year-select">{t('yearLabel')}</label>
              <select
                id="year-select"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="input-field text-sm"
              >
                {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1" htmlFor="month-select">{t('monthLabel')}</label>
              <select
                id="month-select"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="input-field text-sm"
              >
                {months.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <InfoBanner variant="info">
            {t('privacyInfo')}
          </InfoBanner>

          {error && (
            <InfoBanner variant="error">{error}</InfoBanner>
          )}

          <button
            disabled={!file || uploading}
            onClick={handleUpload}
            className="btn-primary"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('uploadingButton')}
              </span>
            ) : t('submitButton')}
          </button>
        </div>
      </main>
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense>
      <UploadForm />
    </Suspense>
  )
}
