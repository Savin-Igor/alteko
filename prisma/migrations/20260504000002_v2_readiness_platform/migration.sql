-- v2 Readiness Platform: new enums, models, and schema changes

-- CreateEnum: FundingWindowStatus
CREATE TYPE "FundingWindowStatus" AS ENUM ('CLOSED', 'EXPECTED', 'OPEN', 'UNKNOWN');

-- CreateEnum: DataConfidence
CREATE TYPE "DataConfidence" AS ENUM ('PUBLIC_DATA', 'USER_UPLOADED', 'BOARD_VERIFIED', 'PROFESSIONAL_VERIFIED');

-- CreateEnum: LegalConfidence
CREATE TYPE "LegalConfidence" AS ENUM ('DRAFT', 'NEEDS_REVIEW', 'VALIDATED');

-- CreateEnum: BuildingProjectStatus
CREATE TYPE "BuildingProjectStatus" AS ENUM ('NOT_READY', 'READY_FOR_LOAN', 'READY_FOR_FUTURE_GRANT', 'IN_APPLICATION', 'APPROVED', 'IN_CONSTRUCTION', 'COMPLETED');

-- CreateEnum: DecisionType
CREATE TYPE "DecisionType" AS ENUM ('PREPARATION_DECISION', 'REPRESENTATIVE_AUTHORIZATION', 'DATA_COLLECTION_CONSENT', 'ENERGY_AUDIT_DECISION', 'PROGRAM_APPLICATION_DECISION', 'LOAN_DECISION', 'SUPPLIER_SELECTION_DECISION');

-- CreateEnum: FinancingScenarioType
CREATE TYPE "FinancingScenarioType" AS ENUM ('SCF_2026_2032', 'ALTUM_REMONTA_AIZDEVUMS', 'COMMERCIAL_BANK', 'OWN_FUND', 'MIXED');

-- CreateEnum: FinancingEligibility
CREATE TYPE "FinancingEligibility" AS ENUM ('ELIGIBLE', 'LIKELY_ELIGIBLE', 'UNLIKELY', 'NOT_ELIGIBLE', 'UNKNOWN');

-- CreateEnum: ContractorSubscriptionTier
CREATE TYPE "ContractorSubscriptionTier" AS ENUM ('NONE', 'BASIC', 'PLUS');

-- AlterEnum: UserRole — add BOARD_MEMBER and PROFESSIONAL
ALTER TYPE "UserRole" ADD VALUE 'BOARD_MEMBER';
ALTER TYPE "UserRole" ADD VALUE 'PROFESSIONAL';

-- AlterTable: Contractor — add subscription fields
ALTER TABLE "Contractor"
  ADD COLUMN "subscriptionTier" "ContractorSubscriptionTier" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "subscriptionStartedAt" TIMESTAMP(3),
  ADD COLUMN "subscriptionExpiresAt" TIMESTAMP(3);

-- AlterTable: RenovationProject — remove commissionAmount
ALTER TABLE "RenovationProject" DROP COLUMN IF EXISTS "commissionAmount";

-- CreateTable: BuildingReadinessScore
CREATE TABLE "BuildingReadinessScore" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "energyScore" INTEGER,
    "fundingEligibilityScore" INTEGER,
    "documentReadinessScore" INTEGER,
    "ownerDecisionReadinessScore" INTEGER,
    "financialFeasibilityScore" INTEGER,
    "supplierSelectionStatus" TEXT,
    "legalConfidenceStatus" "LegalConfidence" NOT NULL DEFAULT 'DRAFT',
    "dataConfidenceStatus" "DataConfidence" NOT NULL DEFAULT 'PUBLIC_DATA',
    "nextBestAction" TEXT NOT NULL,
    "nextBestActionRu" TEXT,
    "procurementTransparencyScore" INTEGER,
    "supplierConflictRisk" INTEGER,
    "decisionQuality" INTEGER,
    "ownerUnderstandingScore" INTEGER,
    "documentCompleteness" INTEGER,
    "priceBenchmarkDeviation" DECIMAL(65,30),
    "rulesEngineVersion" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "BuildingReadinessScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable: FinancingScenario
