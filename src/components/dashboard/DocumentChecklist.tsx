import { getTranslations } from 'next-intl/server'
import { BuildingDocumentType } from '@prisma/client'
import { DocumentUploadButton } from './DocumentUploadButton'

export interface DocumentRow {
  documentType: BuildingDocumentType
  uploadedAt: Date | null
  expiresAt: Date | null
}

interface Props {
  cadastralCode: string
  locale: string
  documents: DocumentRow[]
}

const DOCUMENT_ORDER: BuildingDocumentType[] = [
  BuildingDocumentType.ENERGY_CERTIFICATE,
  BuildingDocumentType.TECHNICAL_PASSPORT,
  BuildingDocumentType.TECHNICAL_INSPECTION,
  BuildingDocumentType.OWNER_LIST,
  BuildingDocumentType.ASSOCIATION_DOCUMENTS,
  BuildingDocumentType.POWER_OF_ATTORNEY,
  BuildingDocumentType.OWNER_DECISIONS,
  BuildingDocumentType.GDPR_CONSENTS,
]

type Status = 'uploaded' | 'expired' | 'missing'

function statusFor(row: DocumentRow | null): Status {
  if (!row?.uploadedAt) return 'missing'
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return 'expired'
  return 'uploaded'
}

const DOT_CLASS: Record<Status, string> = {
  uploaded: 'bg-success',
  expired: 'bg-danger',
  missing: 'bg-gray-300',
}

/**
 * 8-row checklist for the BuildingDocument types Altum/SCF expects.
 * Each row is its own server-rendered status block plus an inline
 * client-side upload button.
 */
export async function DocumentChecklist({
  cadastralCode,
  locale,
  documents,
}: Props) {
  const t = await getTranslations({
    locale,
    namespace: 'dashboard.valdes.documents',
  })
  const tType = await getTranslations({
    locale,
    namespace: 'dashboard.valdes.documentTypes',
  })
  const isRu = locale === 'ru'

  const byType = new Map(documents.map((d) => [d.documentType, d]))

  return (
    <section
      aria-labelledby="dashboard-documents"
      className="bg-white border border-gray-200 rounded-xl overflow-hidden"
    >
      <header className="px-5 py-4 border-b border-gray-100">
        <h2
          id="dashboard-documents"
          className="text-sm font-semibold text-gray-900"
        >
          {t('heading')}
        </h2>
        <p className="text-xs text-gray-500 mt-1">{t('subheading')}</p>
      </header>

      <ul className="divide-y divide-gray-100">
        {DOCUMENT_ORDER.map((type) => {
          const row = byType.get(type) ?? null
          const status = statusFor(row)
          return (
            <li key={type} className="px-5 py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {tType(type)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${DOT_CLASS[status]}`}
                      aria-hidden
                    />
                    {row?.uploadedAt
                      ? t(`status.${status}`, {
                          date: row.uploadedAt.toLocaleDateString(
                            isRu ? 'ru-RU' : 'lv-LV',
                          ),
                        })
                      : t('status.missing')}
                    {row?.expiresAt && (
                      <>
                        {' · '}
                        {t('expires', {
                          date: row.expiresAt.toLocaleDateString(
                            isRu ? 'ru-RU' : 'lv-LV',
                          ),
                        })}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <DocumentUploadButton
                    cadastralCode={cadastralCode}
                    documentType={type}
                    hasFile={status !== 'missing'}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
