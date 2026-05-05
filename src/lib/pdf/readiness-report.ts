/**
 * PDFKit-based generator for Gatavības atskaite (Readiness Report).
 *
 * 8 sections, multi-page A4, NotoSans font (supports LV diacritics + Cyrillic).
 * Must only be called from Node.js runtime API routes.
 */

import PDFDocument from 'pdfkit'
import * as path from 'path'
import type { Decimal } from '@prisma/client/runtime/library'
import type {
  EnergyClass,
  ExpenseCategory,
  BuildingDocumentType,
  DecisionType,
  CampaignStatus,
} from '@prisma/client'
import type { ScoreComponents } from '@/lib/readiness/score'
import type { ScenarioResult } from '@/lib/financing/scenarios'

// ─── Types ────────────────────────────────────────────────────

export interface ReportBuilding {
  address: string
  cadastralCode: string
  series: string | null
  constructionYear: number | null
  totalAreaM2: Decimal | null
  apartmentCount: number | null
  floorCount: number | null
  energyClass: EnergyClass | null
  renovationYear: number | null
  heatingEnergyKwhM2: Decimal | null
}

export interface ReportExpenseRow {
  category: ExpenseCategory
  amountPerM2: Decimal
  p50: Decimal | null
}

export interface ReportDocument {
  documentType: BuildingDocumentType
}

export interface ReportDecision {
  decisionType: DecisionType
  status: CampaignStatus
}

export interface ReportData {
  orderId: string
  language: 'LV' | 'RU'
  building: ReportBuilding
  scoreComponents: ScoreComponents
  scenarios: ScenarioResult[]
  documents: ReportDocument[]
  decisions: ReportDecision[]
  expenseRows: ReportExpenseRow[]
  narrativeLv: string
  narrativeRu: string
}

// ─── Font paths ───────────────────────────────────────────────

function fontPath(variant: 'Regular' | 'Bold'): string {
  return path.join(process.cwd(), 'public', 'fonts', `NotoSans-${variant}.ttf`)
}

// ─── Layout constants ─────────────────────────────────────────

const MARGIN = 50
const PAGE_WIDTH = 595 - MARGIN * 2  // A4 width minus margins
const PRIMARY = '#1d4ed8'
const MUTED = '#6b7280'
const BORDER = '#e5e7eb'
const SUCCESS = '#16a34a'
const DANGER = '#dc2626'

// ─── Localization ─────────────────────────────────────────────

type Lang = 'LV' | 'RU'

