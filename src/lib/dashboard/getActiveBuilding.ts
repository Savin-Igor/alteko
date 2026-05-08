import { prisma } from '@/lib/prisma'

export interface DashboardBuildingSummary {
  id: string
  cadastralCode: string
  address: string
  series: string | null
  energyClass: string | null
}

/**
 * Resolve which building a board user is operating on.
 *
 * Resolution order:
 *   1. If `requestedCadastralCode` is provided AND the user is associated
 *      with that building, use it.
 *   2. Otherwise pick the most-recently-active building the user is
 *      associated with.
 *
 * Association is the union of:
 *   - apartments owned by the user (`Apartment.ownerId`),
 *   - expense reports uploaded by the user (`ExpenseReport.uploadedBy`).
 *
 * The "most recently active" tie-breaker is the latest expense report
 * upload, falling back to apartment creation.
 *
 * Returns `null` when the user has no associated buildings yet.
 */
export async function listUserBuildings(
  userId: string,
): Promise<DashboardBuildingSummary[]> {
  const ownedBuildings = await prisma.building.findMany({
    where: {
      apartments: { some: { ownerId: userId } },
    },
    select: {
      id: true,
      cadastralCode: true,
      address: true,
      series: true,
      energyClass: true,
    },
  })

  const reportedBuildings = await prisma.building.findMany({
    where: {
      reports: { some: { uploadedBy: userId } },
    },
    select: {
      id: true,
      cadastralCode: true,
      address: true,
      series: true,
      energyClass: true,
    },
  })

  const seen = new Set<string>()
  const merged: DashboardBuildingSummary[] = []

  for (const building of [...ownedBuildings, ...reportedBuildings]) {
    if (seen.has(building.id)) continue
    seen.add(building.id)
    merged.push({
      id: building.id,
      cadastralCode: building.cadastralCode,
      address: building.address,
      series: building.series,
      energyClass: building.energyClass,
    })
  }

  return merged
}

/**
 * Pick the active building for the dashboard.
 *
 * If `requestedCadastralCode` is provided and the user is associated
 * with it, that's the active one. Otherwise fall back to the most
 * recently active building (by latest report upload, then apartment).
 */
export async function getActiveBuilding(
  userId: string,
  requestedCadastralCode?: string,
): Promise<DashboardBuildingSummary | null> {
  const buildings = await listUserBuildings(userId)
  if (buildings.length === 0) return null

  if (requestedCadastralCode) {
    const match = buildings.find((b) => b.cadastralCode === requestedCadastralCode)
    if (match) return match
  }

  // Order by latest activity. Latest report wins; then latest apartment.
  const lastReports = await prisma.expenseReport.groupBy({
    by: ['buildingId'],
    where: {
      uploadedBy: userId,
      buildingId: { in: buildings.map((b) => b.id) },
    },
    _max: { createdAt: true },
  })
  const lastReportByBuilding = new Map<string, Date>()
  for (const row of lastReports) {
    if (row._max.createdAt) lastReportByBuilding.set(row.buildingId, row._max.createdAt)
  }

  const sorted = [...buildings].sort((a, b) => {
    const aTime = lastReportByBuilding.get(a.id)?.getTime() ?? 0
    const bTime = lastReportByBuilding.get(b.id)?.getTime() ?? 0
    return bTime - aTime
  })

  return sorted[0] ?? null
}
