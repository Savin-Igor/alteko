'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1

function UploadForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const buildingId = searchParams.get('building') ?? ''
  const address = searchParams.get('address') ?? ''

  const [file, setFile] = useState<File | null>(null)
  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(CURRENT_MONTH)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    if (f.type !== 'application/pdf') {
      setError('Нужен PDF-файл. Получить его можно в личном кабинете на сайте управляющей компании.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Файл слишком большой. Максимальный размер — 10 МБ.')
      return
    }
    setFile(f)
    setError(null)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

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
        setError(data.error ?? 'Ошибка загрузки. Попробуйте снова.')
        return
      }
      router.push(`/audit/preview?reportId=${data.reportId}`)
    } catch {
      setError('Ошибка соединения. Проверьте интернет и попробуйте снова.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold text-gray-900">ALTEKO</Link>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <Link href={`/building/${buildingId}`} className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700">
          ← {address}
        </Link>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Загрузите счёт-фактуру
        </h1>
        <p className="text-sm text-gray-500 mb-6">от управляющей компании</p>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-4xl mb-3">📄</div>
            {file ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} КБ</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">Перетащите PDF или нажмите для выбора</p>
                <p className="text-xs text-gray-400 mt-1">Поддерживается: PDF до 10 МБ</p>
                <p className="text-xs text-gray-400">Счета Namsaimnieks, RNP, Latio и др.</p>
              </div>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">Год счёта</label>
              <select
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
              <label className="text-xs text-gray-500 block mb-1">Месяц</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="input-field text-sm"
              >
                {['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'].map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-danger bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            disabled={!file || uploading}
            onClick={handleUpload}
            className="btn-primary"
          >
            {uploading ? 'Загружаем...' : 'Анализировать счёт'}
          </button>

          <p className="text-center text-xs text-gray-400">
            🔒 Файл не передаётся третьим лицам
          </p>
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