const T = {
  cover: {
    LV: 'Gatavības atskaite',
    RU: 'Отчёт о готовности',
  },
  generated: {
    LV: 'Sagatavots',
    RU: 'Сформирован',
  },
  orderRef: {
    LV: 'Pasūtījuma nr.',
    RU: 'Номер заказа',
  },
  section1: {
    LV: '1. Mājas karte',
    RU: '1. Карточка дома',
  },
  series: { LV: 'Sērija', RU: 'Серия' },
  year: { LV: 'Celtniecības gads', RU: 'Год постройки' },
  area: { LV: 'Kopējā platība', RU: 'Общая площадь' },
  apartments: { LV: 'Dzīvokļu skaits', RU: 'Кол-во квартир' },
  energyClass: { LV: 'Energoklase', RU: 'Энергокласс' },
  renovated: { LV: 'Renovēts', RU: 'Реновирован' },
  heating: { LV: 'Apkures patēriņš', RU: 'Потребление тепла' },
  section2: {
    LV: '2. Mājas gatavības novērtējums',
    RU: '2. Оценка готовности дома',
  },
  scoreLabels: {
    energyScore: { LV: 'Energoefektivitāte', RU: 'Энергоэффективность' },
    fundingEligibilityScore: { LV: 'Finansējuma piemērotība', RU: 'Пригодность к финансированию' },
    documentReadinessScore: { LV: 'Dokumentu gatavība', RU: 'Готовность документов' },
    ownerDecisionReadinessScore: { LV: 'Īpašnieku lēmumi', RU: 'Решения собственников' },
    financialFeasibilityScore: { LV: 'Finansiālā dzīvotspēja', RU: 'Финансовая жизнеспособность' },
    procurementTransparencyScore: { LV: 'Iepirkuma pārredzamība', RU: 'Прозрачность закупок' },
    legalConfidenceStatus: { LV: 'Juridiskais statuss', RU: 'Правовой статус' },
    dataConfidenceStatus: { LV: 'Datu avots', RU: 'Источник данных' },
  },
  noData: { LV: 'Nav datu', RU: 'Нет данных' },
  section3: {
    LV: '3. Izdevumu analīze',
    RU: '3. Анализ расходов',
  },
  expenseNoData: {
    LV: 'Rēķini nav augšupielādēti. Augšupielādējiet komunālos rēķinus, lai saņemtu personalizētu izdevumu analīzi.',
    RU: 'Счета не загружены. Загрузите счета управляющей компании для персонального анализа расходов.',
  },
  expenseColCategory: { LV: 'Kategorija', RU: 'Категория' },
  expenseColActual: { LV: 'Faktiskais €/m²', RU: 'Факт. €/m²' },
  expenseColP50: { LV: 'Mediāna €/m²', RU: 'Медиана €/m²' },
  expenseColDev: { LV: 'Novirze', RU: 'Отклонение' },
  section4: {
    LV: '4. Finansējuma piemērotības vērtējums',
    RU: '4. Оценка пригодности к финансированию',
  },
  windowStatus: {
    CLOSED: { LV: 'Slēgts', RU: 'Закрыто' },
    EXPECTED: { LV: 'Gaidāms', RU: 'Ожидается' },
    OPEN: { LV: 'Atvērts', RU: 'Открыто' },
    UNKNOWN: { LV: 'Nezināms', RU: 'Неизвестно' },
  },
  eligibility: {
    ELIGIBLE: { LV: 'Piemērots', RU: 'Пригоден' },
    LIKELY_ELIGIBLE: { LV: 'Iespējami piemērots', RU: 'Вероятно пригоден' },
    UNLIKELY: { LV: 'Maz ticams', RU: 'Маловероятно' },
    NOT_ELIGIBLE: { LV: 'Nav piemērots', RU: 'Не пригоден' },
    UNKNOWN: { LV: 'Nezināms', RU: 'Неизвестно' },
  },
  scenarioNames: {
    SCF_2026_2032: { LV: 'Sociālā klimata fonds 2026-2032', RU: 'SCF 2026-2032' },
    ALTUM_REMONTA_AIZDEVUMS: { LV: 'ALTUM remonta aizdevums', RU: 'ALTUM remonta aizdevums' },
    COMMERCIAL_BANK: { LV: 'Komercbanka', RU: 'Коммерческий банк' },
    OWN_FUND: { LV: 'Pašu uzkrājumi', RU: 'Собственный фонд' },
    MIXED: { LV: 'Jauktais scenārijs', RU: 'Смешанный сценарий' },
  },
  section5: {
    LV: '5. Dokumentu gatavības vērtējums',
    RU: '5. Оценка готовности документов',
  },
  docTypes: {
    ENERGY_CERTIFICATE: { LV: 'Energosertifikāts', RU: 'Энергосертификат' },
    TECHNICAL_PASSPORT: { LV: 'Tehniskais pase', RU: 'Технический паспорт' },
    TECHNICAL_INSPECTION: { LV: 'Tehniskā apsekošana', RU: 'Техническое обследование' },
    OWNER_LIST: { LV: 'Īpašnieku saraksts', RU: 'Список собственников' },
    ASSOCIATION_DOCUMENTS: { LV: 'Biedrības statūti', RU: 'Учредительные документы' },
    POWER_OF_ATTORNEY: { LV: 'Pilnvarojums', RU: 'Доверенность' },
    OWNER_DECISIONS: { LV: 'Iepriekšējie lēmumi', RU: 'Ранее принятые решения' },
    GDPR_CONSENTS: { LV: 'VDAR piekrišanas', RU: 'Согласия GDPR' },
  },
  section6: {
    LV: '6. Finansējuma scenāriji',
    RU: '6. Сценарии финансирования',
  },
  scenarioColName: { LV: 'Scenārijs', RU: 'Сценарий' },
  scenarioColCost: { LV: 'Orientējošā cena', RU: 'Оценочная стоимость' },
  scenarioColSubsidy: { LV: 'Subsīdija', RU: 'Субсидия' },
  scenarioColMonthly: { LV: '€/mēn./dzīv.', RU: '€/мес./кв.' },
  section7: {
    LV: '7. Lēmumu plāns',
    RU: '7. План решений собственников',
  },
  decisionTypes: {
    PREPARATION_DECISION: { LV: 'Lēmums par sagatavošanas uzsākšanu', RU: 'Решение о начале подготовки' },
    REPRESENTATIVE_AUTHORIZATION: { LV: 'Pilnvarotās personas iecelšana', RU: 'Назначение уполномоченного лица' },
    DATA_COLLECTION_CONSENT: { LV: 'VDAR piekrišana datu apstrādei', RU: 'Согласие на обработку данных' },
    ENERGY_AUDIT_DECISION: { LV: 'Lēmums par energoauditu', RU: 'Решение об энергоаудите' },
    PROGRAM_APPLICATION_DECISION: { LV: 'Lēmums par pieteikumu programmai', RU: 'Решение о подаче заявки' },
    LOAN_DECISION: { LV: 'Lēmums par aizdevumu', RU: 'Решение о кредите' },
    SUPPLIER_SELECTION_DECISION: { LV: 'Lēmums par piegādātāja izvēli', RU: 'Решение о выборе поставщика' },
  },
  decisionStatusDone: { LV: 'Pieņemts', RU: 'Принято' },
  decisionStatusPending: { LV: 'Gaida', RU: 'Ожидает' },
  footer: {
    LV: 'ALTEKO — Mājas gatavības platforma · alteko.lv',
    RU: 'ALTEKO — Mājas gatavības platforma · alteko.lv',
  },
  expenseCategories: {
    HEATING: { LV: 'Apkure', RU: 'Отопление' },
    COLD_WATER: { LV: 'Aukstais ūdens', RU: 'Холодная вода' },
    HOT_WATER: { LV: 'Karstais ūdens', RU: 'Горячая вода' },
    WASTEWATER: { LV: 'Kanalizācija', RU: 'Канализация' },
    WASTE: { LV: 'Atkritumi', RU: 'Мусор' },
    CLEANING: { LV: 'Uzkopšana', RU: 'Уборка' },
    REPAIR_FUND: { LV: 'Remontfonds', RU: 'Ремонтный фонд' },
    ADMINISTRATION: { LV: 'Administrācija', RU: 'Администрация' },
    ELEVATOR: { LV: 'Lifts', RU: 'Лифт' },
    OTHER: { LV: 'Cits', RU: 'Прочее' },
  },
}

