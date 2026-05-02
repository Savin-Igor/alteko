import { generateIntentRu } from './templates/intent-ru'
import { generateIntentLv } from './templates/intent-lv'
import { generateAgendaRu } from './templates/agenda-ru'
import { generateAgendaLv } from './templates/agenda-lv'
import type { IntentDocumentData } from './templates/intent-ru'
import type { AgendaDocumentData } from './templates/agenda-ru'

export type { IntentDocumentData, AgendaDocumentData }

export function generateIntentDocument(data: IntentDocumentData, lang: 'ru' | 'lv'): Buffer {
  const text = lang === 'ru' ? generateIntentRu(data) : generateIntentLv(data)
  // Plain text wrapped in minimal PDF structure
  return textToPdfBuffer(text)
}

export function generateAgendaDocument(data: AgendaDocumentData, lang: 'ru' | 'lv'): Buffer {
  const text = lang === 'ru' ? generateAgendaRu(data) : generateAgendaLv(data)
  return textToPdfBuffer(text)
}

// Minimal RFC-compliant PDF wrapping plain text.
// For production: replace with a proper PDF library (PDFKit, jsPDF, or react-pdf).
function textToPdfBuffer(text: string): Buffer {
  const escaped = text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r?\n/g, '\\n')

  const lines = text.split('\n')
  const pageLines = lines.map((line, i) => {
    const y = 750 - i * 14
    if (y < 50) return ''
    const safeLine = line
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
    return `BT /F1 10 Tf 40 ${y} Td (${safeLine}) Tj ET`
  }).filter(Boolean).join('\n')

  const content = `%PDF-1.4
1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj
2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>endobj
3 0 obj<</Type /Page /Parent 2 0 R /MediaBox [0 0 595 842]
/Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>>>>endobj
4 0 obj<</Length ${pageLines.length + 10}>>
stream
${pageLines}
endstream
endobj
5 0 obj<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>endobj
xref
0 6
0000000000 65535 f
trailer<</Size 6 /Root 1 0 R>>
startxref
${escaped.length}
%%EOF`

  return Buffer.from(content, 'utf-8')
}
