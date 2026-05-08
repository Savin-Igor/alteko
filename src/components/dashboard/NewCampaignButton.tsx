'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface DecisionTemplate {
  decisionType: string
  titleLv: string
  titleRu: string
  questionTextLv: string
  questionTextRu: string
  explanationTextLv: string
  explanationTextRu: string
}

interface Props {
  buildingId: string
}

/**
 * Spawn a new DecisionCampaign in DRAFT status from one of the
 * pre-built templates. Loads templates from /api/decisions/templates,
 * then POSTs to /api/decisions/[buildingId] with the fields filled
 * in. Refreshes the page on success so the new campaign shows up
 * in the list above.
 */
export function NewCampaignButton({ buildingId }: Props) {
  const t = useTranslations('dashboard.valdes.campaigns')
  const router = useRouter()
  const detailsRef = useRef<HTMLDetailsElement>(null)

  const [templates, setTemplates] = useState<DecisionTemplate[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    fetch('/api/decisions/templates')
      .then((r) => r.json())
      .then((payload) => {
        const list = Object.values(payload) as DecisionTemplate[]
        setTemplates(list)
      })
      .catch(() => setError(t('errorLoadTemplates')))
  }, [t])

  async function createFromTemplate(tpl: DecisionTemplate) {
    setBusy(tpl.decisionType)
    setError(null)
    try {
      const res = await fetch(
        `/api/decisions/${encodeURIComponent(buildingId)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decisionType: tpl.decisionType,
            title: tpl.titleLv,
            questionTextLv: tpl.questionTextLv,
            questionTextRu: tpl.questionTextRu,
            explanationTextLv: tpl.explanationTextLv,
            explanationTextRu: tpl.explanationTextRu,
          }),
        },
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? t('errorCreate'))
        return
      }
      // Close the popover and refresh the list.
      detailsRef.current?.removeAttribute('open')
      startTransition(() => router.refresh())
    } catch {
      setError(t('errorCreate'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <details ref={detailsRef} className="relative">
      <summary className="list-none cursor-pointer text-xs font-semibold text-primary hover:underline select-none">
        {t('newCampaign')}
      </summary>
      <div className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
        {error && <p className="text-xs text-danger px-2 py-1">{error}</p>}
        {templates === null ? (
          <p className="text-xs text-gray-500 px-2 py-1">
            {t('loadingTemplates')}
          </p>
        ) : (
          templates.map((tpl) => (
            <button
              key={tpl.decisionType}
              type="button"
              disabled={busy !== null}
              onClick={() => createFromTemplate(tpl)}
              className="w-full text-left text-xs px-2 py-2 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="block font-medium text-gray-900 truncate">
                {tpl.titleLv}
              </span>
              <span className="block text-gray-500 text-[11px] truncate">
                {tpl.decisionType.replaceAll('_', ' ').toLowerCase()}
              </span>
            </button>
          ))
        )}
      </div>
    </details>
  )
}
