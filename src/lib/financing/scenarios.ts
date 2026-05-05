/**
 * Financing scenario calculations for all 5 scenario types.
 *
 * Each function is a pure, deterministic TypeScript computation — no DB access.
 * The caller is responsible for persisting results to FinancingScenario.
 *
 * Verified facts as of May 2026 (docs/reference/key-facts.md):
 * - ALTUM remonta aizdevums: 3.9%, up to 20 years, open until 2031-06-30
 * - SCF 2026-2032: MK noteikumi expected Q4 2026, applications Q2 2027 — EXPECTED
 * - ALTUM 2021-2027: CLOSED for new applications
 * - Renovation cost benchmark: ~€200-350/m² for full renovation (Latvian market)
 */

import {
  FinancingScenarioType,
  FundingWindowStatus,
  FinancingEligibility,
} from '@prisma/client'

// ─── Types ────────────────────────────────────────────────────

export interface BuildingInput {
  totalAreaM2: number | null
  apartmentCount: number | null
  constructionYear: number | null
  energyClass: string | null
  heatingEnergyKwhM2: number | null
  renovationYear: number | null
}

export interface ScenarioResult {
  scenarioType: FinancingScenarioType
  windowStatus: FundingWindowStatus
  eligibility: FinancingEligibility
  confidence: 'low' | 'medium' | 'high'
  estimatedCostEur: number | null
  estimatedSubsidyPercent: number | null
  estimatedSubsidyEur: number | null
  monthlyPaymentPerApartment: number | null
  paybackYears: number | null
  reasoningLv: string
  reasoningRu: string
}

// ─── Cost estimation ──────────────────────────────────────────
// Benchmark: €200-350/m² for full renovation (Latvian construction market)

function estimateRenovationCost(totalAreaM2: number): number {
  return Math.round(totalAreaM2 * 275) // midpoint €275/m²
}

// ─── Monthly payment calculator (annuity) ────────────────────

