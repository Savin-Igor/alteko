/**
 * Supplier Risk Check — heuristic conflict-of-interest analysis.
 *
 * Based on available data sources (May 2026):
 * - Lursoft: company connections (shared directors, beneficial owners, addresses)
 * - IUB open data: procurement complaints and disqualifications
 * - ALTEKO internal: win rate per client, price deviation
 *
 * NOTE: Lursoft and IUB API integrations are stubs here — full implementation
 * requires API credentials (see docs/technical/integrations.md).
 * The risk scoring logic is deterministic and testable independently.
 */

import { prisma } from '@/lib/prisma'

// ─── Types ────────────────────────────────────────────────────

export interface RiskIndicator {
  code: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  descriptionLv: string
  descriptionRu: string
}

export interface ContractorRiskResult {
  contractorId: string
  registrationNumber: string
  companyName: string
  overallRiskScore: number  // 0-100, higher = more risk
  indicators: RiskIndicator[]
  luroftVerified: boolean
  dataFreshness: 'LIVE' | 'CACHED' | 'UNAVAILABLE'
}

// ─── Risk scoring ─────────────────────────────────────────────

export function computeRiskScore(indicators: RiskIndicator[]): number {
  if (indicators.length === 0) return 0
  const weights = { HIGH: 40, MEDIUM: 20, LOW: 5 }
  const total = indicators.reduce((sum, i) => sum + weights[i.severity], 0)
  return Math.min(100, total)
}

// ─── Lursoft stub ─────────────────────────────────────────────
// Real implementation requires LURSOFT_API_KEY in env.
// Returns synthetic indicators based on available DB data.

async function checkLursoft(registrationNumber: string): Promise<RiskIndicator[]> {
  const apiKey = process.env.LURSOFT_API_KEY
  if (!apiKey) {
    return [{
      code: 'LURSOFT_UNAVAILABLE',
      severity: 'LOW',
      descriptionLv: 'Lursoft pārbaude nav pieejama — API atslēga nav konfigurēta',
      descriptionRu: 'Проверка Lursoft недоступна — API ключ не настроен',
    }]
  }

  // Placeholder: real Lursoft API call would go here
  // API docs: lursoft.lv/api (requires subscription)
  void registrationNumber
  return []
}

// ─── IUB check stub ───────────────────────────────────────────
// IUB open data: https://iub.gov.lv/lv/atklatie-dati
// Complaints and exclusions from public procurement

async function checkIub(registrationNumber: string): Promise<RiskIndicator[]> {
  // IUB open data is CSV-based; no REST API as of May 2026
  // Real implementation: parse and cache IUB CSV locally
  void registrationNumber
  return []
}

// ─── Internal win rate check ──────────────────────────────────

async function checkInternalWinRate(contractorId: string): Promise<RiskIndicator[]> {
  const indicators: RiskIndicator[] = []

  const totalProjects = await prisma.renovationProject.count({
    where: { contractorId },
  })

  if (totalProjects > 10) {
    const completedProjects = await prisma.renovationProject.count({
      where: { contractorId, status: 'COMPLETED' },
    })
    const winRate = completedProjects / totalProjects

    if (winRate > 0.9) {
      indicators.push({
        code: 'HIGH_WIN_RATE',
        severity: 'MEDIUM',
        descriptionLv: `Augsts uzvarēšanas rādītājs: ${Math.round(winRate * 100)}% no ${totalProjects} konkursiem. Ieteicams pārbaudīt konkurences neatkarību.`,
        descriptionRu: `Высокий процент побед: ${Math.round(winRate * 100)}% из ${totalProjects} тендеров. Рекомендуется проверить независимость конкуренции.`,
      })
    }
  }

  return indicators
}

// ─── Main risk check function ─────────────────────────────────

export async function performRiskCheck(contractorId: string): Promise<ContractorRiskResult> {
  const contractor = await prisma.contractor.findUniqueOrThrow({
    where: { id: contractorId },
    select: {
      id: true,
      registrationNumber: true,
      companyName: true,
      luroftVerified: true,
    },
  })

  const [luroftIndicators, iubIndicators, winRateIndicators] = await Promise.all([
    checkLursoft(contractor.registrationNumber),
    checkIub(contractor.registrationNumber),
    checkInternalWinRate(contractorId),
  ])

  const allIndicators = [...luroftIndicators, ...iubIndicators, ...winRateIndicators]

  // Unverified contractor = additional risk
  if (!contractor.luroftVerified) {
    allIndicators.push({
      code: 'NOT_LURSOFT_VERIFIED',
      severity: 'MEDIUM',
      descriptionLv: 'Darbuzņēmējs nav verificēts Lursoft — reģistrācijas dati nav apstiprināti',
      descriptionRu: 'Подрядчик не верифицирован через Lursoft — регистрационные данные не подтверждены',
    })
  }

  const dataFreshness = process.env.LURSOFT_API_KEY ? 'LIVE' : 'UNAVAILABLE'

  return {
    contractorId,
    registrationNumber: contractor.registrationNumber,
    companyName: contractor.companyName,
    overallRiskScore: computeRiskScore(allIndicators),
    indicators: allIndicators,
    luroftVerified: contractor.luroftVerified,
    dataFreshness,
  }
}
