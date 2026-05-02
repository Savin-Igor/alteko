import type { AgendaDocumentData } from './agenda-ru'

export function generateAgendaLv(data: AgendaDocumentData): string {
  return `KOPSAPULCES DARBA KĀRTĪBA

Ēkas adrese: ${data.buildingAddress}
Paredzamais sapulces datums: ${data.meetingDate}
Norises forma: Klātienē / Aptaujas veidā (saskaņā ar Dzīvokļa īpašuma likuma 20. pantu)

═════════════════════════════���═════════════════

1. JAUTĀJUMS. Lēmuma pieņemšana par ēkas energoefektīvo renovāciju.

Informatīvie materiāli:
• Ēkas pašreizējā energoefektivitātes klase
• Orientējošās renovācijas izmaksas: €${data.estimatedCostMin.toLocaleString()} – €${data.estimatedCostMax.toLocaleString()}
• Altum programmas subsīdija: līdz ${data.subsidyPercent}%
• Paredzamais ietaupījums: ~€${data.monthlySavingsPerApt}/mēn. uz dzīvokli
• Paredzamā dzīvokļu vērtības pieaugums: +10–11% (Latvijas Banka, 2025)

Lēmuma projekts:
«${data.buildingAddress} ēkas īpašnieki atbalsta kompleksās energoefektīvās renovācijas veikšanu, piesaistot finansējumu Altum programmai "Daudzdzīvokļu māju siltināšana". Pilnvarot biedrības valdi iesniegt pieteikumu un rīkot iepirkumu starp būvniekiem.»

Lēmums tiek pieņemts ar vienkāršu balsu vairākumu (≥50% no kopējās platības).

═══════════════════════════════════════════════

2. JAUTĀJUMS. Pilnvarotā pārstāvja izvēle sarunām ar Altum.

═══════════════════════════════════════════════

3. JAUTĀJUMS. Citi jautājumi.

_______________________________________________
Dokuments sagatavots ar ALTEKO platformu.
Pieteikumam nepieciešams: vismaz 50% balsu "par" pēc platības + sapulces protokols.
`
}
