export interface AddressSearchResult {
  id: string
  address: string
  lat: number
  lon: number
  type: string
}

export interface BuildingData {
  id: string
  address: string
  cadastralCode: string
  series: string | null
  constructionYear: number | null
  totalAreaM2: string | null
  apartmentCount: number | null
  energyClass: string | null
  district: string | null
  found: boolean
}

export interface BenchmarkData {
  category: string
  p25: number
  p50: number
  p75: number
  buildingCount: number
}
