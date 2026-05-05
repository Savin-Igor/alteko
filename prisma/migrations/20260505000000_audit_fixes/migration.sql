-- Audit fixes: document checklist, score bugs, GDPR retention, validation
-- Covers issues #105 #106 #107 #109 #114 #117 #119

-- CreateEnum: BuildingDocumentType (issue #105)
CREATE TYPE "BuildingDocumentType" AS ENUM (
  'ENERGY_CERTIFICATE',
  'TECHNICAL_PASSPORT',
  'TECHNICAL_INSPECTION',
  'OWNER_LIST',
  'ASSOCIATION_DOCUMENTS',
  'POWER_OF_ATTORNEY',
  'OWNER_DECISIONS',
  'GDPR_CONSENTS'
);

-- CreateTable: BuildingDocument (issue #105)
CREATE TABLE "BuildingDocument" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "documentType" "BuildingDocumentType" NOT NULL,
    "fileKey" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "BuildingDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BuildingDocument_buildingId_documentType_key" ON "BuildingDocument"("buildingId", "documentType");
CREATE INDEX "BuildingDocument_buildingId_idx" ON "BuildingDocument"("buildingId");

ALTER TABLE "BuildingDocument" ADD CONSTRAINT "BuildingDocument_buildingId_fkey"
  FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: Building — add repair fund, verification flags, owner list tracking
-- (issues #106, #114, #119)
ALTER TABLE "Building"
  ADD COLUMN "avgRepairFundEurPerApt" DECIMAL(65,30),
  ADD COLUMN "boardVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "professionalVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "ownerListUpdatedAt" TIMESTAMP(3),
  ADD COLUMN "ownerListCount" INTEGER;

-- AlterTable: RenovationProject — add offer counter (issue #107)
ALTER TABLE "RenovationProject"
  ADD COLUMN "offerCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: ExpenseReport — add GDPR retention and parse confidence (issues #109, #117)
ALTER TABLE "ExpenseReport"
  ADD COLUMN "rawFileDeletedAt" TIMESTAMP(3),
  ADD COLUMN "parseConfidence" TEXT NOT NULL DEFAULT 'medium';
