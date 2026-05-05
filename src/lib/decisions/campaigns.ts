/**
 * Decision Campaigns business logic.
 *
 * Handles creation and lifecycle of DecisionCampaign records.
 * BIS export produces a JSON manifest that can be submitted to
 * BIS Mājas lieta manually (direct API integration is out of scope
 * until BIS opens a public API — see docs/technical/integrations.md).
 */

import { prisma } from '@/lib/prisma'
import { DecisionType, CampaignStatus, LegalConfidence } from '@prisma/client'

// ─── Types ────────────────────────────────────────────────────

export interface CreateCampaignInput {
  buildingId: string
  decisionType: DecisionType
  title: string
  questionTextLv: string
  questionTextRu?: string
  explanationTextLv: string
  explanationTextRu?: string
  deadline?: Date
}

export interface RecordIntentionInput {
  campaignId: string
  decision: 'YES' | 'NO' | 'ABSTAIN'
}

export interface BisExportManifest {
  exportedAt: string
  buildingId: string
  campaign: {
    id: string
    decisionType: string
    title: string
    questionTextLv: string
    questionTextRu: string | null
    intentionsYes: number
    intentionsNo: number
    intentionsAbstain: number
    status: string
    deadline: string | null
  }
  instructions: string
}

// ─── Campaign lifecycle ───────────────────────────────────────

export async function createDecisionCampaign(input: CreateCampaignInput) {
  return prisma.decisionCampaign.create({
    data: {
      buildingId: input.buildingId,
      decisionType: input.decisionType,
      title: input.title,
      questionTextLv: input.questionTextLv,
      questionTextRu: input.questionTextRu,
      explanationTextLv: input.explanationTextLv,
      explanationTextRu: input.explanationTextRu,
      deadline: input.deadline,
      status: CampaignStatus.DRAFT,
      legalConfidence: LegalConfidence.DRAFT,
    },
  })
}

export async function activateCampaign(campaignId: string) {
  return prisma.decisionCampaign.update({
    where: { id: campaignId },
    data: { status: CampaignStatus.ACTIVE, intentionsCollected: true },
  })
}

export async function recordIntention(input: RecordIntentionInput) {
  const campaign = await prisma.decisionCampaign.findUniqueOrThrow({
    where: { id: input.campaignId },
  })

  if (campaign.status !== CampaignStatus.ACTIVE) {
    throw new Error('Campaign is not active')
  }

  const increment =
    input.decision === 'YES'
      ? { intentionsYesCount: { increment: 1 } }
      : input.decision === 'NO'
      ? { intentionsNoCount: { increment: 1 } }
      : { intentionsAbstainCount: { increment: 1 } }

  return prisma.decisionCampaign.update({
    where: { id: input.campaignId },
    data: increment,
  })
}

export async function completeCampaign(campaignId: string) {
  return prisma.decisionCampaign.update({
    where: { id: campaignId },
    data: { status: CampaignStatus.COMPLETED },
  })
}

// ─── BIS export ───────────────────────────────────────────────
// Produces a JSON manifest for manual submission to BIS Mājas lieta.
// Direct API integration: not available (BIS has no public API as of May 2026).
// See docs/technical/integrations.md.

export async function generateBisExportManifest(campaignId: string): Promise<BisExportManifest> {
  const campaign = await prisma.decisionCampaign.findUniqueOrThrow({
    where: { id: campaignId },
  })

  const manifest: BisExportManifest = {
    exportedAt: new Date().toISOString(),
    buildingId: campaign.buildingId,
    campaign: {
      id: campaign.id,
      decisionType: campaign.decisionType,
      title: campaign.title,
      questionTextLv: campaign.questionTextLv,
      questionTextRu: campaign.questionTextRu,
      intentionsYes: campaign.intentionsYesCount,
      intentionsNo: campaign.intentionsNoCount,
      intentionsAbstain: campaign.intentionsAbstainCount,
      status: campaign.status,
      deadline: campaign.deadline?.toISOString() ?? null,
    },
    instructions:
      'Upload this manifest to BIS Mājas lieta (bis.gov.lv) manually. ' +
      'Select "Lēmumu pieņemšana" → "Augšupielādēt dokumentus". ' +
      'No direct API integration available as of 2026.',
  }

  await prisma.decisionCampaign.update({
    where: { id: campaignId },
    data: { bisExportedAt: new Date() },
  })

  return manifest
}

// ─── Query helpers ────────────────────────────────────────────

export async function getCampaignsByBuilding(buildingId: string) {
  return prisma.decisionCampaign.findMany({
    where: { buildingId },
    orderBy: { createdAt: 'desc' },
  })
}

export function decisionTypePriority(type: DecisionType): number {
  const ORDER: DecisionType[] = [
    DecisionType.PREPARATION_DECISION,
    DecisionType.REPRESENTATIVE_AUTHORIZATION,
    DecisionType.DATA_COLLECTION_CONSENT,
    DecisionType.ENERGY_AUDIT_DECISION,
    DecisionType.PROGRAM_APPLICATION_DECISION,
    DecisionType.LOAN_DECISION,
    DecisionType.SUPPLIER_SELECTION_DECISION,
  ]
  return ORDER.indexOf(type)
}