CREATE TABLE "FinancingScenario" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "scenarioType" "FinancingScenarioType" NOT NULL,
    "windowStatus" "FundingWindowStatus" NOT NULL,
    "eligibility" "FinancingEligibility" NOT NULL,
    "confidence" TEXT NOT NULL,
    "estimatedCostEur" DECIMAL(65,30),
    "estimatedSubsidyPercent" DECIMAL(65,30),
    "estimatedSubsidyEur" DECIMAL(65,30),
    "monthlyPaymentPerApartment" DECIMAL(65,30),
    "paybackYears" DECIMAL(65,30),
    "reasoningLv" TEXT NOT NULL,
    "reasoningRu" TEXT,
    "rulesEngineVersion" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancingScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable: DecisionCampaign
CREATE TABLE "DecisionCampaign" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "decisionType" "DecisionType" NOT NULL,
    "title" TEXT NOT NULL,
    "questionTextLv" TEXT NOT NULL,
    "questionTextRu" TEXT,
    "explanationTextLv" TEXT NOT NULL,
    "explanationTextRu" TEXT,
    "intentionsCollected" BOOLEAN NOT NULL DEFAULT false,
    "intentionsYesCount" INTEGER NOT NULL DEFAULT 0,
    "intentionsNoCount" INTEGER NOT NULL DEFAULT 0,
    "intentionsAbstainCount" INTEGER NOT NULL DEFAULT 0,
    "formalCampaignId" TEXT,
    "bisExportedAt" TIMESTAMP(3),
    "bisExportRef" TEXT,
    "legalConfidence" "LegalConfidence" NOT NULL DEFAULT 'DRAFT',
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ReadinessReportOrder
CREATE TABLE "ReadinessReportOrder" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "orderedByEmail" TEXT NOT NULL,
    "orderedByUserId" TEXT,
    "amountEur" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "paymentProviderRef" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "reportFileKey" TEXT,
    "emailSentAt" TIMESTAMP(3),
    "language" "Language" NOT NULL DEFAULT 'LV',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "ReadinessReportOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable: RulesEngineVersion
CREATE TABLE "RulesEngineVersion" (
    "version" TEXT NOT NULL,
    "scenarioType" "FinancingScenarioType" NOT NULL,
    "rulesJson" JSONB NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveUntil" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT,

    CONSTRAINT "RulesEngineVersion_pkey" PRIMARY KEY ("version")
);

-- Unique constraints
CREATE UNIQUE INDEX "BuildingReadinessScore_buildingId_key" ON "BuildingReadinessScore"("buildingId");
CREATE UNIQUE INDEX "FinancingScenario_buildingId_scenarioType_key" ON "FinancingScenario"("buildingId", "scenarioType");
CREATE UNIQUE INDEX "DecisionCampaign_formalCampaignId_key" ON "DecisionCampaign"("formalCampaignId");

-- Indexes
CREATE INDEX "BuildingReadinessScore_buildingId_idx" ON "BuildingReadinessScore"("buildingId");
CREATE INDEX "FinancingScenario_buildingId_idx" ON "FinancingScenario"("buildingId");
CREATE INDEX "FinancingScenario_scenarioType_idx" ON "FinancingScenario"("scenarioType");
CREATE INDEX "DecisionCampaign_buildingId_idx" ON "DecisionCampaign"("buildingId");
CREATE INDEX "DecisionCampaign_decisionType_idx" ON "DecisionCampaign"("decisionType");
CREATE INDEX "ReadinessReportOrder_buildingId_idx" ON "ReadinessReportOrder"("buildingId");
CREATE INDEX "ReadinessReportOrder_orderedByEmail_idx" ON "ReadinessReportOrder"("orderedByEmail");
CREATE INDEX "RulesEngineVersion_scenarioType_effectiveFrom_idx" ON "RulesEngineVersion"("scenarioType", "effectiveFrom");

-- AddForeignKey: BuildingReadinessScore → Building
ALTER TABLE "BuildingReadinessScore" ADD CONSTRAINT "BuildingReadinessScore_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: FinancingScenario → Building
ALTER TABLE "FinancingScenario" ADD CONSTRAINT "FinancingScenario_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: DecisionCampaign → Building
ALTER TABLE "DecisionCampaign" ADD CONSTRAINT "DecisionCampaign_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: DecisionCampaign → VotingCampaign (optional formal campaign)
ALTER TABLE "DecisionCampaign" ADD CONSTRAINT "DecisionCampaign_formalCampaignId_fkey" FOREIGN KEY ("formalCampaignId") REFERENCES "VotingCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: ReadinessReportOrder → Building
ALTER TABLE "ReadinessReportOrder" ADD CONSTRAINT "ReadinessReportOrder_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
