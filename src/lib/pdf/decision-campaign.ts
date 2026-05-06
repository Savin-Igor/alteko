/**
 * PDFKit generator for decision campaign vote collection package.
 *
 * Produces a printable A4 PDF with:
 * - Cover: building address, campaign title, date
 * - Section 1: Formal decision question text
 * - Section 2: Plain-language explanation for residents
 * - Section 3: Vote collection table (apartment, owner, YES/NO/ABSTAIN, signature)
 * - Footer: "Exported from ALTEKO for submission to BIS Mājas lieta"
 *
 * Uses NotoSans (LV diacritics + Cyrillic). Node.js runtime only.
 */

import PDFDocument from 'pdfkit'
import * as path from 'path'

export type CampaignLang = 'LV' | 'RU'

export interface CampaignPdfData {
  buildingAddress: string
  cadastralCode: string
  campaignTitle: string
  questionText: string
  explanationText: string
  legalBasis: string
  lang: CampaignLang
  exportedAt: Date
  apartmentCount: number
}

// ─── Layout ───────────────────────────────────────────────────

const MARGIN = 50
const PAGE_WIDTH = 595 - MARGIN * 2
const PRIMARY = '#1d4ed8'
const MUTED = '#6b7280'
const BORDER = '#e5e7eb'

// ─── Localization ─────────────────────────────────────────────

const T = {
  title: { LV: 'Dzīvokļu īpašnieku lēmuma pieņemšana', RU: 'Принятие решения собственников квартир' },
  questionHeading: { LV: 'Lēmuma jautājums', RU: 'Вопрос решения' },
  explanationHeading: { LV: 'Skaidrojums iedzīvotājiem', RU: 'Пояснение для жильцов' },
  legalBasisLabel: { LV: 'Juridiskais pamats', RU: 'Правовое основание' },
  voteTableHeading: { LV: 'Balsošanas lapa', RU: 'Лист голосования' },
  colApartment: { LV: 'Dzīvokļa nr.', RU: 'Кв. №' },
  colOwner: { LV: 'Īpašnieks (vārds, uzvārds)', RU: 'Собственник (Ф.И.О.)' },
  colYes: { LV: 'PAR', RU: 'ЗА' },
  colNo: { LV: 'PRET', RU: 'ПРОТИВ' },
  colAbstain: { LV: 'ATTURAS', RU: 'ВОЗДЕРЖ.' },
  colSignature: { LV: 'Paraksts / datums', RU: 'Подпись / дата' },
  footer: {
    LV: 'Eksportēts no ALTEKO — Mājas gatavības platforma · alteko.lv · iesniegt BIS Mājas lieta manuāli',
    RU: 'Экспортировано из ALTEKO — Mājas gatavības platforma · alteko.lv · подать в BIS Mājas lieta вручную',
  },
  date: { LV: 'Datums', RU: 'Дата' },
  cadastral: { LV: 'Kadastra numurs', RU: 'Кадастровый номер' },
}

function l(key: keyof typeof T, lang: CampaignLang): string {
  return T[key][lang]
}

function fontPath(variant: 'Regular' | 'Bold'): string {
  return path.join(process.cwd(), 'public', 'fonts', `NotoSans-${variant}.ttf`)
}

function ensureSpace(doc: PDFKit.PDFDocument, needed = 80): void {
  if (doc.y > doc.page.height - doc.page.margins.bottom - needed) {
    doc.addPage()
  }
}

function sectionHeading(doc: PDFKit.PDFDocument, text: string): void {
  ensureSpace(doc, 60)
  doc.moveDown(0.8)
  doc.font('Bold').fontSize(11).fillColor(PRIMARY).text(text, MARGIN, doc.y, { width: PAGE_WIDTH })
  doc.moveDown(0.3)
  doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + PAGE_WIDTH, doc.y).strokeColor(BORDER).lineWidth(0.5).stroke()
  doc.moveDown(0.5)
  doc.fillColor('#1a1a1a')
}

function footer(doc: PDFKit.PDFDocument, lang: CampaignLang): void {
  const y = doc.page.height - doc.page.margins.bottom + 8
  doc.font('Regular').fontSize(7).fillColor(MUTED).text(l('footer', lang), MARGIN, y, {
    width: PAGE_WIDTH,
    align: 'center',
  })
}

// ─── Main export ──────────────────────────────────────────────

