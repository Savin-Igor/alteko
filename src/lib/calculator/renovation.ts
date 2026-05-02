// Thermal savings model for building renovation.
// Based on energy class transition (e.g. F → C) and current heating consumption.
// Verified facts:
//   - Average savings after renovation: ~40-60% on heating (ALTUM / fi-compass 2024)
//   - Property value uplift: +10-11% (Latvijas Banka DP 3/2025)

export interface RenovationInput {
  currentHeatingPerM2PerMonth: number   // €/m²/month from audit
  totalAreaM2: number
  currentEnergyClass: string | null     // A-G
  targetEnergyClass?: string            // default: C
  apartmentCount: number
}

export interface RenovationResult {
  currentHeatingMonthly: number         // € total per month
  projectedHeatingMonthly: number       // € total per month after renovation
  monthlySavings: number                // € per month per building
  monthlySavingsPerApt: number          // € per month per average apartment
  annualSavings: number                 // € per year
  efficiencyFactor: number              // multiplier applied to heating cost
}

// Efficiency factors: energy class → fraction of current consumption after renovation to class C
const EFFICIENCY_FACTORS: Record<string, number> = {
  A: 1.0,   // already efficient
  B: 1.0,
  C: 1.0,
  D: 0.75,  // ~25% savings going to C
  E: 0.55,  // ~45% savings
  F: 0.42,  // ~58% savings — matches ALTUM average
  G: 0.35,  // ~65% savings
}

const DEFAULT_TARGET_CLASS = 'C'

export function calculateRenovationSavings(input: RenovationInput): RenovationResult {
  const {
    currentHeatingPerM2PerMonth,
    totalAreaM2,
    currentEnergyClass,
    targetEnergyClass = DEFAULT_TARGET_CLASS,
    apartmentCount,
  } = input

  const sourceClass = currentEnergyClass?.toUpperCase() ?? 'F'
  const targetFactor = EFFICIENCY_FACTORS[targetEnergyClass] ?? 1.0
  const sourceFactor = EFFICIENCY_FACTORS[sourceClass] ?? 0.42

  // How much of baseline heating cost we'll have after renovation
  const efficiencyFactor = targetFactor / sourceFactor

  const currentHeatingMonthly = currentHeatingPerM2PerMonth * totalAreaM2
  const projectedHeatingMonthly = currentHeatingMonthly * efficiencyFactor
  const monthlySavings = currentHeatingMonthly - projectedHeatingMonthly
  const monthlySavingsPerApt = apartmentCount > 0 ? monthlySavings / apartmentCount : monthlySavings

  return {
    currentHeatingMonthly: round2(currentHeatingMonthly),
    projectedHeatingMonthly: round2(projectedHeatingMonthly),
    monthlySavings: round2(monthlySavings),
    monthlySavingsPerApt: round2(monthlySavingsPerApt),
    annualSavings: round2(monthlySavings * 12),
    efficiencyFactor: round2(efficiencyFactor),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
