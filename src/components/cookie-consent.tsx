'use client'

import { useState, useEffect } from 'react'

const CONSENT_KEY = 'alteko-cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true)
    }
  }, [])

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'necessary-only')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Sīkdatņu piekrišana"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-4 shadow-lg sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Mēs izmantojam obligātās sīkdatnes, lai nodrošinātu platformas darbību
          (autentifikācija, sesijas). Neobligātās analītikas sīkdatnes netiek izmantotas.{' '}
          <a href="/privacy" className="underline hover:text-gray-900">
            Privātuma politika
          </a>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={decline}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Tikai nepieciešamās
          </button>
          <button
            onClick={accept}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
          >
            Piekrist
          </button>
        </div>
      </div>
    </div>
  )
}
