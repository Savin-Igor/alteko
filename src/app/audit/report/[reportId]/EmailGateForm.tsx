'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  reportId: string
}

export function EmailGateForm({ reportId }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/audit/email-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), reportId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Ошибка. Попробуйте снова.')
        return
      }
      router.push(`/audit/report/${reportId}?unlocked=1`)
    } catch {
      setError('Ошибка соединения. Проверьте интернет и попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm text-gray-600">
        Куда отправить полный отчёт?
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ваш@email.com"
        required
        className="input-field"
        autoComplete="email"
      />
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Открываем отчёт...' : 'Получить отчёт'}
      </button>
      <p className="text-xs text-gray-400 text-center">
        Отчёт придёт за 10–20 секунд. Следующие счета — автоматически.
      </p>
    </form>
  )
}
