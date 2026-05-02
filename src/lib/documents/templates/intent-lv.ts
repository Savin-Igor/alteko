import type { IntentDocumentData } from './intent-ru'

export function generateIntentLv(data: IntentDocumentData): string {
  return `NODOMU PIETEIKUMS PAR ENERGOEFEKTĪVO RENOVĀCIJU

Datums: ${data.date}

Dzīvokļu īpašnieku biedrība adresē: ${data.buildingAddress}
Ēkas kadastra apzīmējums: ${data.cadastralCode}
Ēkas kopējā platība: ${data.totalAreaM2} m²
Dzīvokļu skaits: ${data.apartmentCount}
Pašreizējā energoefektivitātes klase: ${data.currentEnergyClass}

Ar šo paziņojam par nodomu veikt ēkas komplekso energoefektīvo renovāciju.

PAREDZAMIE REZULTĀTI:
- Mērķa energoefektivitātes klase: C
- Orientējošās renovācijas izmaksas: €${data.estimatedCostMin.toLocaleString()} – €${data.estimatedCostMax.toLocaleString()}
- Altum subsīdija: līdz ${data.subsidyPercent}% no renovācijas izmaksām
- Apkures ietaupījums: ~€${data.monthlySavingsPerApt}/mēn. uz dzīvokli

Dzīvokļu īpašnieku biedrība plāno iesniegt pieteikumu Altum programmai "Daudzdzīvokļu māju siltināšana" un uzsākt īpašnieku piekrišanas vākšanas procesu.

Valdes priekšsēdētājs: _______________________

Paraksts: _____________________ Datums: ___________

_______________________________________________
Šis dokuments ir sagatavots ar ALTEKO platformu, pamatojoties uz izdevumu audita datiem.
`
}
