'use client'

import { useState } from 'react'
import Link from 'next/link'

const SPECIALIZATIONS = [
  'Утепление фасада',
  'Замена окон',
  'Кровельные работы',
  'Замена системы отопления',
  'Вентиляция',
  'Подвал и фундамент',
  'Комплексная реновация',
]

const DISTRICTS = [
  'Рига', 'Юрмала', 'Елгава', 'Даугавпилс', 'Резекне',
  'Лиепая', 'Вентспилс', 'Валмиера', 'Екабпилс',
]

export default function ContractorRegisterPage() {
  const [companyName, setCompanyName] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [specs, setSpecs] = useState<string[]>([])
  const [coverage, setCoverage] = useState<string[]>([])
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ id: string; verified: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)

  function toggleSpec(s: string) {
    setSpecs((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }
  function toggleCoverage(d: string) {
    setCoverage((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/contractors/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          registrationNumber: regNumber.trim(),
          specializations: specs,
          geographicCoverage: coverage,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ id: data.contractorId, verified: data.luroftVerified })
      } else {
        setError(data.error ?? 'Ошибка регистрации')
      }
    } catch {
      setError('Ошибка соединения. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <Link href="/" className="text-xl font-bold text-gray-900">ALTEKO</Link>
        </header>
        <main className="flex-1 px-4 py-12 max-w-md mx-auto w-full text-center space-y-4">
          <div className="text-5xl">✓</div>
          <h1 className="text-xl font-semibold">Заявка отправлена</h1>
          <p className="text-sm text-gray-500">
            {result.verified
              ? 'Компания верифицирована в Lursoft. Ваша заявка на рассмотрении у администратора ALTEKO.'
              : 'Ваша заявка на рассмотрении. Мы свяжемся с вами в течение 2 рабочих дней.'}
          </p>
          <p className="text-xs text-gray-400">ID заявки: {result.id}</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold text-gray-900">ALTEKO</Link>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Регистрация подрядчика</h1>
        <p className="text-sm text-gray-500 mb-6">
          Получайте тендеры от домов с ≥50% голосов — без холодных продаж
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Название компании</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="SIA Būvnieks"
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Регистрационный номер (Lursoft)
            </label>
            <input
              type="text"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="40001234567"
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Специализация</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpec(s)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    specs.includes(s)
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Географическое покрытие
            </label>
            <div className="flex flex-wrap gap-2">
              {DISTRICTS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleCoverage(d)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    coverage.includes(d)
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-gray-600">
              Согласен с условиями комиссионного соглашения ALTEKO (1,5% от стоимости контракта)
            </span>
          </label>

          {error && (
            <p className="text-sm text-danger bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !agreed || specs.length === 0 || coverage.length === 0}
            className="btn-primary"
          >
            {loading ? 'Проверяем...' : 'Подать заявку'}
          </button>
        </form>
      </main>
    </div>
  )
}
