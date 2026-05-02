'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { PageHeader, InfoBanner } from '@/components/ui'

interface Campaign {
  id: string
  title: string
  status: string
  currentYesShare: number
  deadline: string | null
}

type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

function VotingContent() {
  const t = useTranslations('dashboard.voting')
  const tTabs = useTranslations('dashboard.tabs')
  const tStatus = useTranslations('dashboard.voting.campaignStatus')

  const searchParams = useSearchParams()
  const buildingId = searchParams.get('buildingId') ?? ''

  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [creating, setCreating] = useState(false)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!buildingId) return
    // Campaigns would be fetched here in production
  }, [buildingId])

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    setMessage(null)
    try {
      const res = await fetch('/api/voting/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId,
          title: title.trim(),
          deadline: deadline || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: t('campaignCreatedSuccess', { link: `/voting/${data.campaignId}` }) })
        setCampaigns((prev) => [
          ...prev,
          { id: data.campaignId, title, status: 'DRAFT', currentYesShare: 0, deadline },
        ])
        setTitle('')
        setDeadline('')
      } else {
        setMessage({ type: 'error', text: data.error ?? t('errorCreate') })
      }
    } catch {
      setMessage({ type: 'error', text: t('errorConnection') })
    } finally {
      setCreating(false)
    }
  }

  async function handleUploadOwners(e: React.FormEvent) {
    e.preventDefault()
    if (!csvFile || !buildingId) return
    setUploading(true)
    setMessage(null)
    const formData = new FormData()
    formData.append('file', csvFile)
    formData.append('buildingId', buildingId)
    try {
      const res = await fetch('/api/voting/owners-upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: t('uploadedSuccess', { upserted: data.upserted, total: data.total }) })
        setCsvFile(null)
      } else {
        setMessage({ type: 'error', text: data.error ?? t('errorUpload') })
      }
    } catch {
      setMessage({ type: 'error', text: t('errorConnection') })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHeader variant="admin" />

      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 flex gap-1">
          <Link href="/dashboard" className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300 -mb-px transition-colors">
            {tTabs('myBuildings')}
          </Link>
          <Link href="/dashboard/tenders" className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300 -mb-px transition-colors">
            {tTabs('projects')}
          </Link>
          <Link href="/dashboard/voting" className="px-4 py-3 text-sm font-medium text-primary border-b-2 border-primary -mb-px">
            {tTabs('voting')}
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-5">
        <h1 className="text-xl font-semibold text-gray-900">{t('heading')}</h1>

        {message && (
          <InfoBanner variant={message.type === 'success' ? 'success' : 'error'}>
            {message.text}
          </InfoBanner>
        )}

        <div className="card space-y-4">
          <div>
            <h2 className="font-medium text-gray-800">{t('step1Title')}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('step1Hint')}
            </p>
          </div>

          <form onSubmit={handleUploadOwners} className="space-y-3">
            <label className="block">
              <div className={`w-full border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                csvFile ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                />
                {csvFile ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{csvFile.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t('csvSizeLabel', { size: (csvFile.size / 1024).toFixed(0) })}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600">{t('selectCsv')}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('csvFromZG')}</p>
                  </div>
                )}
              </div>
            </label>
            <button
              type="submit"
              disabled={!csvFile || uploading}
              className="btn-secondary"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  {t('uploadingButton')}
                </span>
              ) : t('uploadOwners')}
            </button>
          </form>

          <p className="text-xs text-gray-400">
            {t('extractFrom')}
            <a href="https://www.zemesgramata.lv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Zemesgrāmata
            </a>
            {t('orManualCsv')}
          </p>
        </div>

        <div className="card space-y-4">
          <h2 className="font-medium text-gray-800">{t('step2Title')}</h2>
          <form onSubmit={handleCreateCampaign} className="space-y-3">
            <div>
              <label htmlFor="vote-title" className="text-sm text-gray-600 block mb-1">
                {t('voteTitleLabel')}
              </label>
              <input
                id="vote-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('voteTitlePlaceholder')}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="vote-deadline" className="text-sm text-gray-600 block mb-1">
                {t('deadlineLabel')}
              </label>
              <input
                id="vote-deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input-field"
              />
            </div>
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('creating')}
                </span>
              ) : t('createButton')}
            </button>
          </form>
          <p className="text-xs text-gray-500">
            {t('afterCreate')}
          </p>
        </div>

        {campaigns.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-medium text-gray-800">{t('campaignsHeading')}</h2>
            {campaigns.map((c) => {
              let statusLabel = c.status
              try {
                statusLabel = tStatus(c.status as CampaignStatus)
              } catch { /* keep raw */ }
              return (
                <div key={c.id} className="card flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {statusLabel}
                      {' · '}
                      {t('yesShare', { percent: Math.round(c.currentYesShare * 100) })}
                    </p>
                  </div>
                  <Link
                    href={`/voting/${c.id}`}
                    className="text-sm text-primary font-medium hover:underline flex-shrink-0"
                  >
                    {t('openCampaign')}
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default function DashboardVotingPage() {
  return (
    <Suspense>
      <VotingContent />
    </Suspense>
  )
}