function t<K extends keyof typeof T>(
  key: K,
  lang: Lang
): (typeof T)[K] extends Record<Lang, string> ? string : never {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (T[key] as any)[lang]
}

// ─── Helpers ──────────────────────────────────────────────────

function ensureSpace(doc: PDFKit.PDFDocument, needed = 120): void {
  if (doc.y > doc.page.height - doc.page.margins.bottom - needed) {
    doc.addPage()
  }
}

function sectionHeading(doc: PDFKit.PDFDocument, text: string): void {
  ensureSpace(doc, 80)
  doc
    .font('Bold')
    .fontSize(12)
    .fillColor(PRIMARY)
    .text(text, MARGIN, doc.y, { width: PAGE_WIDTH })
  doc.moveDown(0.4)
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(MARGIN + PAGE_WIDTH, doc.y)
    .strokeColor(BORDER)
    .lineWidth(0.5)
    .stroke()
  doc.moveDown(0.6)
  doc.fillColor('#1a1a1a')
}

function labelValue(doc: PDFKit.PDFDocument, label: string, value: string, x = MARGIN): void {
  const colWidth = PAGE_WIDTH / 2
  doc.font('Bold').fontSize(9).fillColor(MUTED).text(label, x, doc.y, { width: colWidth, continued: false })
  doc.font('Regular').fontSize(10).fillColor('#1a1a1a').text(value, x + colWidth, doc.y - doc.currentLineHeight(), { width: colWidth })
  doc.moveDown(0.3)
}

