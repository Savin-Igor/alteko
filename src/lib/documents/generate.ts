import { generateIntentRu } from './templates/intent-ru'
import { generateIntentLv } from './templates/intent-lv'
import { generateAgendaRu } from './templates/agenda-ru'
import { generateAgendaLv } from './templates/agenda-lv'
import type { IntentDocumentData } from './templates/intent-ru'
import type { AgendaDocumentData } from './templates/agenda-ru'

export type { IntentDocumentData, AgendaDocumentData }

export function generateIntentDocument(data: IntentDocumentData, lang: 'ru' | 'lv'): Buffer {
  const text = lang === 'ru' ? generateIntentRu(data) : generateIntentLv(data)
  return textToPdfBuffer(text)
}

export function generateAgendaDocument(data: AgendaDocumentData, lang: 'ru' | 'lv'): Buffer {
  const text = lang === 'ru' ? generateAgendaRu(data) : generateAgendaLv(data)
  return textToPdfBuffer(text)
}

/**
 * Generates a minimal but structurally valid PDF/1.4 document from plain text.
 *
 * LIMITATIONS (tracked in issue #31):
 * - No Unicode font embedding — Latvian (ā/ē/ī/ū/ķ/ļ/ņ/ģ/č/š/ž) and Cyrillic chars
 *   will render as '?' in Adobe Reader (Type1/Helvetica is Latin-1 only).
 * - No multi-page support — content that exceeds one A4 page is truncated.
 * - ALTUM portal acceptance not verified.
 *
 * TODO (issue #31): Replace with PDFKit (npm install pdfkit @types/pdfkit)
 *   for proper Unicode, multi-page, and font embedding support.
 */
function textToPdfBuffer(text: string): Buffer {
  // Transliterate non-Latin-1 chars to closest ASCII equivalents
  // so the output is at least readable without proper font embedding
  const ascii = text
    .replace(/ā/g, 'a').replace(/Ā/g, 'A')
    .replace(/č/g, 'c').replace(/Č/g, 'C')
    .replace(/ē/g, 'e').replace(/Ē/g, 'E')
    .replace(/ģ/g, 'g').replace(/Ģ/g, 'G')
    .replace(/ī/g, 'i').replace(/Ī/g, 'I')
    .replace(/ķ/g, 'k').replace(/Ķ/g, 'K')
    .replace(/ļ/g, 'l').replace(/Ļ/g, 'L')
    .replace(/ņ/g, 'n').replace(/Ņ/g, 'N')
    .replace(/š/g, 's').replace(/Š/g, 'S')
    .replace(/ū/g, 'u').replace(/Ū/g, 'U')
    .replace(/ž/g, 'z').replace(/Ž/g, 'Z')
    // Cyrillic — replace entire words with transliteration is too complex; leave as '?'
    .replace(/[Ѐ-ӿ]/g, '?')

  const lines = ascii.split('\n')
  const streamLines = lines
    .slice(0, 50)  // cap at 50 lines per page
    .map((line, i) => {
      const y = 790 - i * 14
      const safe = line
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
      return `BT /F1 10 Tf 40 ${y} Td (${safe}) Tj ET`
    })
    .join('\n')

  const stream = streamLines + '\n'
  const streamLen = Buffer.byteLength(stream, 'utf-8')

  // Build objects with correct byte offsets for xref table
  const obj1 = '1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj\n'
  const obj2 = '2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>endobj\n'
  const obj3 = `3 0 obj<</Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>>>>endobj\n`
  const obj4 = `4 0 obj<</Length ${streamLen}>>\nstream\n${stream}endstream\nendobj\n`
  const obj5 = '5 0 obj<</Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding>>endobj\n'

  const header = '%PDF-1.4\n'
  const off1 = header.length
  const off2 = off1 + Buffer.byteLength(obj1, 'latin1')
  const off3 = off2 + Buffer.byteLength(obj2, 'latin1')
  const off4 = off3 + Buffer.byteLength(obj3, 'latin1')
  const off5 = off4 + Buffer.byteLength(obj4, 'latin1')
  const xrefOff = off5 + Buffer.byteLength(obj5, 'latin1')

  const xref = [
    'xref\n',
    '0 6\n',
    '0000000000 65535 f \n',
    String(off1).padStart(10, '0') + ' 00000 n \n',
    String(off2).padStart(10, '0') + ' 00000 n \n',
    String(off3).padStart(10, '0') + ' 00000 n \n',
    String(off4).padStart(10, '0') + ' 00000 n \n',
    String(off5).padStart(10, '0') + ' 00000 n \n',
  ].join('')

  const trailer = `trailer<</Size 6 /Root 1 0 R>>\nstartxref\n${xrefOff}\n%%EOF\n`

  return Buffer.from(header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer, 'latin1')
}
