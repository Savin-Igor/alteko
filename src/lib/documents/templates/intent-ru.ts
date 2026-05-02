export interface IntentDocumentData {
  buildingAddress: string
  cadastralCode: string
  totalAreaM2: number
  apartmentCount: number
  currentEnergyClass: string
  estimatedCostMin: number
  estimatedCostMax: number
  subsidyPercent: number
  monthlySavingsPerApt: number
  date: string
}

export function generateIntentRu(data: IntentDocumentData): string {
  return `ЗАЯВЛЕНИЕ О НАМЕРЕНИИ ПРОВЕСТИ ЭНЕРГОЭФФЕКТИВНУЮ РЕНОВАЦИЮ

Дата: ${data.date}

Жилищное товарищество по адресу: ${data.buildingAddress}
Кадастровый номер здания: ${data.cadastralCode}
Общая площадь здания: ${data.totalAreaM2} м²
Количество квартир: ${data.apartmentCount}
Текущий класс энергоэффективности: ${data.currentEnergyClass}

Настоящим уведомляем о намерении провести комплексную энергоэффективную реновацию здания.

ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ:
- Целевой класс энергоэффективности: C
- Ориентировочная стоимость реновации: €${data.estimatedCostMin.toLocaleString()} – €${data.estimatedCostMax.toLocaleString()}
- Субсидия Altum: до ${data.subsidyPercent}% от стоимости реновации
- Экономия на отоплении: ~€${data.monthlySavingsPerApt}/мес. на квартиру

Жилищное товарищество намерено подать заявку на финансирование программы Altum "Daudzdzīvokļu māju siltināšana" и приступить к процессу сбора согласия собственников.

Председатель правления: _______________________

Подпись: _____________________ Дата: ___________

_______________________________________________
Этот документ сгенерирован платформой ALTEKO на основании данных аудита расходов.
`
}
