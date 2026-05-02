// Altum subsidy calculator for building renovation.
// Verified facts (altum.lv, fi-compass.eu, December 2024):
//   - Maximum subsidy: up to 49–50% of eligible renovation costs
//   - Eligible cost range: typically €200–500k for multi-apartment buildings
//   - Co-financing requirement: minimum 50% from building owners
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
  costPerM2Low: 200,              // € estimated renovation cost per m² (lower bound)
  costPerM2High: 400,             // € estimated renovation cost per m² (upper bound)
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
