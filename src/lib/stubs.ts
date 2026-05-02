// Stub data for local development without real API keys.
// Activated when STUB_MODE=true in .env.local

export const IS_STUB = process.env.STUB_MODE === 'true'

// ─── Address search results ──────────────────────────────────────────────────

export const STUB_ADDRESS_SUGGESTIONS = [
  { id: 'stub-s1', address: 'Brīvības iela 55, Rīga',          lat: 56.9470, lon: 24.1219 },
  { id: 'stub-s2', address: 'Mārupes iela 12, Imanta, Rīga',   lat: 56.9330, lon: 24.0370 },
  { id: 'stub-s3', address: 'Ķengaraga iela 1, Pļavnieki, Rīga', lat: 56.9100, lon: 24.1780 },
]

// ─── Buildings (match addresses above) ──────────────────────────────────────

export const STUB_BUILDINGS = [
  {
    cadastralCode:    '0100-000-0001',
    address:          'Brīvības iela 55, Rīga',
    series:           '119',
    constructionYear: 1975,
    totalAreaM2:      5400,
    apartmentCount:   72,
    energyClass:      'D' as const,
    district:         'Vidzemes priekšpilsēta',
    lat:              56.9470,
    lon:              24.1219,
  },
  {
    cadastralCode:    '0100-000-0002',
    address:          'Mārupes iela 12, Imanta, Rīga',
    series:           '467',
    constructionYear: 1982,
    totalAreaM2:      3600,
    apartmentCount:   48,
    energyClass:      'E' as const,
    district:         'Ziemeļu rajons',
    lat:              56.9330,
    lon:              24.0370,
  },
  {
    cadastralCode:    '0100-000-0003',
    address:          'Ķengaraga iela 1, Pļavnieki, Rīga',
    series:           '103',
    constructionYear: 1968,
    totalAreaM2:      2800,
    apartmentCount:   36,
    energyClass:      'F' as const,
    district:         'Latgales priekšpilsēta',
    lat:              56.9100,
    lon:              24.1780,
  },
]

export function stubBuildingForAddress(address: string) {
  const normalized = address.toLowerCase()
  return (
    STUB_BUILDINGS.find((b) => normalized.includes(b.address.split(',')[0].toLowerCase())) ??
    STUB_BUILDINGS[0]
  )
}

// ─── Parsed bill (returned instead of calling OpenAI) ────────────────────────

export const STUB_PARSED_BILL = {
  periodYear:      new Date().getFullYear(),
  periodMonth:     new Date().getMonth() === 0 ? 12 : new Date().getMonth(),
  buildingAddress: 'Brīvības iela 55, Rīga',
  totalAreaM2:     5400,
  apartmentCount:  72,
  parseConfidence: 'HIGH' as const,
  notes:           null,
  items: [
    { category: 'HEATING',        rawLabel: 'Siltumenerģija',        amountTotal: 9828,  amountPerM2: 1.82,  amountPerApt: 136.50, unit: 'EUR' },
    { category: 'HOT_WATER',      rawLabel: 'Karstais ūdens',        amountTotal: 1850,  amountPerM2: 0.342, amountPerApt: 25.69,  unit: 'EUR' },
    { category: 'COLD_WATER',     rawLabel: 'Aukstais ūdens',        amountTotal: 760,   amountPerM2: 0.141, amountPerApt: 10.55,  unit: 'EUR' },
    { category: 'WASTEWATER',     rawLabel: 'Kanalizācija',          amountTotal: 540,   amountPerM2: 0.100, amountPerApt: 7.50,   unit: 'EUR' },
    { category: 'WASTE',          rawLabel: 'Atkritumi',             amountTotal: 325,   amountPerM2: 0.060, amountPerApt: 4.51,   unit: 'EUR' },
    { category: 'CLEANING',       rawLabel: 'Uzkopšana',             amountTotal: 1782,  amountPerM2: 0.330, amountPerApt: 24.75,  unit: 'EUR' },
    { category: 'REPAIR_FUND',    rawLabel: 'Remonta uzkrājums',     amountTotal: 2268,  amountPerM2: 0.420, amountPerApt: 31.50,  unit: 'EUR' },
    { category: 'ADMINISTRATION', rawLabel: 'Administrēšana',        amountTotal: 1026,  amountPerM2: 0.190, amountPerApt: 14.25,  unit: 'EUR' },
  ],
}

// ─── Benchmark result (returned when real benchmark has insufficient data) ───

export const STUB_BENCHMARK = {
  overallDeviationPct: 43,
  categories: [
    { category: 'HEATING',        value: 1.82,  p25: 0.95,  p50: 1.09,  p75: 1.45,  deviationPct: 67,  buildingCount: 85, hasEnoughData: true },
    { category: 'HOT_WATER',      value: 0.342, p25: 0.25,  p50: 0.289, p75: 0.340, deviationPct: 18,  buildingCount: 85, hasEnoughData: true },
    { category: 'COLD_WATER',     value: 0.141, p25: 0.12,  p50: 0.135, p75: 0.155, deviationPct: 4,   buildingCount: 85, hasEnoughData: true },
    { category: 'WASTEWATER',     value: 0.100, p25: 0.08,  p50: 0.095, p75: 0.115, deviationPct: 5,   buildingCount: 85, hasEnoughData: true },
    { category: 'WASTE',          value: 0.060, p25: 0.05,  p50: 0.058, p75: 0.075, deviationPct: 3,   buildingCount: 85, hasEnoughData: true },
    { category: 'CLEANING',       value: 0.330, p25: 0.19,  p50: 0.231, p75: 0.280, deviationPct: 43,  buildingCount: 85, hasEnoughData: true },
    { category: 'REPAIR_FUND',    value: 0.420, p25: 0.35,  p50: 0.390, p75: 0.450, deviationPct: 8,   buildingCount: 85, hasEnoughData: true },
    { category: 'ADMINISTRATION', value: 0.190, p25: 0.17,  p50: 0.200, p75: 0.240, deviationPct: -5,  buildingCount: 85, hasEnoughData: true },
  ],
  segmentInfo: {
    series:      '119',
    district:    'Vidzemes priekšpilsēta',
    areaRange:   'LARGE',
    periodYear:  new Date().getFullYear(),
    periodMonth: new Date().getMonth() === 0 ? 12 : new Date().getMonth(),
  },
}
