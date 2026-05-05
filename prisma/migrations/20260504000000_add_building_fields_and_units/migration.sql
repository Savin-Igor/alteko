-- AlterTable
ALTER TABLE "ApartmentTransaction" ADD COLUMN     "buildingUseCode" TEXT;

-- AlterTable
ALTER TABLE "Building" ADD COLUMN     "bvkbCertDate" TIMESTAMP(3),
ADD COLUMN     "co2KgM2" DECIMAL(65,30),
ADD COLUMN     "heatingEnergyKwhM2" DECIMAL(65,30),
ADD COLUMN     "isPlanAddress" BOOLEAN,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "primaryEnergyKwhM2" DECIMAL(65,30),
ADD COLUMN     "renovationYear" INTEGER;

-- CreateTable
CREATE TABLE "BuildingUnit" (
    "id" TEXT NOT NULL,
    "cadastralCode" TEXT NOT NULL,
    "buildingCadastralCode" TEXT NOT NULL,
    "areaM2" DECIMAL(65,30),
    "floor" INTEGER,
    "roomCount" INTEGER,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuildingUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BuildingUnit_cadastralCode_key" ON "BuildingUnit"("cadastralCode");

-- CreateIndex
CREATE INDEX "BuildingUnit_buildingCadastralCode_idx" ON "BuildingUnit"("buildingCadastralCode");
