import type { ExpenseCategory } from '@prisma/client'
import type { Anomaly } from '@/lib/benchmarks/anomaly'

type Locale = 'lv' | 'ru'

const QUESTIONS: Record<ExpenseCategory, Record<Locale, string[]>> = {
  HEATING: {
    lv: [
      'Kāds ir ēkas faktiskais siltumenerģijas patēriņš kWh/m² gadā un vai ir veikts energoaudits?',
      'Vai apkures sistēmā ir plānota regulēšana vai hidrauliskā balanšēšana?',
    ],
    ru: [
      'Каков фактический расход тепловой энергии здания в кВт·ч/м² в год и проводился ли энергоаудит?',
      'Предусмотрена ли регулировка или гидравлическая балансировка системы отопления?',
    ],
  },
  COLD_WATER: {
    lv: [
      'Cik procentu aukstā ūdens patēriņa veido koplietošanas zonas (pagrabs, pagalms)?',
      'Vai kopējos cauruļvados ir konstatētas noplūdes un kad tās pēdējo reizi pārbaudītas?',
    ],
    ru: [
      'Какую долю расхода холодной воды составляют общедомовые нужды (подвал, двор)?',
      'Выявлены ли утечки в общих трубопроводах и когда в последний раз проводилась проверка?',
    ],
  },
  HOT_WATER: {
    lv: [
      'Kāds ir karstā ūdens pagatavošanas princips — centralizēts vai individuāls siltummainis?',
      'Vai karstā ūdens cirkulācijas sistēma ir aprīkota ar siltumizolāciju?',
    ],
    ru: [
      'По какому принципу подготавливается горячая вода — централизованно или через индивидуальный теплообменник?',
      'Оснащена ли система циркуляции горячей воды теплоизоляцией?',
    ],
  },
  WASTEWATER: {
    lv: ['Vai notekūdeņu cauruļvadi ir pārbaudīti uz koroziju vai aizsprostojumiem pēdējo 3 gadu laikā?'],
    ru: ['Проверялись ли трубопроводы канализации на коррозию и засоры в последние 3 года?'],
  },
  WASTE: {
    lv: [
      'Kāda ir atkritumu izvešanas periodiskums un vai ir iespēja pārskatīt konteineru apjomu?',
      'Vai mājas iedzīvotāji veic atkritumu šķirošanu, kas samazina kopējo izvešanas apjomu?',
    ],
    ru: [
      'Какова периодичность вывоза мусора и возможно ли пересмотреть объём контейнеров?',
      'Ведётся ли сортировка отходов жильцами, что позволяет снизить общий объём вывоза?',
    ],
  },
  CLEANING: {
    lv: ['Cik bieži tiek uzkoptas kāpņu telpas un koplietošanas zonas — pašu spēkiem vai ārpakalpojums?'],
    ru: ['Как часто убираются лестничные клетки и общие зоны — собственными силами или подрядчиком?'],
  },
  REPAIR_FUND: {
    lv: [
      'Kādam mērķim tiek izmantots remonta fonds un kādi lieli remontdarbi plānoti nākamo 3 gadu laikā?',
      'Vai pašreizējās iemaksas remonta fondā atbilst ēkas nolietojumam un plānotajiem darbiem?',
    ],
    ru: [
      'На какие цели используется ремонтный фонд и какие крупные работы запланированы на ближайшие 3 года?',
      'Соответствует ли размер взносов в ремонтный фонд фактическому износу здания и запланированным работам?',
    ],
  },
  ADMINISTRATION: {
    lv: [
      'Lūdzu, sniedziet administrācijas izmaksu sadalījumu: apsaimniekotāja atlīdzība, uzskaite, apdrošināšana, citi.',
      'Vai ir iespēja iepazīties ar apsaimniekošanas līgumu un salīdzināt tarifu ar tirgus cenām?',
    ],
    ru: [
      'Предоставьте расшифровку административных расходов: вознаграждение управляющего, учёт, страхование, прочее.',
      'Можно ли ознакомиться с договором управления и сравнить тариф с рыночными ценами?',
    ],
  },
  ELEVATOR: {
    lv: ['Kad pēdējo reizi veikta liftu tehniskā apkope un kāda ir nākamās apkopes plānotā izmaksa?'],
    ru: ['Когда последний раз проводилось техническое обслуживание лифтов и какова стоимость следующего планового обслуживания?'],
  },
  OTHER: {
    lv: ['Lūdzu, sniedziet sadalījumu posteņiem kategorijā «Citi» — kas konkrēti tur ietilpst?'],
    ru: ['Предоставьте расшифровку статей категории «Прочее» — что конкретно в неё входит?'],
  },
}

export function generateQuestions(anomalies: Anomaly[], locale: string): string[] {
  const lang: Locale = locale === 'ru' ? 'ru' : 'lv'
  const seen = new Set<ExpenseCategory>()
  const questions: string[] = []

  for (const anomaly of anomalies) {
    if (seen.has(anomaly.category)) continue
    seen.add(anomaly.category)

    const categoryQuestions = QUESTIONS[anomaly.category]?.[lang] ?? []
    questions.push(...categoryQuestions)
  }

  return questions
}
