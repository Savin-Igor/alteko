/**
 * Building Readiness Score computation.
 *
 * Each component produces a 0-100 integer (or null if data is unavailable).
 * The caller is responsible for persisting the result to BuildingReadinessScore.
 */

import {
  EnergyClass,
  DecisionType,
  CampaignStatus,
  DataConfidence,
  LegalConfidence,
  BuildingDocumentType,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'

// ─── Types ────────────────────────────────────────────────────

export interface ScoreComponents {
  energyScore: number | null
  fundingEligibilityScore: number | null
  documentReadinessScore: number | null
  ownerDecisionReadinessScore: number | null
  financialFeasibilityScore: number | null
  supplierSelectionStatus: string
  legalConfidenceStatus: LegalConfidence
  dataConfidenceStatus: DataConfidence
  procurementTransparencyScore: number | null
  documentCompleteness: number | null
}

// ─── Energy Score ─────────────────────────────────────────────

const ENERGY_CLASS_SCORES: Record<EnergyClass, number> = {
  A: 100,
  B: 85,
  C: 70,
  D: 55,
  E: 40,
  F: 25,
  G: 10,
}

export function computeEnergyScore(energyClass: EnergyClass | null): number | null {
  if (!energyClass) return null
  return ENERGY_CLASS_SCORES[energyClass] ?? null
}

// ─── Document Readiness Score (issue #105) ────────────────────
// Uses actual BuildingDocument checklist, not PDF report count.

const DOCUMENT_CHECKLIST: BuildingDocumentType[] = [
  BuildingDocumentType.ENERGY_CERTIFICATE,
  BuildingDocumentType.TECHNICAL_PASSPORT,
  BuildingDocumentType.TECHNICAL_INSPECTION,
  BuildingDocumentType.OWNER_LIST,
  BuildingDocumentType.ASSOCIATION_DOCUMENTS,
  BuildingDocumentType.POWER_OF_ATTORNEY,
  BuildingDocumentType.OWNER_DECISIONS,
  BuildingDocumentType.GDPR_CONSENTS,
]

export function computeDocumentReadinessScore(uploadedTypes: BuildingDocumentType[]): number {
  const uploadedSet = new Set(uploadedTypes)
  const completed = DOCUMENT_CHECKLIST.filter((t) => uploadedSet.has(t)).length
  return Math.round((completed / DOCUMENT_CHECKLIST.length) * 100)
}

// ─── Owner Decision Readiness Score ──────────────────────────

const MANDATORY_DECISIONS: DecisionType[] = [
  DecisionType.PREPARATION_DECISION,
  DecisionType.REPRESENTATIVE_AUTHORIZATION,
  DecisionType.DATA_COLLECTION_CONSENT,
]

export function computeOwnerDecisionScore(passedDecisionTypes: DecisionType[]): number {
  const passed = passedDecisionTypes.filter((d) => MANDATORY_DECISIONS.includes(d)).length
  return Math.round((passed / MANDATORY_DECISIONS.length) * 100)
}

// ─── Funding Eligibility Score ────────────────────────────────
// Aggregates across FinancingScenario records for the building.
// Returns 0-100: 100 = at least one scenario ELIGIBLE, 50 = LIKELY_ELIGIBLE, etc.

export function computeFundingEligibilityScore(eligibilityValues: string[]): number | null {
  if (eligibilityValues.length === 0) return null
  const WEIGHTS: Record<string, number> = {
    ELIGIBLE: 100,
    LIKELY_ELIGIBLE: 70,
    UNLIKELY: 30,
    NOT_ELIGIBLE: 0,
    UNKNOWN: 20,
  }
  const max = eligibilityValues.reduce((best, e) => Math.max(best, WEIGHTS[e] ?? 0), 0)
  return max
}

// ─── Financial Feasibility Score (issue #106) ─────────────────
// Compare estimated monthly cost per apartment against actual or default
// repair fund contribution.
//
// Fallback: if board hasn't set avgRepairFundEurPerApt, we derive from
// REPAIR_FUND expense items (if available) or use the Latvia-typical
// default of €20/month per apartment.

const LATVIA_DEFAULT_REPAIR_FUND_EUR_PER_APT = 20

export function computeFinancialFeasibilityScore(
  monthlyPaymentPerAptEur: number | null,
  avgRepairFundContributionEur: number | null
): number | null {
  if (monthlyPaymentPerAptEur === null) return null
  const contribution = avgRepairFundContributionEur ?? LATVIA_DEFAULT_REPAIR_FUND_EUR_PER_APT
  if (contribution <= 0) return 50
  const ratio = monthlyPaymentPerAptEur / contribution
  if (ratio <= 1.0) return 100
  if (ratio <= 1.5) return 75
  if (ratio <= 2.0) return 50
  if (ratio <= 3.0) return 25
  return 0
}

// ─── Procurement Transparency Score (issue #107) ──────────────
// Uses actual offer count from RenovationProject.offerCount.

export function computeProcurementTransparencyScore(contractorOfferCount: number): number {
  if (contractorOfferCount >= 5) return 100
  if (contractorOfferCount >= 3) return 80
  if (contractorOfferCount >= 2) return 60
  if (contractorOfferCount === 1) return 30
  return 0
}

// ─── Data Confidence Status (issue #114) ──────────────────────
// Now reads boardVerified / professionalVerified from Building record.

export function deriveDataConfidence(
  hasUploadedReports: boolean,
  boardVerified: boolean,
  professionalVerified: boolean
): DataConfidence {
  if (professionalVerified) return DataConfidence.PROFESSIONAL_VERIFIED
  if (boardVerified) return DataConfidence.BOARD_VERIFIED
  if (hasUploadedReports) return DataConfidence.USER_UPLOADED
  return DataConfidence.PUBLIC_DATA
}

// ─── Main compute function ────────────────────────────────────

export async function computeReadinessScore(buildingId: string): Promise<ScoreComponents> {
  const building = await prisma.building.findUniqueOrThrow({
    where: { id: buildingId },
    include: {
      reports: {
        select: { id: true },
        take: 1,
      },
      scenarios: {
        select: { eligibility: true, monthlyPaymentPerApartment: true },
      },
      decisionCampaigns: {
        where: { status: CampaignStatus.COMPLETED },
        select: { decisionType: true },
      },
      projects: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { status: true, offerCount: true },
      },
      // Issue #105: actual document checklist — exclude expired documents
      documents: {
        where: {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        select: { documentType: true },
      },
    },
  })

  const energyScore = computeEnergyScore(building.energyClass)

  const eligibilityValues = building.scenarios.map((s) => s.eligibility as string)
  const fundingEligibilityScore = computeFundingEligibilityScore(eligibilityValues)

  // Issue #105: use actual document types, not report count
  const uploadedDocumentTypes = building.documents.map((d) => d.documentType)
  const documentReadinessScore = computeDocumentReadinessScore(uploadedDocumentTypes)
  const documentCompleteness = documentReadinessScore

  const passedDecisions = building.decisionCampaigns.map((c) => c.decisionType)
  const ownerDecisionReadinessScore = computeOwnerDecisionScore(passedDecisions)

  // Issue #106: use board-set repair fund or Latvia default (never null)
  const bestScenario = building.scenarios.find(
    (s) => s.eligibility === 'ELIGIBLE' || s.eligibility === 'LIKELY_ELIGIBLE'
  )
  const monthlyPayment = bestScenario?.monthlyPaymentPerApartment
    ? Number(bestScenario.monthlyPaymentPerApartment)
    : null
  const avgRepairFund = building.avgRepairFundEurPerApt
    ? Number(building.avgRepairFundEurPerApt)
    : null
  const financialFeasibilityScore = computeFinancialFeasibilityScore(monthlyPayment, avgRepairFund)

  // Issue #107: use actual offer count from latest project
  const latestProject = building.projects[0]
  const supplierSelectionStatus = latestProject?.status ?? 'NOT_STARTED'
  const offerCount = latestProject?.offerCount ?? 0
  const procurementTransparencyScore = computeProcurementTransparencyScore(offerCount)

  // Issue #114: read actual verification flags from Building
  const hasUploadedReports = building.reports.length > 0
  const dataConfidenceStatus = deriveDataConfidence(
    hasUploadedReports,
    building.boardVerified,
    building.professionalVerified
  )

  const legalConfidenceStatus =
    ownerDecisionReadinessScore === 100 ? LegalConfidence.NEEDS_REVIEW : LegalConfidence.DRAFT

  return {
    energyScore,
    fundingEligibilityScore,
    documentReadinessScore,
    ownerDecisionReadinessScore,
    financialFeasibilityScore,
    supplierSelectionStatus,
    legalConfidenceStatus,
    dataConfidenceStatus,
    procurementTransparencyScore,
    documentCompleteness,
  }
}
