'use client'

import { useState } from 'react'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { InfoBanner } from '@/components/ui'
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

function TagButton({
  label,
  active,
  onToggle,
}: {
  label: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-3 py-2 rounded-full text-sm border transition-colors min-h-[40px] ${
        active
          ? 'bg-primary text-white border-primary'
          : 'border-gray-300 text-gray-600 hover:border-gray-400'
      }`}
    >
      {label}
    </button>
  )
}

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
    setSpecs((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s])
  }
  function toggleCoverage(d: string) {
    setCoverage((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed || specs.length === 0 || coverage.length === 0) return
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
      if (res.ok) setResult({ id: data.contractorId, verified: data.luroftVerified })
      else setError(data.error ?? 'Ошибка регистрации')
    } catch {
      setError('Ошибка соединения. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 px-4 py-16 max-w-md mx-auto w-full text-center space-y-4">
          <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M5 14l6 6L23 8" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Заявка отправлена</h1>
          <p className="text-gray-500 leading-relaxed">
            {result.verified
              ? 'Компания верифицирована в Lursoft. Заявка на рассмотрении у администратора ALTEKO — ответ в течение 2 рабочих дней.'
              : 'Заявка принята. Мы свяжемся с вами в течение 2 рабочих дней для проверки данных.'}
          </p>
          <p className="text-xs text-gray-400">ID заявки: {result.id}</p>
          <Link href="/" className="btn-secondary inline-block w-auto px-8 mt-2">
            На главную
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Value prop */}
      <section className="px-4 py-8 bg-primary-light border-b border-blue-100">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Получайте тендеры от готовых домов
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Дома с ≥50% голосов собственников ищут подрядчика.
            Без холодных звонков — только входящие запросы по вашей специализации.
          </p>
          <div className="flex gap-4 mt-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <span className="status-dot-success" />
              Верификация через Lursoft
            </span>
            <span className="flex items-center gap-1">
              <span className="status-dot-success" />
              Комиссия 1,5% с контракта
            </span>
            <span className="flex items-center gap-1">
              <span className="status-dot-success" />
              Только проверенные клиенты
            </span>
          </div>
        </div>
      </section>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company name */}
          <div>
            <label htmlFor="company-name" className="text-sm font-medium text-gray-700 block mb-1">
              Название компании
            </label>
            <input
              id="company-name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="SIA Būvnieks"
              required
              className="input-field"
            />
          </div>

          {/* Reg number */}
          <div>
            <label htmlFor="reg-number" className="text-sm font-medium text-gray-700 block mb-1">
              Регистрационный номер
            </label>
            <input
              id="reg-number"
              type="text"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="40001234567"
              required
              className="input-field"
            />
            <p className="text-xs text-gray-400 mt-1">
              Проверяется через{' '}
              <a href="https://www.lursoft.lv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Lursoft
              </a>
            </p>
          </div>

          {/* Specializations */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Специализация{specs.length > 0 && <span className="text-primary ml-1">({specs.length})</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map((s) => (
                <TagButton key={s} label={s} active={specs.includes(s)} onToggle={() => toggleSpec(s)} />
              ))}
            </div>
            {specs.length === 0 && (
              <p className="text-xs text-gray-400 mt-2">Выберите хотя бы одну специализацию</p>
            )}
          </div>

          {/* Coverage */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Географическое покрытие{coverage.length > 0 && <span className="text-primary ml-1">({coverage.length})</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {DISTRICTS.map((d) => (
                <TagButton key={d} label={d} active={coverage.includes(d)} onToggle={() => toggleCoverage(d)} />
              ))}
            </div>
          </div>

          {/* Agreement */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 flex-shrink-0"
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              Согласен с условиями комиссионного соглашения ALTEKO —
              1,5% от стоимости подписанного договора с клиентом
            </span>
          </label>

          {error && <InfoBanner variant="error">{error}</InfoBanner>}

          <button
            type="submit"
            disabled={loading || !agreed || specs.length === 0 || coverage.length === 0}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Проверяем в Lursoft...
              </span>
            ) : 'Подать заявку'}
          </button>
        </form>
      </main>
    </div>
  )
}
