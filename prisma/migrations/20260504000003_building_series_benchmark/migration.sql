-- CreateTable: BuildingSeriesBenchmark
-- Heating energy norms by building series from verified research data
CREATE TABLE "BuildingSeriesBenchmark" (
    "seriesCode" TEXT NOT NULL,
    "heatingKwhM2Year" DECIMAL(65,30) NOT NULL,
    "hotWaterKwhM2Year" DECIMAL(65,30),
    "afterRenovationTargetKwhM2Year" DECIMAL(65,30),
    "sourceDescription" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuildingSeriesBenchmark_pkey" PRIMARY KEY ("seriesCode")
);