function scoreBar(doc: PDFKit.PDFDocument, label: string, score: number | null, statusText: string): void {
  ensureSpace(doc, 30)
  const y = doc.y
  const BAR_X = MARGIN + 160
  const BAR_W = 160
  const BAR_H = 8

  doc.font('Regular').fontSize(9).fillColor('#1a1a1a').text(label, MARGIN, y + 1, { width: 155 })

  // Background bar
  doc.rect(BAR_X, y, BAR_W, BAR_H).fillColor('#e5e7eb').fill()

  // Filled bar
  if (score !== null && score > 0) {
    const filledW = Math.round((score / 100) * BAR_W)
    const barColor = score >= 70 ? SUCCESS : score >= 40 ? '#f59e0b' : DANGER
    doc.rect(BAR_X, y, filledW, BAR_H).fillColor(barColor).fill()
  }

  // Score text
  const scoreText = score !== null ? `${score}` : '—'
  doc.font('Bold').fontSize(9).fillColor('#1a1a1a').text(scoreText, BAR_X + BAR_W + 8, y + 1, { width: 30 })
  doc.font('Regular').fontSize(8).fillColor(MUTED).text(statusText, BAR_X + BAR_W + 45, y + 1, { width: PAGE_WIDTH - (BAR_X - MARGIN) - BAR_W - 45 })

  doc.y = y + BAR_H + 8
  doc.moveDown(0.2)
}

function footerOnPage(doc: PDFKit.PDFDocument, lang: Lang, orderId: string): void {
  const orderId8 = orderId.slice(-8).toUpperCase()
  const footerY = doc.page.height - doc.page.margins.bottom + 10
  doc
    .font('Regular')
    .fontSize(8)
    .fillColor(MUTED)
    .text(`${T.footer[lang]} · ${new Date().toLocaleDateString('lv-LV')} · nr. ${orderId8}`, MARGIN, footerY, {
      width: PAGE_WIDTH,
      align: 'center',
    })
}

// ─── Main export ──────────────────────────────────────────────

