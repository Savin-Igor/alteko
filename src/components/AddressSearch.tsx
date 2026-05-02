'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Suggestion {
  id: string
  address: string
  lat: number
  lon: number
}

interface Props {
  onSelect: (suggestion: Suggestion) => void
}

const CITIES = [
  'Rīga',
  'Daugavpils',
  'Liepāja',
  'Jelgava',
  'Jūrmala',
  'Rēzekne',
  'Valmiera',
  'Ventspils',
  'Ogre',
  'Salaspils',
]

export function AddressSearch({ onSelect }: Props) {
  const [city, setCity] = useState('Rīga')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const search = useCallback(async (q: string, selectedCity: string) => {
    if (q.trim().length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams({ q, city: selectedCity })
      const res = await fetch(`/api/address/search?${params}`)
      const data = await res.json()
      setSuggestions(Array.isArray(data) ? data : [])
      setOpen(true)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query, city), 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, city, search])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleCityChange(newCity: string) {
    setCity(newCity)
    setQuery('')
    setSuggestions([])
    setOpen(false)
    inputRef.current?.focus()
  }

  function handleSelect(s: Suggestion) {
    setQuery(s.address)
    setOpen(false)
    onSelect(s)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex gap-2">
        <select
          value={city}
          onChange={(e) => handleCityChange(e.target.value)}
          className="input-field w-36 flex-shrink-0 cursor-pointer"
          aria-label="Город"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Brīvības iela 55"
            className="input-field w-full pr-10"
            autoComplete="off"
            aria-label="Улица и номер дома"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0 min-h-[48px] flex items-center"
              >
                {s.address}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && suggestions.length === 0 && query.trim().length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-500">
          Адрес не найден. Проверьте улицу и номер дома.
        </div>
      )}
    </div>
  )
}
