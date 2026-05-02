'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import { filterSettlements, type Settlement } from '@/lib/latvia-settlements'

interface Suggestion {
  id: string
  address: string
  lat: number
  lon: number
}

interface Props {
  onSelect: (suggestion: Suggestion) => void
}

export function AddressSearch({ onSelect }: Props) {
  const locale = useLocale()
  const isRu = locale === 'ru'

  // City field state
  const [cityInput, setCityInput] = useState('')
  const [cityMatches, setCityMatches] = useState<Settlement[]>([])
  const [cityOpen, setCityOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState<Settlement | null>(null)

  // Street field state
  const [streetQuery, setStreetQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [streetOpen, setStreetOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const streetRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // City filtering
  useEffect(() => {
    const matches = filterSettlements(cityInput)
    setCityMatches(matches)
    setCityOpen(matches.length > 0 && cityInput.length > 0 && !selectedCity)
  }, [cityInput, selectedCity])

  // Street search
  const search = useCallback(async (q: string, city: string) => {
    if (q.trim().length < 3) {
      setSuggestions([])
      setStreetOpen(false)
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams({ q, city })
      const res = await fetch(`/api/address/search?${params}`)
      const data = await res.json()
      setSuggestions(Array.isArray(data) ? data : [])
      setStreetOpen(true)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedCity) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(streetQuery, selectedCity.lv), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [streetQuery, selectedCity, search])

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setCityOpen(false)
        setStreetOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function selectCity(s: Settlement) {
    setSelectedCity(s)
    setCityInput(isRu ? s.ru : s.lv)
    setCityOpen(false)
    setStreetQuery('')
    setSuggestions([])
    streetRef.current?.focus()
  }

  function handleCityInputChange(val: string) {
    setCityInput(val)
    setSelectedCity(null)
    setStreetQuery('')
    setSuggestions([])
  }

  function handleStreetSelect(s: Suggestion) {
    setStreetQuery(s.address)
    setStreetOpen(false)
    onSelect(s)
  }

  const cityPlaceholder = isRu ? 'Город / посёлок' : 'Pilsēta / ciems'
  const streetPlaceholder = isRu
    ? selectedCity ? 'Улица и номер дома' : 'Сначала выберите город'
    : selectedCity ? 'Iela un mājas numurs' : 'Vispirms izvēlieties pilsētu'

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex gap-2">

        {/* City autocomplete */}
        <div className="relative w-40 flex-shrink-0">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => handleCityInputChange(e.target.value)}
            onFocus={() => cityInput && !selectedCity && setCityOpen(cityMatches.length > 0)}
            placeholder={cityPlaceholder}
            className="input-field w-full"
            autoComplete="off"
            aria-label={isRu ? 'Город' : 'Pilsēta'}
          />
          {cityOpen && cityMatches.length > 0 && (
            <ul className="absolute z-50 w-56 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {cityMatches.map((s) => (
                <li key={s.lv}>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); selectCity(s) }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0 min-h-[44px] flex flex-col justify-center"
                  >
                    <span className="font-medium">{isRu ? s.ru : s.lv}</span>
                    {isRu && <span className="text-xs text-gray-400">{s.lv}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Street + house number */}
        <div className="relative flex-1">
          <input
            ref={streetRef}
            type="text"
            value={streetQuery}
            onChange={(e) => setStreetQuery(e.target.value)}
            disabled={!selectedCity}
            placeholder={streetPlaceholder}
            className="input-field w-full pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
            autoComplete="off"
            aria-label={isRu ? 'Улица и номер дома' : 'Iela un mājas numurs'}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Street suggestions */}
      {streetOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => handleStreetSelect(s)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0 min-h-[48px] flex items-center"
              >
                {s.address}
              </button>
            </li>
          ))}
        </ul>
      )}

      {streetOpen && !loading && suggestions.length === 0 && streetQuery.trim().length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-500">
          {isRu ? 'Адрес не найден. Проверьте улицу и номер.' : 'Adrese nav atrasta. Pārbaudiet ielas nosaukumu.'}
        </div>
      )}
    </div>
  )
}