export async function buildDecisionCampaignPdf(data: CampaignPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 55, left: MARGIN, right: MARGIN },
      info: {
        Title: data.campaignTitle,
        Author: 'ALTEKO',
        Subject: data.buildingAddress,
      },
      autoFirstPage: true,
    })

    const lang = data.lang

    doc.registerFont('Regular', fontPath('Regular'))
    doc.registerFont('Bold', fontPath('Bold'))

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // ── Cover ──────────────────────────────────────────────────
    doc.font('Bold').fontSize(18).fillColor(PRIMARY).text('ALTEKO', MARGIN, 55, { width: PAGE_WIDTH, align: 'center' })
    doc.moveDown(0.4)
    doc.font('Bold').fontSize(13).fillColor('#1a1a1a').text(l('title', lang), MARGIN, doc.y, { width: PAGE_WIDTH, align: 'center' })
    doc.moveDown(0.8)
    doc.moveTo(MARGIN + 40, doc.y).lineTo(MARGIN + PAGE_WIDTH - 40, doc.y).strokeColor(BORDER).lineWidth(1).stroke()
    doc.moveDown(0.8)

    doc.font('Bold').fontSize(12).fillColor('#1a1a1a').text(data.buildingAddress, MARGIN, doc.y, { width: PAGE_WIDTH, align: 'center' })
    doc.moveDown(0.3)
    doc.font('Regular').fontSize(9).fillColor(MUTED).text(
      `${l('cadastral', lang)}: ${data.cadastralCode}   ·   ${l('date', lang)}: ${data.exportedAt.toLocaleDateString('lv-LV')}`,
      MARGIN, doc.y, { width: PAGE_WIDTH, align: 'center' }
    )
    doc.moveDown(0.6)

    doc.font('Bold').fontSize(12).fillColor('#374151').text(data.campaignTitle, MARGIN, doc.y, { width: PAGE_WIDTH, align: 'center' })
    doc.moveDown(1.5)

    // ── Section 1: Question ───────────────────────────────────
    sectionHeading(doc, `1. ${l('questionHeading', lang)}`)
    doc.font('Regular').fontSize(11).fillColor('#1a1a1a').text(data.questionText, MARGIN, doc.y, {
      width: PAGE_WIDTH,
      lineGap: 3,
    })
    doc.moveDown(0.6)

    doc.font('Regular').fontSize(8).fillColor(MUTED).text(
      `${l('legalBasisLabel', lang)}: ${data.legalBasis}`,
      MARGIN, doc.y, { width: PAGE_WIDTH }
    )

    // ── Section 2: Explanation ────────────────────────────────
    sectionHeading(doc, `2. ${l('explanationHeading', lang)}`)
    doc.font('Regular').fontSize(10).fillColor('#374151').text(data.explanationText, MARGIN, doc.y, {
      width: PAGE_WIDTH,
      lineGap: 3,
    })

    // ── Section 3: Vote table ─────────────────────────────────
    sectionHeading(doc, `3. ${l('voteTableHeading', lang)}`)

    const ROW_H = 20
    const COL_WIDTHS = {
      apt: 40,
      owner: PAGE_WIDTH - 40 - 36 - 36 - 36 - 90,
      yes: 36,
      no: 36,
      abstain: 36,
      sig: 90,
    }
    const COLS = {
      apt: MARGIN,
      owner: MARGIN + COL_WIDTHS.apt,
      yes: MARGIN + COL_WIDTHS.apt + COL_WIDTHS.owner,
      no: MARGIN + COL_WIDTHS.apt + COL_WIDTHS.owner + COL_WIDTHS.yes,
      abstain: MARGIN + COL_WIDTHS.apt + COL_WIDTHS.owner + COL_WIDTHS.yes + COL_WIDTHS.no,
      sig: MARGIN + COL_WIDTHS.apt + COL_WIDTHS.owner + COL_WIDTHS.yes + COL_WIDTHS.no + COL_WIDTHS.abstain,
    }

    // Header row
    ensureSpace(doc, ROW_H + 10)
    const headerY = doc.y
    doc.rect(MARGIN, headerY, PAGE_WIDTH, ROW_H).fillColor('#f3f4f6').fill()
    doc.fillColor('#374151').font('Bold').fontSize(8)
    doc.text(l('colApartment', lang), COLS.apt + 2, headerY + 6, { width: COL_WIDTHS.apt - 4 })
    doc.text(l('colOwner', lang), COLS.owner + 2, headerY + 6, { width: COL_WIDTHS.owner - 4 })
    doc.text(l('colYes', lang), COLS.yes + 2, headerY + 6, { width: COL_WIDTHS.yes - 4, align: 'center' })
    doc.text(l('colNo', lang), COLS.no + 2, headerY + 6, { width: COL_WIDTHS.no - 4, align: 'center' })
    doc.text(l('colAbstain', lang), COLS.abstain + 2, headerY + 6, { width: COL_WIDTHS.abstain - 4, align: 'center' })
    doc.text(l('colSignature', lang), COLS.sig + 2, headerY + 6, { width: COL_WIDTHS.sig - 4 })
    doc.rect(MARGIN, headerY, PAGE_WIDTH, ROW_H).strokeColor(BORDER).lineWidth(0.5).stroke()
    doc.y = headerY + ROW_H

    // Data rows — one per apartment (empty for manual filling)
    const totalRows = Math.max(data.apartmentCount, 20)
    for (let i = 0; i < totalRows; i++) {
      ensureSpace(doc, ROW_H + 4)
      const rowY = doc.y
      doc.fillColor('#1a1a1a').font('Regular').fontSize(8)
      doc.text(String(i + 1), COLS.apt + 2, rowY + 6, { width: COL_WIDTHS.apt - 4 })
      doc
        .moveTo(COLS.owner + 2, rowY + ROW_H - 4)
        .lineTo(COLS.owner + COL_WIDTHS.owner - 4, rowY + ROW_H - 4)
        .strokeColor('#d1d5db').lineWidth(0.3).stroke()
      // Checkboxes
      for (const x of [COLS.yes, COLS.no, COLS.abstain]) {
        const cx = x + (36 - 10) / 2
        const cy = rowY + (ROW_H - 10) / 2
        doc.rect(cx, cy, 10, 10).strokeColor(BORDER).lineWidth(0.5).stroke()
      }
      // Signature line
      doc
        .moveTo(COLS.sig + 4, rowY + ROW_H - 4)
        .lineTo(COLS.sig + COL_WIDTHS.sig - 4, rowY + ROW_H - 4)
        .strokeColor('#d1d5db').lineWidth(0.3).stroke()
      // Row border
      doc.rect(MARGIN, rowY, PAGE_WIDTH, ROW_H).strokeColor(BORDER).lineWidth(0.3).stroke()
      doc.y = rowY + ROW_H
    }

    footer(doc, lang)
    doc.end()
  })
}
