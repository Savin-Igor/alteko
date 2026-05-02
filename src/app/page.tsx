'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AddressAutocomplete } from '@/components/AddressAutocomplete'

export default function HomePage() {
  const router = useRouter()
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAddressSelect(suggestion: { id: string; address: string; lat: number; lon: number }) {
    setResolving(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        lat: String(suggestion.lat),
        lon: String(suggestion.lon),
        address: suggestion.address,
      })
      const res = await fetch(`/api/address/resolve?${params}`)
      const building = await res.json()

      if (building.found && building.cadastralCode) {
        router.push(`/building/${building.cadastralCode}`)
      } else if (building.cadastralCode) {
        router.push(`/building/${building.cadastralCode}?address=${encodeURIComponent(suggestion.address)}`)
      } else {
        setError('Дом не найден в базе данных. Попробуйте другой адрес.')
      }
    } catch {
      setError('Ошибка соединения. Проверьте интернет и попробуйте снова.')
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <span className="text-xl font-bold text-gray-900">ALTEKO</span>
        <div className="flex gap-2 text-sm">
          <button className="px-3 py-1 rounded font-medium text-primary">LV</button>
          <button className="px-3 py-1 rounded font-medium text-gray-400">RU</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Узнайте, за что ваш дом<br />платит лишнего
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Загрузите счёт — за 30 секунд покажем, где переплата
          </p>

          <div className="space-y-4">
            <AddressAutocomplete onSelect={handleAddressSelect} />

            {error && (
              <p className="text-sm text-danger bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              disabled={resolving}
              className="btn-primary"
              onClick={() => {}}
            >
              {resolving ? 'Ищем дом...' : 'Найти дом'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Бесплатно · Без регистрации · 30 секунд
          </p>
          <p className="text-center text-xs text-gray-400 mt-1">
            624 дома уже проверили свои расходы
          </p>
        </div>
      </main>
    </div>
  )
}
