// Altum subsidy calculator for building renovation.
// Verified facts (altum.lv, fi-compass.eu case study November 2024):
//   - Maximum subsidy: up to 49–50% of eligible renovation costs
//   - Renovation cost per m²: €109–294/m² in completed projects; MoE 2015 ex-ante used €150/m²
//     Adjusted for ~50% construction inflation 2015→2024: typical range €130–300/m²
//   - Total cost per building: avg ~€500k across 624 projects (fi-compass Nov 2024)
//   - Co-financing requirement: minimum 51% from building owners
// Note: Altum program parameters change — these values are configurable below.

export interface AltumInput {
  totalRenovationCost: number     // € estimated total renovation cost
  buildingAreaM2: number
  apartmentCount: number
}

export interface AltumResult {
  subsidyAmount: number           // € covered by Altum
  subsidyPercent: number          // actual % of subsidy
  ownerTotalShare: number         // € owners must cover in total
  ownerSharePerApt: number        // € per average apartment
  paybackYears: number            // years to payback owner share from heating savings
}

// Altum program parameters — update when program rules change
const ALTUM_PARAMS = {
  maxSubsidyPercent: 0.49,        // up to 49% of eligible costs [VERIFIED altum.lv 2024]
  minOwnerPercent: 0.51,          // owners must fund at least 51%
  costPerM2Low: 130,              // € estimated renovation cost per m² (lower bound, large buildings)
  costPerM2High: 300,             // € estimated renovation cost per m² (upper bound, small buildings)
}

export function calculateAltumSubsidy(
  input: AltumInput,
  annualHeatingSavings: number,
): AltumResult {
  const { totalRenovationCost, apartmentCount } = input

  const subsidyAmount = Math.round(totalRenovationCost * ALTUM_PARAMS.maxSubsidyPercent)
  const subsidyPercent = ALTUM_PARAMS.maxSubsidyPercent * 100
  const ownerTotalShare = totalRenovationCost - subsidyAmount
  const ownerSharePerApt = apartmentCount > 0
    ? Math.round(ownerTotalShare / apartmentCount)
    : ownerTotalShare

  const paybackYears = annualHeatingSavings > 0
    ? Math.round((ownerTotalShare / annualHeatingSavings) * 10) / 10
    : 99

  return {
    subsidyAmount,
    subsidyPercent,
    ownerTotalShare,
    ownerSharePerApt,
    paybackYears,
  }
}

export function estimateRenovationCost(buildingAreaM2: number): {
  low: number
  mid: number
  high: number
} {
  return {
    low: Math.round(buildingAreaM2 * ALTUM_PARAMS.costPerM2Low),
    mid: Math.round(buildingAreaM2 * (ALTUM_PARAMS.costPerM2Low + ALTUM_PARAMS.costPerM2High) / 2),
    high: Math.round(buildingAreaM2 * ALTUM_PARAMS.costPerM2High),
  }
}
