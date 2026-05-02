'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Campaign {
  id: string
  title: string
  status: string
  currentYesShare: number
  deadline: string | null
}

function VotingContent() {
  const searchParams = useSearchParams()
  const buildingId = searchParams.get('buildingId') ?? ''

  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [creating, setCreating] = useState(false)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load existing campaigns
  useEffect(() => {
    if (!buildingId) return
    // In a real app, fetch campaigns for this building
    // For now, show empty state
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
        setMessage({ type: 'success', text: `Кампания создана. ID: ${data.campaignId}` })
        setCampaigns((prev) => [...prev, { id: data.campaignId, title, status: 'DRAFT', currentYesShare: 0, deadline }])
        setTitle('')
      } else {
        setMessage({ type: 'error', text: data.error ?? 'Ошибка' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Ошибка соединения' })
    } finally {
      setCreating(false)
    }
  }

  async function handleUploadOwners(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !buildingId) return
    setUploading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('buildingId', buildingId)

    try {
      const res = await fetch('/api/voting/owners-upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: `Загружено ${data.upserted} из ${data.total} собственников` })
      } else {
        setMessage({ type: 'error', text: data.error ?? 'Ошибка загрузки' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Ошибка соединения' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900">ALTEKO</Link>
        <Link href="/dashboard" className="text-sm text-gray-500">← Назад</Link>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-6">
        <h1 className="text-xl font-semibold text-gray-900">Голосование собственников</h1>

        {message && (
          <p className={`text-sm px-4 py-3 rounded-lg border ${
            message.type === 'success'
              ? 'text-success bg-green-50 border-green-200'
              : 'text-danger bg-red-50 border-red-100'
          }`}>
            {message.text}
          </p>
        )}

        {/* Step 1: Upload owners */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-medium text-gray-800">Шаг 1. Список собственников</h2>
          <p className="text-xs text-gray-500">
            Формат CSV: квартира;площадь_м2;доля_%;zemesgramata_ref (опционально)
          </p>
          <form onSubmit={handleUploadOwners} className="space-y-3">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-primary"
            />
            <button type="submit" disabled={!file || uploading} className="btn-primary">
              {uploading ? 'Загружаем...' : 'Загрузить список собственников'}
            </button>
          </form>
          <p className="text-xs text-gray-400">
            Как получить список из Zemesgrāmata →{' '}
            <a href="https://www.zemesgramata.lv" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              zemesgramata.lv
            </a>
          </p>
        </div>

        {/* Step 2: Create campaign */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-medium text-gray-800">Шаг 2. Создать кампанию голосования</h2>
          <form onSubmit={handleCreateCampaign} className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Вопрос голосования</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Реновация здания 2025"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Срок голосования (необязательно)</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input-field"
              />
            </div>
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? 'Создаём...' : 'Открыть голосование'}
            </button>
          </form>
        </div>

        {/* Existing campaigns */}
        {campaigns.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-medium text-gray-800">Активные кампании</h2>
            {campaigns.map((c) => (
              <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <p className="font-medium text-sm">{c.title}</p>
                <p className="text-xs text-gray-400">Статус: {c.status}</p>
                <Link
                  href={`/voting/${c.id}`}
                  className="text-sm text-primary underline"
                >
                  Открыть страницу голосования →
                </Link>
              </div>
            ))}
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
