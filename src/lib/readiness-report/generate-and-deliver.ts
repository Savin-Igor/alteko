/**
 * Orchestrator: generate PDF and email it for a paid ReadinessReportOrder.
 *
 * Idempotent — safe to call multiple times:
 * - if reportFileKey && emailSentAt → returns immediately
 * - if reportFileKey set but no emailSentAt → skips PDF, re-sends email
 */

import { prisma } from '@/lib/prisma'
import { uploadFile, buildReadinessReportKey, getPresignedDownloadUrl } from '@/lib/s3'
import { computeReadinessScore } from '@/lib/readiness/score'
import { computeAllScenarios } from '@/lib/financing/scenarios'
import { buildReadinessReportPdf } from '@/lib/pdf/readiness-report'
import { generateNarrative } from '@/lib/readiness-report/narrative'
import { sendReportEmail } from '@/lib/email'
import type { ReportData, ReportExpenseRow, ReportDocument, ReportDecision } from '@/lib/pdf/readiness-report'
import type { EnergyClass, ExpenseCategory, BuildingDocumentType, DecisionType, CampaignStatus } from '@prisma/client'

export async function generateAndDeliverReport(orderId: string): Promise<void> {
  const order = await prisma.readinessReportOrder.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      building: {
        include: {
          scenarios: true,
          decisionCampaigns: true,
          documents: {
            where: {
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
          },
          reports: {
            where: { status: 'PROCESSED' },
            orderBy: { createdAt: 'desc' },
            take: 3,
            include: { items: true },
          },
        },
      },
    },
  })

  const lang = order.language as 'LV' | 'RU'

  // Idempotency guard
  if (order.reportFileKey && order.emailSentAt) return

  let fileKey = order.reportFileKey
  let pdfBuffer: Buffer | null = null

  if (!fileKey) {
    // Compute readiness score (use cached or compute fresh)
    const scoreComponents = await computeReadinessScore(order.building.id)

    // Compute financing scenarios from building data
    const buildingInput = {
      totalAreaM2: order.building.totalAreaM2 ? Number(order.building.totalAreaM2) : null,
      apartmentCount: order.building.apartmentCount,
      constructionYear: order.building.constructionYear,
      energyClass: order.building.energyClass,
      heatingEnergyKwhM2: order.building.heatingEnergyKwhM2
        ? Number(order.building.heatingEnergyKwhM2)
        : null,
      renovationYear: order.building.renovationYear,
    }
    const scenarios = computeAllScenarios(buildingInput)

    // Build expense rows (latest report's items + benchmark p50)
    const expenseRows: ReportExpenseRow[] = []
    const latestReport = order.building.reports[0]
    if (latestReport) {
      const benchmarks = await prisma.benchmarkSegment.findMany({
        where: {
          series: order.building.series ?? '',
          periodYear: latestReport.periodYear,
          periodMonth: latestReport.periodMonth,
        },
      })
      for (const item of latestReport.items) {
        const bench = benchmarks.find((b) => b.category === item.category)
        expenseRows.push({
          category: item.category as ExpenseCategory,
          amountPerM2: item.amountPerM2,
          p50: bench?.p50 ?? null,
        })
      }
    }

    const documents: ReportDocument[] = order.building.documents.map((d) => ({
      documentType: d.documentType as BuildingDocumentType,
    }))

    const decisions: ReportDecision[] = order.building.decisionCampaigns.map((c) => ({
      decisionType: c.decisionType as DecisionType,
      status: c.status as CampaignStatus,
    }))

    // Generate GPT-4o narrative in both languages
    const [narrativeLv, narrativeRu] = await Promise.all([
      generateNarrative(
        {
          address: order.building.address,
          series: order.building.series,
          constructionYear: order.building.constructionYear,
          energyClass: order.building.energyClass as EnergyClass | null,
        },
        scoreComponents,
        'LV'
      ),
      generateNarrative(
        {
          address: order.building.address,
          series: order.building.series,
          constructionYear: order.building.constructionYear,
          energyClass: order.building.energyClass as EnergyClass | null,
        },
        scoreComponents,
        'RU'
      ),
    ])

    const reportData: ReportData = {
      orderId,
      language: lang,
      building: {
        address: order.building.address,
        cadastralCode: order.building.cadastralCode,
        series: order.building.series,
        constructionYear: order.building.constructionYear,
        totalAreaM2: order.building.totalAreaM2,
        apartmentCount: order.building.apartmentCount,
        floorCount: order.building.floorCount,
        energyClass: order.building.energyClass as EnergyClass | null,
        renovationYear: order.building.renovationYear,
        heatingEnergyKwhM2: order.building.heatingEnergyKwhM2,
      },
      scoreComponents,
      scenarios,
      documents,
      decisions,
      expenseRows,
      narrativeLv,
      narrativeRu,
    }

    // Generate PDF buffer
    pdfBuffer = await buildReadinessReportPdf(reportData, lang)

    // Upload to S3
    fileKey = buildReadinessReportKey(orderId, lang)
    await uploadFile(fileKey, pdfBuffer, 'application/pdf')

    // Persist file key
    await prisma.readinessReportOrder.update({
      where: { id: orderId },
      data: { reportFileKey: fileKey },
    })
  }

  // Send email (with PDF attachment)
  if (!order.emailSentAt) {
    // If pdfBuffer wasn't generated this run, download from S3
    if (!pdfBuffer && fileKey) {
      const signedUrl = await getPresignedDownloadUrl(fileKey, 3600)
      const res = await fetch(signedUrl)
      if (!res.ok) throw new Error(`Failed to download PDF from S3: ${res.status}`)
      pdfBuffer = Buffer.from(await res.arrayBuffer())
    }

    if (!pdfBuffer) throw new Error('PDF buffer unavailable for email delivery')

    await sendReportEmail(order.orderedByEmail, lang, pdfBuffer, {
      orderId,
      address: order.building.address,
      cadastralCode: order.building.cadastralCode,
      amountEur: Number(order.amountEur),
    })

    await prisma.readinessReportOrder.update({
      where: { id: orderId },
      data: { emailSentAt: new Date() },
    })
  }
}