function monthlyAnnuityPayment(
  principalEur: number,
  annualRatePercent: number,
  termYears: number
): number {
  const r = annualRatePercent / 100 / 12
  const n = termYears * 12
  if (r === 0) return principalEur / n
  return (principalEur * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

// ─── SCF 2026-2032 ────────────────────────────────────────────

export function computeScfScenario(building: BuildingInput): ScenarioResult {
  const area = building.totalAreaM2
  const energyClass = building.energyClass
  const year = building.constructionYear

  // Eligibility: pre-1991, energy class D-G, not already renovated
  const preDate = year !== null && year < 1991
  const inefficientEnergy = energyClass !== null && ['D', 'E', 'F', 'G'].includes(energyClass)
  const notRenovated = building.renovationYear === null

  let eligibility: FinancingEligibility
  let confidence: 'low' | 'medium' | 'high'
  let reasoningLv: string
  let reasoningRu: string

  if (preDate && inefficientEnergy && notRenovated) {
    eligibility = FinancingEligibility.LIKELY_ELIGIBLE
    confidence = 'medium'
    reasoningLv =
      'Māja atbilst provizoriskajiem kritērijiem: uzbūvēta pirms 1991. gada, zema energoefektivitāte, nav renovēta. Precīzi noteikumi tiks apstiprināti MK noteikumos (paredzams 2026. g. 4. ceturksnī).'
    reasoningRu =
      'Дом соответствует предварительным критериям: построен до 1991 г., низкая энергоэффективность, не реновирован. Точные правила утверждаются MK noteikumi (ожидается Q4 2026).'
  } else if (!preDate || !notRenovated) {
    eligibility = FinancingEligibility.UNLIKELY
    confidence = 'low'
    reasoningLv =
      year !== null && year >= 1991
        ? 'Māja uzbūvēta pēc 1991. gada — SCF primāri paredzēts padomju laikmeta mājām.'
        : 'Māja jau ir renovēta — SCF programma paredzēta nerenovētām mājām.'
    reasoningRu =
      year !== null && year >= 1991
        ? 'Дом построен после 1991 г. — SCF ориентирован на дома советской постройки.'
        : 'Дом уже реновирован — программа SCF предназначена для нереновированных домов.'
  } else {
    eligibility = FinancingEligibility.UNKNOWN
    confidence = 'low'
    reasoningLv =
      'Nepietiek datu provizoriskam novērtējumam. Pasūtiet Gatavības atskaiti pilnam analīzei.'
    reasoningRu =
      'Недостаточно данных для предварительной оценки. Закажите Отчёт о готовности для полного анализа.'
  }

  const estimatedCostEur = area ? estimateRenovationCost(area) : null
  const estimatedSubsidyPercent = 0.49
  const estimatedSubsidyEur = estimatedCostEur
    ? Math.round(estimatedCostEur * estimatedSubsidyPercent)
    : null

  return {
    scenarioType: FinancingScenarioType.SCF_2026_2032,
    windowStatus: FundingWindowStatus.EXPECTED,
    eligibility,
    confidence,
    estimatedCostEur,
    estimatedSubsidyPercent,
    estimatedSubsidyEur,
    monthlyPaymentPerApartment: null,
    paybackYears: null,
    reasoningLv,
    reasoningRu,
  }
}

// ─── ALTUM remonta aizdevums ──────────────────────────────────

export function computeAltumLoanScenario(building: BuildingInput): ScenarioResult {
  const area = building.totalAreaM2
  const aptCount = building.apartmentCount ?? 1

  const estimatedCostEur = area ? estimateRenovationCost(area) : null
  const loanEur = estimatedCostEur

  const monthlyTotal =
    loanEur !== null
      ? monthlyAnnuityPayment(loanEur, 3.9, 20)
      : null
  const monthlyPerApt = monthlyTotal !== null ? Math.round(monthlyTotal / aptCount) : null

  let eligibility: FinancingEligibility
  let confidence: 'low' | 'medium' | 'high'

  if (loanEur !== null && loanEur >= 10000) {
    eligibility = FinancingEligibility.LIKELY_ELIGIBLE
    confidence = 'medium'
  } else if (loanEur === null) {
    eligibility = FinancingEligibility.UNKNOWN
    confidence = 'low'
  } else {
    eligibility = FinancingEligibility.UNLIKELY
    confidence = 'low'
  }

  return {
    scenarioType: FinancingScenarioType.ALTUM_REMONTA_AIZDEVUMS,
    windowStatus: FundingWindowStatus.OPEN,
    eligibility,
    confidence,
    estimatedCostEur,
    estimatedSubsidyPercent: 0,
    estimatedSubsidyEur: 0,
    monthlyPaymentPerApartment: monthlyPerApt,
    paybackYears: 20,
    reasoningLv:
      'ALTUM remonta aizdevums ir atvērts (3,9%, līdz 20 gadiem, pieejams līdz 2031. gada 30. jūnijam). Šis ir galvenais pieejamais ceļš pirms SCF atvēršanas.',
    reasoningRu:
      'ALTUM remonta aizdevums открыт (3,9%, до 20 лет, доступен до 30.06.2031). Это главный доступный путь до открытия SCF.',
  }
}

// ─── Commercial bank ──────────────────────────────────────────

export function computeBankScenario(building: BuildingInput): ScenarioResult {
  const area = building.totalAreaM2
  const aptCount = building.apartmentCount ?? 1

  const estimatedCostEur = area ? estimateRenovationCost(area) : null
  const INDICATIVE_RATE = 5.5

  const monthlyTotal =
    estimatedCostEur !== null
      ? monthlyAnnuityPayment(estimatedCostEur, INDICATIVE_RATE, 20)
      : null
  const monthlyPerApt = monthlyTotal !== null ? Math.round(monthlyTotal / aptCount) : null

  return {
    scenarioType: FinancingScenarioType.COMMERCIAL_BANK,
    windowStatus: FundingWindowStatus.OPEN,
    eligibility: FinancingEligibility.UNKNOWN,
    confidence: 'low',
    estimatedCostEur,
    estimatedSubsidyPercent: 0,
    estimatedSubsidyEur: 0,
    monthlyPaymentPerApartment: monthlyPerApt,
    paybackYears: 20,
    reasoningLv:
      `Komercbankas likme ir orientējoša (~${INDICATIVE_RATE}%). Konkrēts piedāvājums jāapspriež ar banku. Parasti dārgāk nekā ALTUM remonta aizdevums.`,
    reasoningRu:
      `Ставка коммерческого банка ориентировочная (~${INDICATIVE_RATE}%). Конкретное предложение нужно согласовывать с банком. Обычно дороже, чем ALTUM remonta aizdevums.`,
  }
}

// ─── Own fund ─────────────────────────────────────────────────

export function computeOwnFundScenario(building: BuildingInput): ScenarioResult {
  const area = building.totalAreaM2
  const estimatedCostEur = area ? estimateRenovationCost(area) : null
  const aptCount = building.apartmentCount ?? 1
  const MONTHLY_CONTRIBUTION_PER_APT = 15

  const monthsToAccumulate =
    estimatedCostEur !== null
      ? Math.ceil(estimatedCostEur / (MONTHLY_CONTRIBUTION_PER_APT * aptCount))
      : null
  const paybackYears = monthsToAccumulate !== null ? monthsToAccumulate / 12 : null

  return {
    scenarioType: FinancingScenarioType.OWN_FUND,
    windowStatus: FundingWindowStatus.OPEN,
    eligibility: FinancingEligibility.ELIGIBLE,
    confidence: 'high',
    estimatedCostEur,
    estimatedSubsidyPercent: 0,
    estimatedSubsidyEur: 0,
    monthlyPaymentPerApartment: MONTHLY_CONTRIBUTION_PER_APT,
    paybackYears,
    reasoningLv:
      'Pašu uzkrājumu fonds — vienmēr pieejams, bez parādsaistībām. Ierobežots apjoms: piemērots daļējai remontam (jumts, logi, inženiertīkli).',
    reasoningRu:
      'Собственный ремонтный фонд — всегда доступен, без долговой нагрузки. Ограниченный объём: подходит для частичного ремонта (кровля, окна, инженерные сети).',
  }
}

// ─── Mixed scenario ───────────────────────────────────────────

export function computeMixedScenario(building: BuildingInput): ScenarioResult {
  const altum = computeAltumLoanScenario(building)
  const estimatedCostEur = altum.estimatedCostEur

  const altumShare = estimatedCostEur ? Math.round(estimatedCostEur * 0.7) : null
  const ownShare = estimatedCostEur ? Math.round(estimatedCostEur * 0.3) : null

  const altumMonthly =
    altumShare !== null ? monthlyAnnuityPayment(altumShare, 3.9, 20) : null
  const aptCount = building.apartmentCount ?? 1
  const monthlyPerApt =
    altumMonthly !== null ? Math.round(altumMonthly / aptCount) + 5 : null // +€5 own fund

  return {
    scenarioType: FinancingScenarioType.MIXED,
    windowStatus: FundingWindowStatus.OPEN,
    eligibility: FinancingEligibility.LIKELY_ELIGIBLE,
    confidence: 'medium',
    estimatedCostEur,
    estimatedSubsidyPercent: 0,
    estimatedSubsidyEur: 0,
    monthlyPaymentPerApartment: monthlyPerApt,
    paybackYears: 20,
    reasoningLv: `Jauktais scenārijs: ~70% ALTUM remonta aizdevums (€${altumShare?.toLocaleString() ?? '?'}), ~30% pašu uzkrājumi (€${ownShare?.toLocaleString() ?? '?'}). Kad atvērsies SCF, daļu var refinansēt ar grantu.`,
    reasoningRu: `Смешанный сценарий: ~70% ALTUM remonta aizdevums (€${altumShare?.toLocaleString() ?? '?'}), ~30% собственные средства (€${ownShare?.toLocaleString() ?? '?'}). Когда откроется SCF, часть можно рефинансировать грантом.`,
  }
}

// ─── Compute all 5 scenarios ──────────────────────────────────

export function computeAllScenarios(building: BuildingInput): ScenarioResult[] {
  return [
    computeScfScenario(building),
    computeAltumLoanScenario(building),
    computeBankScenario(building),
    computeOwnFundScenario(building),
    computeMixedScenario(building),
  ]
}
