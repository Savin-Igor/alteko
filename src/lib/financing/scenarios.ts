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
//
// Issue #111: eligibility uses energy class as primary criterion (F/G = high
// energy consumption ≥125 kWh/m²/year for buildings >250 m², per SCF plan).
// Construction year is a supporting signal, not a gate.
// Issue #115: SCF reasoning includes EU Commission approval disclaimer.

const SCF_EU_DISCLAIMER_LV =
  ' Latvijas SCF plāns pašlaik tiek vērtēts Eiropas Komisijā (mai 2026). Precīzi pieteikuma nosacījumi būs zināmi pēc plāna apstiprināšanas un MK noteikumu publicēšanas (paredzams Q4 2026).'
const SCF_EU_DISCLAIMER_RU =
  ' План Латвии по SCF на оценке Еврокомиссии (май 2026). Точные условия станут известны после одобрения плана и публикации MK noteikumi (ожидается Q4 2026).'

export function computeScfScenario(building: BuildingInput): ScenarioResult {
  const area = building.totalAreaM2
  const energyClass = building.energyClass
  const year = building.constructionYear

  // Primary criterion (issue #111): energy class F or G indicates ≥125 kWh/m²/year,
  // which is the SCF plan's target category (likumi.lv/ta/id/361681, C1.A.I1).
  // D/E class may also be eligible depending on final MK noteikumi.
  const hasLowEnergyClass = energyClass !== null && ['F', 'G'].includes(energyClass)
  const hasMediumLowEnergyClass = energyClass !== null && ['D', 'E'].includes(energyClass)
  const notRenovated = building.renovationYear === null
  // Year is a supporting signal (soviet-era buildings are primary target)
  const sovietEra = year !== null && year < 1991

  let eligibility: FinancingEligibility
  let confidence: 'low' | 'medium' | 'high'
  let reasoningLv: string
  let reasoningRu: string

  if (hasLowEnergyClass && notRenovated) {
    // F/G class: high confidence eligible (primary SCF target)
    eligibility = FinancingEligibility.LIKELY_ELIGIBLE
    confidence = 'medium'
    reasoningLv =
      `Māja ir energoklasē ${energyClass} — tas atbilst SCF primārajam mērķim (ļoti zema energoefektivitāte, nav renovēta).${SCF_EU_DISCLAIMER_LV}`
    reasoningRu =
      `Дом имеет класс энергоэффективности ${energyClass} — это соответствует основной цели SCF (очень низкая энергоэффективность, не реновирован).${SCF_EU_DISCLAIMER_RU}`
  } else if (hasMediumLowEnergyClass && notRenovated && sovietEra) {
    // D/E class + pre-1991: possible but lower confidence
    eligibility = FinancingEligibility.LIKELY_ELIGIBLE
    confidence = 'low'
    reasoningLv =
      `Māja ir energoklasē ${energyClass} un uzbūvēta pirms 1991. gada. Var pretendēt uz SCF atbalstu — precīzāk zināms pēc MK noteikumu publicēšanas.${SCF_EU_DISCLAIMER_LV}`
    reasoningRu =
      `Дом имеет класс ${energyClass} и построен до 1991 г. Может претендовать на SCF — точнее будет известно после публикации MK noteikumi.${SCF_EU_DISCLAIMER_RU}`
  } else if (!notRenovated) {
    eligibility = FinancingEligibility.UNLIKELY
    confidence = 'medium'
    reasoningLv =
      'Māja ir jau renovēta — SCF programma paredzēta nerenovētām mājām ar zemu energoefektivitāti.'
    reasoningRu =
      'Дом уже реновирован — программа SCF предназначена для нереновированных домов с низкой энергоэффективностью.'
  } else if (energyClass !== null && ['A', 'B', 'C'].includes(energyClass)) {
    eligibility = FinancingEligibility.UNLIKELY
    confidence = 'medium'
    reasoningLv =
      `Māja ir energoklasē ${energyClass} — SCF mērķa grupa ir mājas ar F vai G klasi.`
    reasoningRu =
      `Дом имеет класс ${energyClass} — целевая группа SCF — дома класса F или G.`
  } else {
    eligibility = FinancingEligibility.UNKNOWN
    confidence = 'low'
    reasoningLv =
      `Nepietiek datu provizoriskam novērtējumam. Pasūtiet Gatavības atskaiti pilnam analīzei.${SCF_EU_DISCLAIMER_LV}`
    reasoningRu =
      `Недостаточно данных для предварительной оценки. Закажите Отчёт о готовности для полного анализа.${SCF_EU_DISCLAIMER_RU}`
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