export async function buildReadinessReportPdf(data: ReportData, lang: Lang): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 55, left: MARGIN, right: MARGIN },
      info: {
        Title: T.cover[lang],
        Author: 'ALTEKO',
        Subject: data.building.address,
      },
      autoFirstPage: true,
    })

    doc.registerFont('Regular', fontPath('Regular'))
    doc.registerFont('Bold', fontPath('Bold'))

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // ── Cover ──────────────────────────────────────────────────
    doc.font('Bold').fontSize(22).fillColor(PRIMARY).text('ALTEKO', MARGIN, 60, { width: PAGE_WIDTH, align: 'center' })
    doc.font('Bold').fontSize(16).fillColor('#1a1a1a').text(T.cover[lang], MARGIN, doc.y + 8, { width: PAGE_WIDTH, align: 'center' })
    doc.moveDown(1)
    doc.font('Regular').fontSize(11).fillColor('#374151').text(data.building.address, MARGIN, doc.y, { width: PAGE_WIDTH, align: 'center' })
    doc.moveDown(0.4)
    doc.font('Regular').fontSize(9).fillColor(MUTED).text(data.building.cadastralCode, MARGIN, doc.y, { width: PAGE_WIDTH, align: 'center' })
    doc.moveDown(1.5)
    doc
      .moveTo(MARGIN + 60, doc.y)
      .lineTo(PAGE_WIDTH + MARGIN - 60, doc.y)
      .strokeColor(BORDER).lineWidth(0.5).stroke()
    doc.moveDown(0.8)
    const orderId8 = data.orderId.slice(-8).toUpperCase()
    doc.font('Regular').fontSize(9).fillColor(MUTED).text(`${T.generated[lang]}: ${new Date().toLocaleDateString('lv-LV')} · ${T.orderRef[lang]}: ${orderId8}`, MARGIN, doc.y, { width: PAGE_WIDTH, align: 'center' })
    footerOnPage(doc, lang, data.orderId)

    // ── Section 1: Mājas karte ─────────────────────────────────
    doc.addPage()
    sectionHeading(doc, t('section1', lang))
    const b = data.building
    labelValue(doc, T.series[lang], b.series ?? T.noData[lang])
    labelValue(doc, T.year[lang], b.constructionYear ? String(b.constructionYear) : T.noData[lang])
    labelValue(doc, T.area[lang], b.totalAreaM2 ? `${Number(b.totalAreaM2).toFixed(0)} m²` : T.noData[lang])
    labelValue(doc, T.apartments[lang], b.apartmentCount ? String(b.apartmentCount) : T.noData[lang])
    labelValue(doc, T.energyClass[lang], b.energyClass ?? T.noData[lang])
    if (b.heatingEnergyKwhM2) {
      labelValue(doc, T.heating[lang], `${Number(b.heatingEnergyKwhM2).toFixed(1)} kWh/m²/gadā`)
    }
    if (b.renovationYear) {
      labelValue(doc, T.renovated[lang], String(b.renovationYear))
    }
    footerOnPage(doc, lang, data.orderId)

    // ── Section 2: Readiness Score ─────────────────────────────
    doc.addPage()
    sectionHeading(doc, t('section2', lang))

    // Narrative (GPT-4o)
    const narrative = lang === 'LV' ? data.narrativeLv : data.narrativeRu
    if (narrative) {
      doc.font('Regular').fontSize(10).fillColor('#374151').text(narrative, MARGIN, doc.y, { width: PAGE_WIDTH, align: 'left' })
      doc.moveDown(1)
    }

    const sc = data.scoreComponents
    const scoreRows: Array<{ key: string; score: number | null; status: string }> = [
      { key: 'energyScore', score: sc.energyScore, status: sc.energyScore !== null ? `${sc.energyScore}/100` : T.noData[lang] },
      { key: 'fundingEligibilityScore', score: sc.fundingEligibilityScore, status: sc.fundingEligibilityScore !== null ? `${sc.fundingEligibilityScore}/100` : T.noData[lang] },
      { key: 'documentReadinessScore', score: sc.documentReadinessScore, status: sc.documentReadinessScore !== null ? `${sc.documentReadinessScore}%` : T.noData[lang] },
      { key: 'ownerDecisionReadinessScore', score: sc.ownerDecisionReadinessScore, status: sc.ownerDecisionReadinessScore !== null ? `${sc.ownerDecisionReadinessScore}%` : T.noData[lang] },
      { key: 'financialFeasibilityScore', score: sc.financialFeasibilityScore, status: sc.financialFeasibilityScore !== null ? `${sc.financialFeasibilityScore}/100` : T.noData[lang] },
      { key: 'procurementTransparencyScore', score: sc.procurementTransparencyScore, status: sc.procurementTransparencyScore !== null ? `${sc.procurementTransparencyScore}/100` : T.noData[lang] },
      { key: 'legalConfidenceStatus', score: null, status: sc.legalConfidenceStatus },
      { key: 'dataConfidenceStatus', score: null, status: sc.dataConfidenceStatus },
    ]

    for (const row of scoreRows) {
      const label = (T.scoreLabels as Record<string, Record<Lang, string>>)[row.key]?.[lang] ?? row.key
      scoreBar(doc, label, row.score, row.status)
    }
    footerOnPage(doc, lang, data.orderId)

    // ── Section 3: Expense Analysis ────────────────────────────
    doc.addPage()
    sectionHeading(doc, t('section3', lang))

    if (data.expenseRows.length === 0) {
      doc.font('Regular').fontSize(10).fillColor(MUTED).text(T.expenseNoData[lang], MARGIN, doc.y, { width: PAGE_WIDTH })
    } else {
      // Table header
      const colW = [180, 90, 90, 80]
      const headers = [T.expenseColCategory[lang], T.expenseColActual[lang], T.expenseColP50[lang], T.expenseColDev[lang]]
      let cx = MARGIN
      doc.font('Bold').fontSize(9).fillColor(MUTED)
      headers.forEach((h, i) => {
        doc.text(h, cx, doc.y, { width: colW[i], continued: i < headers.length - 1 })
        if (i < headers.length - 1) cx += colW[i]!
      })
      doc.moveDown(0.6)

      for (const row of data.expenseRows) {
        ensureSpace(doc, 20)
        const actual = Number(row.amountPerM2)
        const p50 = row.p50 ? Number(row.p50) : null
        const dev = p50 && p50 > 0 ? ((actual - p50) / p50) * 100 : null
        const devText = dev !== null ? `${dev > 0 ? '+' : ''}${dev.toFixed(0)}%` : '—'
        const devColor = dev === null ? MUTED : dev > 15 ? DANGER : dev > 5 ? '#f59e0b' : SUCCESS
        const catLabel = (T.expenseCategories as Record<string, Record<Lang, string>>)[row.category]?.[lang] ?? row.category

        cx = MARGIN
        const rowY = doc.y
        doc.font('Regular').fontSize(9).fillColor('#1a1a1a')
        doc.text(catLabel, cx, rowY, { width: colW[0] })
        cx += colW[0]!
        doc.text(`${actual.toFixed(3)}`, cx, rowY, { width: colW[1] })
        cx += colW[1]!
        doc.text(p50 ? `${p50.toFixed(3)}` : '—', cx, rowY, { width: colW[2] })
        cx += colW[2]!
        doc.font('Bold').fillColor(devColor).text(devText, cx, rowY, { width: colW[3] })
        doc.moveDown(0.5)
      }
    }
    footerOnPage(doc, lang, data.orderId)

    // ── Section 4: Funding Eligibility ─────────────────────────
    doc.addPage()
    sectionHeading(doc, t('section4', lang))

    for (const s of data.scenarios) {
      ensureSpace(doc, 60)
      const scenarioName = (T.scenarioNames as Record<string, Record<Lang, string>>)[s.scenarioType]?.[lang] ?? s.scenarioType
      const winStatus = (T.windowStatus as Record<string, Record<Lang, string>>)[s.windowStatus]?.[lang] ?? s.windowStatus
      const elig = (T.eligibility as Record<string, Record<Lang, string>>)[s.eligibility]?.[lang] ?? s.eligibility
      const reasoning = lang === 'LV' ? s.reasoningLv : s.reasoningRu

      doc.font('Bold').fontSize(10).fillColor('#1a1a1a').text(scenarioName, MARGIN, doc.y, { width: PAGE_WIDTH })
      doc.moveDown(0.2)
      doc.font('Regular').fontSize(9).fillColor(MUTED).text(`${winStatus} · ${elig}`, MARGIN, doc.y, { width: PAGE_WIDTH })
      doc.moveDown(0.3)
      doc.font('Regular').fontSize(9).fillColor('#374151').text(reasoning, MARGIN, doc.y, { width: PAGE_WIDTH })
      doc.moveDown(0.8)
    }
    footerOnPage(doc, lang, data.orderId)

    // ── Section 5: Document Checklist ──────────────────────────
    doc.addPage()
    sectionHeading(doc, t('section5', lang))

    const uploadedTypes = new Set(data.documents.map((d) => d.documentType))
    const ALL_DOC_TYPES: Array<keyof typeof T.docTypes> = [
      'ENERGY_CERTIFICATE', 'TECHNICAL_PASSPORT', 'TECHNICAL_INSPECTION',
      'OWNER_LIST', 'ASSOCIATION_DOCUMENTS', 'POWER_OF_ATTORNEY',
      'OWNER_DECISIONS', 'GDPR_CONSENTS',
    ]
    for (const dt of ALL_DOC_TYPES) {
      ensureSpace(doc, 20)
      const present = uploadedTypes.has(dt as BuildingDocumentType)
      const label = T.docTypes[dt][lang]
      const mark = present ? '✓' : '✗'
      const color = present ? SUCCESS : DANGER
      doc.font('Bold').fontSize(11).fillColor(color).text(mark, MARGIN, doc.y, { width: 20, continued: true })
      doc.font('Regular').fontSize(10).fillColor('#1a1a1a').text(` ${label}`, { width: PAGE_WIDTH - 20 })
      doc.moveDown(0.4)
    }
    footerOnPage(doc, lang, data.orderId)

    // ── Section 6: Financing Scenarios ─────────────────────────
    doc.addPage()
    sectionHeading(doc, t('section6', lang))

    const colW6 = [180, 90, 70, 100]
    const headers6 = [T.scenarioColName[lang], T.scenarioColCost[lang], T.scenarioColSubsidy[lang], T.scenarioColMonthly[lang]]
    let cx6 = MARGIN
    doc.font('Bold').fontSize(9).fillColor(MUTED)
    headers6.forEach((h, i) => {
      doc.text(h, cx6, doc.y, { width: colW6[i]!, continued: i < headers6.length - 1 })
      if (i < headers6.length - 1) cx6 += colW6[i]!
    })
    doc.moveDown(0.6)

    for (const s of data.scenarios) {
      ensureSpace(doc, 20)
      const name = (T.scenarioNames as Record<string, Record<Lang, string>>)[s.scenarioType]?.[lang] ?? s.scenarioType
      const cost = s.estimatedCostEur ? `€${Number(s.estimatedCostEur).toLocaleString('lv-LV')}` : '—'
      const subsidy = s.estimatedSubsidyPercent ? `${Math.round(Number(s.estimatedSubsidyPercent) * 100)}%` : '0%'
      const monthly = s.monthlyPaymentPerApartment ? `€${Math.round(Number(s.monthlyPaymentPerApartment))}` : '—'

      cx6 = MARGIN
      const rowY6 = doc.y
      doc.font('Regular').fontSize(9).fillColor('#1a1a1a')
      doc.text(name, cx6, rowY6, { width: colW6[0]! })
      cx6 += colW6[0]!
      doc.text(cost, cx6, rowY6, { width: colW6[1]! })
      cx6 += colW6[1]!
      doc.text(subsidy, cx6, rowY6, { width: colW6[2]! })
      cx6 += colW6[2]!
      doc.text(monthly, cx6, rowY6, { width: colW6[3]! })
      doc.moveDown(0.5)
    }
    footerOnPage(doc, lang, data.orderId)

    // ── Section 7: Decision Plan ────────────────────────────────
    doc.addPage()
    sectionHeading(doc, t('section7', lang))

    const DECISION_ORDER: DecisionType[] = [
      'PREPARATION_DECISION',
      'REPRESENTATIVE_AUTHORIZATION',
      'DATA_COLLECTION_CONSENT',
      'ENERGY_AUDIT_DECISION',
      'PROGRAM_APPLICATION_DECISION',
      'LOAN_DECISION',
      'SUPPLIER_SELECTION_DECISION',
    ]
    const passedTypes = new Set(
      data.decisions
        .filter((d) => d.status === 'COMPLETED')
        .map((d) => d.decisionType)
    )

    DECISION_ORDER.forEach((dt, idx) => {
      ensureSpace(doc, 20)
      const done = passedTypes.has(dt)
      const label = (T.decisionTypes as Record<string, Record<Lang, string>>)[dt]?.[lang] ?? dt
      const statusLabel = done ? T.decisionStatusDone[lang] : T.decisionStatusPending[lang]
      const statusColor = done ? SUCCESS : DANGER
      const numColor = done ? SUCCESS : '#9ca3af'

      doc.font('Bold').fontSize(10).fillColor(numColor).text(`${idx + 1}.`, MARGIN, doc.y, { width: 20, continued: true })
      doc.font('Regular').fontSize(10).fillColor('#1a1a1a').text(` ${label}`, { width: PAGE_WIDTH - 100, continued: true })
      doc.font('Bold').fontSize(9).fillColor(statusColor).text(statusLabel, { width: 80, align: 'right' })
      doc.moveDown(0.5)
    })
    footerOnPage(doc, lang, data.orderId)

    doc.end()
  })
}
