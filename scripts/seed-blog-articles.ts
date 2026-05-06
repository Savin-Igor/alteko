/**
 * Seed script: create articles 4-10 in Payload CMS with LV and RU locales.
 * Articles 1-3 were migrated earlier — this script skips existing slugs.
 *
 * Run:
 *   npx tsx scripts/seed-blog-articles.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'

// ─── Lexical JSON builders ────────────────────────────────────────────────────

type TextFormat = 0 | 1 | 2 | 8 | 16

interface TextNode {
  type: 'text'
  text: string
  format: TextFormat
  detail: 0
  mode: 'normal'
  style: ''
  version: 1
}

interface ParagraphNode {
  type: 'paragraph'
  children: TextNode[]
  direction: 'ltr'
  format: ''
  indent: 0
  version: 1
}

interface HeadingNode {
  type: 'heading'
  tag: 'h2' | 'h3'
  children: TextNode[]
  direction: 'ltr'
  format: ''
  indent: 0
  version: 1
}

interface ListItemNode {
  type: 'listitem'
  value: number
  children: TextNode[]
  direction: 'ltr'
  format: ''
  indent: 0
  version: 1
}

interface ListNode {
  type: 'list'
  listType: 'bullet' | 'number'
  tag: 'ul' | 'ol'
  start: 1
  children: ListItemNode[]
  direction: 'ltr'
  format: ''
  indent: 0
  version: 1
}

interface BlockNode {
  type: 'block'
  version: 2
  format: ''
  fields: Record<string, unknown>
}

type ContentNode = ParagraphNode | HeadingNode | ListNode | BlockNode

function txt(text: string, format: TextFormat = 0): TextNode {
  return { type: 'text', text, format, detail: 0, mode: 'normal', style: '', version: 1 }
}

function bold(text: string): TextNode {
  return txt(text, 1)
}

function p(...children: TextNode[]): ParagraphNode {
  return { type: 'paragraph', children, direction: 'ltr', format: '', indent: 0, version: 1 }
}

function h2(text: string): HeadingNode {
  return { type: 'heading', tag: 'h2', children: [txt(text)], direction: 'ltr', format: '', indent: 0, version: 1 }
}

function h3(text: string): HeadingNode {
  return { type: 'heading', tag: 'h3', children: [txt(text)], direction: 'ltr', format: '', indent: 0, version: 1 }
}

function ul(items: Array<TextNode | TextNode[]>): ListNode {
  return {
    type: 'list',
    listType: 'bullet',
    tag: 'ul',
    start: 1,
    children: items.map((item, i) => ({
      type: 'listitem' as const,
      value: i + 1,
      children: Array.isArray(item) ? item : [item],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0 as const,
      version: 1 as const,
    })),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

function calloutBlock(type: 'info' | 'warning' | 'success', title: string, body: string): BlockNode {
  return {
    type: 'block',
    version: 2,
    format: '',
    fields: { blockType: 'callout', type, title, body },
  }
}

function statsBlock(rows: Array<{ label: string; value: string; color?: string }>): BlockNode {
  return {
    type: 'block',
    version: 2,
    format: '',
    fields: {
      blockType: 'stats-table',
      rows: rows.map((r) => ({ label: r.label, value: r.value, color: r.color ?? 'default' })),
    },
  }
}

function ctaBlock(label: string, href: string, note?: string): BlockNode {
  return {
    type: 'block',
    version: 2,
    format: '',
    fields: { blockType: 'inline-cta', label, href, ...(note ? { note } : {}) },
  }
}

function lexical(children: ContentNode[]) {
  return {
    root: {
      type: 'root',
      children: children.length > 0 ? children : [p(txt(''))],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// ─── Article data ─────────────────────────────────────────────────────────────

interface ArticleData {
  slug: string
  readMinutes: number
  publishedAt: string
  lv: { title: string; description: string; content: ReturnType<typeof lexical>; tags: string[] }
  ru: { title: string; description: string; content: ReturnType<typeof lexical>; tags: string[] }
}

const ARTICLES: ArticleData[] = [
  // ── Article 4: kak-chitat-schet-kommunalka ──────────────────────────────────
  {
    slug: 'kak-chitat-schet-kommunalka',
    readMinutes: 7,
    publishedAt: '2025-05-06',
    lv: {
      title: 'Kā lasīt komunālo rēķinu: visu rindu skaidrojums',
      description: 'Kas ir paslēpts katrā komunālā rēķina rindā, kā apsaimniekotājs aprēķina normu un ko darīt, ja rēķins ir pārāk liels.',
      tags: ['izdevumi', 'audits'],
      content: lexical([
        p(txt('Lielākā daļa daudzdzīvokļu māju iedzīvotāju Latvijā saņem rēķinu uz 1–2 lapām, pilnībā nesaprotot, kas tajā rakstīts. Taču tieši šajās rindās slēpjas informācija par to, cik daudz patiesībā tērē jūsu māja.')),
        h2('Kas ir rēķinā: rindu karte'),
        p(txt('Tipisks apsaimniekotāja (Namsaimnieks, RNP, Latio vai cita) rēķins satur septiņas līdz desmit rindas:')),
        statsBlock([
          { label: 'Apkure', value: '40–55% no rēķina', color: 'danger' },
          { label: 'Karstais ūdens', value: '20–30% no rēķina' },
          { label: 'Aukstais ūdens + kanalizācija', value: '8–12% no rēķina' },
          { label: 'Apsaimniekošana', value: '5–10% no rēķina' },
          { label: 'Remonta fonds', value: '3–7% no rēķina' },
          { label: 'Lifts', value: '2–5% no rēķina' },
          { label: 'Uzkopšana', value: '2–4% no rēķina' },
        ]),
        h2('Apkure — lielākā un necaurspīdīgākā rinda'),
        p(txt('Rinda "Apkure" parasti ir lielākā rēķinā un vienlaikus visgrūtāk saprotamā. Apsaimniekotājs sadala starp dzīvokļiem visas mājas kopējo siltumenerģiju pēc skaitītāja datiem.')),
        p(txt('Aprēķins tiek veikts proporcionāli — pēc dzīvokļa platības vai pēc dzīvokļa siltuma skaitītāju rādījumiem (ja tie uzstādīti). Jūs maksājat par kopīgā mājas patēriņa daļu, nevis tikai par "savu" siltumu.')),
        h2('Kā apsaimniekotājs aprēķina "normu"'),
        p(txt('Apsaimniekotājs aprēķina apkures tarifu pēc formulas: kopīgais mājas patēriņš (kWh vai Gcal) × siltuma piegādātāja tarifs ÷ kopējā dzīvokļu platība. SPRK regulē siltuma piegādātāja tarifu un publicē to savā tīmekļa vietnē.')),
        p(txt('Problēma nav tarifā — tas ir vienāds visiem. Problēma ir patērētā siltuma daudzumā. Slikti siltināta māja patērē 2–3 reizes vairāk nekā labi siltināta pie tādiem pašiem ārējiem apstākļiem.')),
        h2('Sarkanie karogi: kad rēķins noteikti ir pārāk liels'),
        ul([
          [bold('Apkure > €1,50/m²/mēn.'), txt(' siltumsezonā sērijas 119 vai 602 mājām — virs vidējā Rīgā.')],
          [bold('Nav ITP (individuālā siltummezgla).'), txt(' Bez ITP māja nesaregulē siltuma piegādi pēc laika apstākļiem.')],
          [bold('Starpība starp dzīvokļiem > 30%.'), txt(' Ja jūsu dzīvoklis maksā ievērojami vairāk — visticamāk, tas ir stūra vai gala dzīvoklis.')],
          [bold('Remonta fonds netiek izmantots.'), txt(' Jautājiet valdei par uzkrājuma stāvokli un izmantošanu.')],
        ]),
        ctaBlock('Augšupielādēt rēķinu →', '/#hero', 'Salīdzināsim ar normu jūsu sērijai un parādīsim, kur pārmaksā.'),
        h2('Avoti'),
        ul([
          [txt('sprk.gov.lv — siltumapgādes tarifi Latvijas reģionos')],
          [txt('altum.lv — daudzdzīvokļu māju siltuma patēriņa normas')],
        ]),
      ]),
    },
    ru: {
      title: 'Как читать счёт за коммуналку: разбор всех строк',
      description: 'Что скрыто в каждой строке коммунального счёта, как управляющая компания считает «норму», когда счёт точно завышен и как проверить свои расходы.',
      tags: ['расходы', 'аудит'],
      content: lexical([
        p(txt('Большинство жителей советских домов в Латвии получают счёт на 1–2 страницах, не вполне понимая, что в нём написано. Тем не менее именно в этих строках скрыта информация о том, сколько реально тратит ваш дом и где деньги уходят впустую.')),
        h2('Что вообще в счёте: карта статей'),
        p(txt('Типичный счёт от управляющей компании (Namsaimnieks, RNP, Latio или другой) содержит от семи до десяти строк:')),
        statsBlock([
          { label: 'Apkure / Отопление', value: '40–55% счёта', color: 'danger' },
          { label: 'Karstais ūdens / Горячая вода', value: '20–30% счёта' },
          { label: 'Aukstais ūdens / Холодная вода + канализация', value: '8–12% счёта' },
          { label: 'Apsaimniekošana / Управление', value: '5–10% счёта' },
          { label: 'Remonta fonds / Фонд ремонта', value: '3–7% счёта' },
          { label: 'Lifts / Лифт', value: '2–5% счёта' },
          { label: 'Uzkopšana / Уборка', value: '2–4% счёта' },
        ]),
        h2('Отопление — самая большая и непрозрачная статья'),
        p(txt('Строка «Apkure» — обычно самая крупная в счёте и одновременно самая сложная для понимания. Управляющая компания распределяет между квартирами теплоэнергию, потреблённую всем домом по счётчику.')),
        p(txt('Расчёт идёт пропорционально: по площади квартиры или по показаниям квартирных теплосчётчиков (если они установлены). Вы платите за долю общедомового потребления, а не только за «своё» тепло.')),
        h2('Как управляющая компания считает «норму»'),
        p(txt('Управляющая компания рассчитывает тариф за отопление по формуле: общее потребление дома (в кВт·ч или Гкал) × тариф поставщика тепла ÷ общая площадь квартир. Тариф поставщика тепла регулируется SPRK и публикуется на их сайте.')),
        p(txt('Проблема не в тарифе — он одинаков для всех. Проблема в количестве потреблённого тепла. Плохо утеплённый дом потребляет в 2–3 раза больше нормально утеплённого при тех же внешних условиях.')),
        h2('Красные флаги: когда счёт точно завышен'),
        ul([
          [bold('Отопление > €1,50/м²/мес.'), txt(' в сезон для домов серии 119 или 602 — выше среднего по Риге.')],
          [bold('Нет ИТП.'), txt(' Без индивидуального теплового пункта дом не регулирует подачу тепла по погоде.')],
          [bold('Разрыв между квартирами > 30%.'), txt(' Если ваша квартира платит значительно больше соседней — вероятно, угловая или торцевая.')],
          [bold('Фонд ремонта не используется.'), txt(' Уточните у правления бiedrībiы о состоянии фонда.')],
        ]),
        ctaBlock('Загрузить счёт →', '/#hero', 'Сравним с нормой для вашей серии и покажем, где переплата.'),
        h2('Источники'),
        ul([
          [txt('sprk.gov.lv — тарифы на теплоснабжение по регионам Латвии')],
          [txt('altum.lv — нормы теплопотребления МКД')],
        ]),
      ]),
    },
  },

  // ── Article 5: zhizn-do-i-posle-renovacii ───────────────────────────────────
  {
    slug: 'zhizn-do-i-posle-renovacii',
    readMinutes: 8,
    publishedAt: '2025-05-13',
    lv: {
      title: 'Dzīve pirms un pēc renovācijas: reālie skaitļi Latvijā',
      description: 'Cik patiesībā ietaupa iedzīvotāji pēc daudzdzīvokļu mājas renovācijas Latvijā: dati par 624 mājām, dzīvokļu vērtības pieaugums un praksē redzamie rezultāti.',
      tags: ['renovācija', 'ietaupījums'],
      content: lexical([
        p(txt('"Pēc renovācijas būs lētāk" — to ir dzirdējis katrs. Bet cik lētāk? Vai atmaksāsies 10–15 gadu maksājumi? Vai dzīvokļa cena pieaugs? Atbildes ir — Latvijas renovācijas programma darbojas kopš 2014. gada un ir uzkrāti pietiekami dati.')),
        calloutBlock('success', 'Galvenie skaitļi', 'Siltumenerģijas patēriņa samazinājums: −58% | CO₂ ietaupījums: 24 000 t/gadā (624 mājas) | Dzīvokļu vērtības pieaugums: +10–11%'),
        h2('Ko maina renovācija'),
        p(txt('Daudzdzīvokļu mājas renovācija — tas ir komplekss modernizācijas pasākums: fasādes un jumta siltināšana, logu nomaiņa kāpņutelpās, individuālā siltummezgla (ISM) uzstādīšana, inženiersistēmu atjaunošana. Rezultāts izpaužas četros līmeņos:')),
        statsBlock([
          { label: 'Siltumenerģijas ietaupījums', value: '−50–60%', color: 'success' },
          { label: 'Vidējais ietaupījums mēnesī uz dzīvokli', value: '€100–150', color: 'success' },
          { label: 'Dzīvokļa vērtības pieaugums', value: '+10–11%', color: 'success' },
          { label: 'CO₂ ietaupījums (624 mājas)', value: '−24 000 t/gadā' },
        ]),
        h2('Dati par 624 mājām: −60% apkurei'),
        p(txt('ERAF 2014–2020 perioda laikā Latvijā tika renovētas 624 daudzdzīvokļu mājas ar ALTUM un ERAF atbalstu. Vidējais rezultāts portfelim:')),
        calloutBlock('info', '128 → 54 kWh/m²/gadā', 'Vidējais siltumenerģijas patēriņa samazinājums: −58%. Avots: fi-compass.eu, ALTUM intervija, 2024. gada decembris.'),
        h2('Ko tas nozīmē naudā'),
        p(txt('Tipiska 119. sērijas māja Rīgā pirms renovācijas apkurei tērē €1,40–2,20/m²/mēn. siltumsezonā. 50 m² dzīvoklim tas ir €70–110 mēnesī tikai par siltumu.')),
        statsBlock([
          { label: '40 m² dzīvoklis — pirms', value: '€56–88/mēn.', color: 'danger' },
          { label: '40 m² dzīvoklis — pēc', value: '€26–40/mēn.', color: 'success' },
          { label: '50 m² dzīvoklis — pirms', value: '€70–110/mēn.', color: 'danger' },
          { label: '50 m² dzīvoklis — pēc', value: '€33–50/mēn.', color: 'success' },
        ]),
        h2('Dzīvokļu vērtības pieaugums: +10–11%'),
        p(txt('Latvijas Bankas pētījums (DP 3/2025) parādīja: renovētu māju dzīvokļi vidēji maksā par 10–11% vairāk nekā līdzīgi nenovērtētos namos. Avots: Latvijas Banka DP 3/2025.')),
        h2('Ko atcerēties: līdz gadam remontdarbu'),
        p(txt('Reāls trūkums, ko min iedzīvotāji: renovācija ilgst no dažiem mēnešiem līdz gadam. Sastatnes, troksnis, putekļi, ierobežota piekļuve balkoniem. Pārvākties uz šo laiku praktiski nav iespējams. Tomēr lielākā daļa renovēto māju iedzīvotāju aptaujās renovācijas lēmumu vērtē pozitīvi.')),
        ctaBlock('Pārbaudīt mājas gatavību →', '/#hero', 'Ievadiet adresi — parādīsim pašreizējo stāvokli un ko darīt renovācijai.'),
        h2('Avoti'),
        ul([
          [txt('fi-compass.eu — ALTUM: Energy Efficiency for Apartment Buildings (2024. gada decembris)')],
          [txt('Latvijas Banka DP 3/2025 — renovācijas ietekme uz dzīvokļu vērtību')],
          [txt('altum.lv — renovācijas programmas 2014–2020 rezultāti')],
        ]),
      ]),
    },
    ru: {
      title: 'Жизнь до и после реновации: реальные цифры по латвийским домам',
      description: 'Сколько реально экономят жители после реновации многоквартирного дома в Латвии: данные по 624 домам, рост стоимости квартир и что говорит реальная практика.',
      tags: ['реновация', 'экономия'],
      content: lexical([
        p(txt('«После реновации будет дешевле» — это слышали все. Но насколько дешевле? Стоит ли 10–15 лет выплат? Вырастет ли цена квартиры? Ответы есть — латвийская программа реновации работает с 2014 года, накоплено достаточно данных.')),
        calloutBlock('success', 'Ключевые цифры', 'Снижение теплопотребления: −58% | Экономия CO₂: 24 000 т/год (624 дома) | Рост стоимости квартиры: +10–11%'),
        h2('Что меняется после реновации'),
        p(txt('Реновация многоквартирного дома — комплексная модернизация: утепление фасада и кровли, замена окон в подъездах, установка ИТП, обновление инженерных систем. Результат на четырёх уровнях:')),
        statsBlock([
          { label: 'Экономия на отоплении', value: '−50–60%', color: 'success' },
          { label: 'Экономия в месяц на квартиру', value: '€100–150', color: 'success' },
          { label: 'Рост стоимости квартиры', value: '+10–11%', color: 'success' },
          { label: 'Снижение CO₂ (624 дома)', value: '−24 000 т/год' },
        ]),
        h2('Данные по 624 домам: −60% на отоплении'),
        p(txt('За период ERDF 2014–2020 в Латвии реновировано 624 МКД при поддержке ALTUM. Средний результат по портфелю:')),
        calloutBlock('info', '128 → 54 кВт·ч/м²/год', 'Среднее снижение теплопотребления: −58%. Источник: fi-compass.eu, интервью ALTUM, декабрь 2024.'),
        h2('Что это значит в деньгах'),
        p(txt('Типичный дом серии 119 в Риге до реновации тратит на отопление €1,40–2,20/м²/мес. в отопительный сезон. При площади 50 м² — €70–110 в месяц только за тепло.')),
        statsBlock([
          { label: 'Квартира 40 м² — до', value: '€56–88/мес.', color: 'danger' },
          { label: 'Квартира 40 м² — после', value: '€26–40/мес.', color: 'success' },
          { label: 'Квартира 50 м² — до', value: '€70–110/мес.', color: 'danger' },
          { label: 'Квартира 50 м² — после', value: '€33–50/мес.', color: 'success' },
        ]),
        h2('Рост стоимости квартиры: +10–11%'),
        p(txt('Исследование Latvijas Banka (DP 3/2025): квартиры в реновированных домах стоят в среднем на 10–11% дороже аналогичных без реновации. Источник: Latvijas Banka DP 3/2025.')),
        h2('Что неудобно: до года строительства'),
        p(txt('Реновация длится от нескольких месяцев до года: леса, шум, пыль, ограниченный доступ к балконам. Переехать практически невозможно. Тем не менее большинство жителей реновированных домов в опросах оценивают решение положительно.')),
        ctaBlock('Проверить готовность дома →', '/#hero', 'Введите адрес — покажем текущее состояние и что нужно сделать для реновации.'),
        h2('Источники'),
        ul([
          [txt('fi-compass.eu — ALTUM: Energy Efficiency for Apartment Buildings (декабрь 2024)')],
          [txt('Latvijas Banka DP 3/2025 — влияние реновации на стоимость жилья')],
          [txt('altum.lv — результаты программы реновации 2014–2020')],
        ]),
      ]),
    },
  },

  // ── Article 6: pochemu-9-etazhey-a-ne-10 ────────────────────────────────────
  {
    slug: 'pochemu-9-etazhey-a-ne-10',
    readMinutes: 5,
    publishedAt: '2025-05-20',
    lv: {
      title: 'Kāpēc padomju mājas ir 9 stāvi, nevis 10: negaidītā inženieru loģika',
      description: 'Lifti, ugunsdrošības kāpnes, divkrāsu kāpņu telpas — izskaidrojam, kāpēc padomju arhitekti pieņēma šādus risinājumus, kas šodien šķiet dīvaini.',
      tags: ['vēsture', 'fakti'],
      content: lexical([
        p(txt('Ja esat uzaugis padomju mājā vai tajā dzīvojat, jūs, visticamāk, esat pamanījis: piecisstāvu mājas visur ir bez lifta, deviņstāvu ar liftu — un gandrīz nekad desmit stāvu. Tas nav nejaušs lēmums. Aiz tā slēpjas precīza inženiertehniskā loģika.')),
        h2('Mīkla: kāpēc ne 10?'),
        p(txt('Šķiet: ja jau ceļ 9 stāvus, kāpēc nepievienot vēl vienu? Desmit stāvi — apaļš skaitlis, vairāk dzīvokļu uz tāda paša pamata. Taču PSRS celtnieki apzināti apstājās pie deviņiem. Iemesli ir divi, un abi ir inženiertehniski.')),
        h2('1. faktors: lifti un padomju normas'),
        p(txt('Pēc padomju būvniecības normām ēkās, kas augstākas par 5 stāviem, bija obligāti jāuzstāda lifts. 5–9 stāvu mājām pietika ar vienu standarta pasažieru liftu ar 320–400 kg nestspēju. Taču 10 vai vairāk stāvu ēkām pēc tām pašām normām bija nepieciešams smagumu lifts — ievērojami dārgāks uzstādīšanā un apkopē.')),
        p(txt('9 stāvi — tas ir maksimums, pie kura var iztikt ar lētu standarta liftu. Desmitais stāvs dramatiski palielināja tāmi.')),
        h2('2. faktors: ugunsdzēsības kāpnes = 28 metri'),
        p(txt('Standarta padomju mehāniskās ugunsdzēsības kāpnes varēja sasniegt aptuveni 28 metru augstumu — tieši 9. stāvu standarta padomju mājā ar griestu augstumu 2,65–2,70 m. 10. stāvs bija ārpus sasniedzamības.')),
        calloutBlock('info', 'Loģika skaitļos', '5 stāvi → bez lifta (ietaupījums) | 9 stāvi → standarta lifts + ugunsdzēsības kāpnes 28 m | 10+ stāvi → smagumu lifts + pastiprinātas ugunsdrošības prasības = dārgāk'),
        h2('Citi negaidīti risinājumi'),
        ul([
          [bold('Kāpņu telpas divās krāsās.'), txt(' Apakšējā puse — krāsota (aizsardzība pret nodilumu), augšējā — krīts. Robeža acu līmenī — orientieris evakuācijā dūmu gadījumā.')],
          [bold('Logi vannas istabās hrušcovkās.'), txt(' Vairāk dabiskā gaismas → mazāk mitruma un baktēriju.')],
          [bold('Apvienotais sanitārmezgls.'), txt(' Ne "lēts risinājums" — apzināts platības aprēķins 30 m² dzīvoklī.')],
        ]),
        h2('Kas izrādījās gudrs — kas novecojis'),
        p(txt('Tipiskākie padomju risinājumi bija loģiski savā laikā: standartizācija samazināja izmaksas, stāvu ierobežojums apiet dārgās tehniskās prasības. Kas ir novecojis — siltumapvalks. Siltumizolācijas normas no 1960.–1980. gadiem tika aprēķinātas centralizētai siltumapgādei par zemām cenām. Kopš tā laika siltuma cena ir pieaugusi daudzreiz, bet konstruktīvs palicis tas pats.')),
        ctaBlock('Pārbaudīt mājas siltumzudumus →', '/#hero', 'Ievadiet adresi — parādīsim sēriju, energoklasi un salīdzināsim izdevumus.'),
      ]),
    },
    ru: {
      title: 'Почему советские дома — 9 этажей, а не 10: неожиданная логика архитекторов',
      description: 'Лифты, пожарные лестницы, подъезды двух цветов и окна в ванных — разбираем технические решения советских архитекторов, которые кажутся странными, но имеют точное объяснение.',
      tags: ['история', 'факты'],
      content: lexical([
        p(txt('Если вы выросли в советском доме или жили в таком, вы наверняка замечали: 5-этажки везде без лифта, 9-этажки с лифтом — и почти никогда 10-этажные. Это не случайность. За этим стоит точная инженерная логика.')),
        h2('Загадка: почему не 10?'),
        p(txt('Казалось бы, если строить 9 этажей — почему не добавить ещё один? Десять этажей — круглое число, больше квартир на той же площади фундамента. Но строители СССР намеренно останавливались на девяти. Причин две, и обе — инженерные.')),
        h2('Фактор 1: лифты и советские нормы'),
        p(txt('По советским строительным нормам здания выше 5 этажей обязательно оснащались лифтом. Для 5–9-этажных домов достаточно было стандартного пассажирского лифта 320–400 кг. Но при строительстве 10-этажного здания по тем же нормам требовался грузовой лифт — значительно дороже в установке и обслуживании.')),
        p(txt('9 этажей — это максимум, при котором можно обойтись дешёвым стандартным лифтом. Десятый этаж резко увеличивал смету.')),
        h2('Фактор 2: пожарная лестница = 28 метров'),
        p(txt('Стандартная советская выдвижная пожарная лестница могла дотянуться до высоты примерно 28 метров — это ровно 9-й этаж стандартного советского дома с высотой потолков 2,65–2,70 м. 10-й этаж выходил за пределы досягаемости.')),
        calloutBlock('info', 'Логика в цифрах', '5 этажей → без лифта (экономия) | 9 этажей → стандартный лифт + пожарная лестница 28 м | 10+ этажей → грузовой лифт + усиленные нормы = дороже'),
        h2('Другие неочевидные решения'),
        ul([
          [bold('Подъезды в двух цветах.'), txt(' Нижняя половина крашеная (защита от истирания), верхняя — побелка. Граница на уровне глаз — ориентир при задымлении.')],
          [bold('Окна в ванных хрущёвок.'), txt(' Больше естественного света → меньше сырости и бактерий.')],
          [bold('Совмещённый санузел.'), txt(' Не «дешёвое решение» — расчёт площади в 30-метровой квартире.')],
        ]),
        h2('Что оказалось умным — что устарело'),
        p(txt('Типовые советские решения были логичны для своего времени. Что устарело — тепловая оболочка. Нормы теплоизоляции 1960–1980-х рассчитывались на дешёвое централизованное тепло. С тех пор стоимость тепла выросла многократно, а конструктив остался тем же: тонкие стыки панелей, неутеплённые торцы, чердаки без современной изоляции.')),
        ctaBlock('Проверить дом →', '/#hero', 'Введите адрес — покажем серию, энергокласс и сравним расходы с нормой.'),
      ]),
    },
  },

  // ── Article 7: zachem-stroili-sovetskie-doma ─────────────────────────────────
  {
    slug: 'zachem-stroili-sovetskie-doma',
    readMinutes: 7,
    publishedAt: '2025-05-27',
    lv: {
      title: 'Kāpēc tika celtas padomju mājas: kā PSRS atrisināja mājokļu jautājumu',
      description: 'Padomju mājokļu celtniecības vēsture: no barakām un komunālajiem dzīvokļiem līdz masveida paneļmājām. Kāpēc visas mājas izskatās vienādi un ko tas nozīmē šodien.',
      tags: ['vēsture', 'sabiedrība'],
      content: lexical([
        p(txt('Padomju paneļmājas nav nejaušība un ne arī bezrūpīga celtniecība. Tā bija apzināta politiska programma: dot katrai ģimenei atsevišķu dzīvokli pēc iespējas ātrāk. Šī konteksta izpratne palīdz izskaidrot, kāpēc mājas izskatās tieši šādi — un kāpēc tās šodien ir tik grūti efektīvi apsildīt.')),
        h2('Dzīve pirms paneļmājām: barakas un komunālie dzīvokļi'),
        p(txt('Pirmajās pēckara desmitgadēs padomju dzīvojamais fonds bija kritiskā stāvoklī. Lielākā daļa pilsētnieku dzīvoja vienā no trim variantiem:')),
        ul([
          [bold('Komunālie dzīvokļi: '), txt('vairākas ģimenes vienā dzīvoklī — kopīga virtuve, vannas istaba, tualete. Norma: viena istaba vienai ģimenei.')],
          [bold('Barakas: '), txt('kara laika pagaidu koka būves, kas kļuva par pastāvīgu mājvietu. Auksts, mitrs, ugunsnedrošs.')],
          [bold('Pagrabu telpas un saimniecības ēkas: '), txt('pilsētās cilvēki dzīvoja burtiski pagrabu telpās. Oficiāli to neatzina, bet tā bija plaši izplatīta parādība.')],
        ]),
        h2('Hruščova runa 1954. gadā un "arhitektoniskā greznuma" beigas'),
        p(txt('1954. gada decembrī Viskrievijas celtnieku sanāksmē Hruščovs teica runu, kas pārmainīja padomju pilsētbūvniecību. Viņš asi nosodīja staļiniskos arhitektus: ēkas ar kolonnām un stukko ir dārgākas un prasa vairāk laika, bet cilvēkiem vajag nevis rotājumus, bet dzīvokļus.')),
        p(txt('PSKP CK 1954. gada rezolūcija noteica: visā PSRS jāceļ simtiem rūpnīcu dzelzsbetona konstrukciju ražošanai. Arhitektoniskais standarts tika radikāli vienkāršots: minimum rotājumu, maksimum platības, maksimum ātruma.')),
        h2('Ko nozīmēja saņemt savu dzīvokli'),
        p(txt('Miljoniem padomju pilsoņu atsevišķa dzīvokļa saņemšana — kaut arī sīciņā "hrušcovkā" ar apvienotu sanitārmezglu — bija reāls sociāls sasniegums. Nav jādala virtuve ar kaimiņiem. Nav jāgaida rinda uz tualeti. Bērni var mierīgi mācīties. Tas skan kā minimums — taču barakās dzīvojušiem cilvēkiem tas bija dzīves kvalitātes revolūcija.')),
        h2('Kāpēc mājas visur izskatās vienādi'),
        p(txt('Standartizācija bija apzināta izvēle, nevis kļūda. Vienādi rasējumi, vienādas rūpnīcas formas, vienādi būvnormatīvi — tas ļāva tehnoloģiju replicēt pa visu Padomju Savienību, neizstrādājot jaunus projektus katrai pilsētai. Tieši tāpēc padomju mājas ir tik līdzīgas visā bijušajā PSRS.')),
        h2('Latvija kontekstā: ko cēla šeit'),
        p(txt('Latvijā masveida celtniecība sākās vēlāk nekā Maskavā — aptuveni no 1958.–1960. gada. Rīgas galvenie rajoni — Purvciems, Imanta, Mežciems, Plāņciems, Ziepniekkalns — ir tieši šīs ēras produkts. Šodien aptuveni 70% Latvijas dzīvojamā fonda ir celti 1946–1990. gadā.')),
        ctaBlock('Pārbaudīt savu māju →', '/#hero', 'Ievadiet adresi — parādīsim sēriju, celtniecības gadu un energoklasi.'),
        h2('Avoti'),
        ul([
          [txt('csp.gov.lv — Latvijas dzīvojamais fonds')],
          [txt('em.gov.lv — "Pieejams mājoklis 2023–2027"')],
        ]),
      ]),
    },
    ru: {
      title: 'Зачем строили советские дома: как СССР решил жилищный вопрос',
      description: 'История советского жилищного строительства: от бараков и коммунальных квартир до массовых панелек. Почему все дома одинаковые и что это значит для сегодняшних жителей.',
      tags: ['история', 'общество'],
      content: lexical([
        p(txt('Советские панельные дома — не случайность и не халтура. Это был осознанный политический проект: дать каждой семье отдельную квартиру за минимальное время. Понимание этого контекста помогает объяснить, почему дома выглядят именно так — и почему сегодня их так сложно эффективно отапливать.')),
        h2('Жизнь до панелек: бараки и коммуналки'),
        p(txt('В первые послевоенные десятилетия советский жилищный фонд был в критическом состоянии. Большинство горожан жили в одном из трёх вариантов:')),
        ul([
          [bold('Коммунальные квартиры: '), txt('несколько семей в одной квартире — общая кухня, ванная, туалет. Норма: одна комната на семью.')],
          [bold('Бараки: '), txt('временные деревянные постройки военного времени, ставшие постоянным жильём. Холодные, сырые, пожароопасные.')],
          [bold('Подвалы и хозяйственные постройки: '), txt('в городах люди жили буквально в подвальных помещениях. Официально это не признавали, но было широко распространено.')],
        ]),
        h2('Речь Хрущёва 1954 года и конец «излишеств»'),
        p(txt('В декабре 1954 года на Всесоюзном совещании строителей Хрущёв произнёс речь, которая переломила советское градостроительство. Он жёстко осудил сталинских архитекторов: здания с колоннами и лепниной строятся дольше и дороже, а людям нужны не украшения, а квартиры.')),
        p(txt('Постановление ЦК КПСС 1954 года: строить сотни заводов по производству ЖБК по всему СССР. Архитектурный стандарт радикально упрощён: минимум украшений, максимум площади, максимум скорости.')),
        h2('Что значило получить собственную квартиру'),
        p(txt('Для миллионов советских граждан получение отдельной квартиры — пусть крошечной «хрущёвки» с совмещённым санузлом — было реальным социальным достижением. Не нужно делить кухню с соседями. Дети могут делать уроки в тишине. Это звучит как минимум — но для людей, живших в бараках, это была революция в качестве жизни.')),
        h2('Почему дома одинаковые по всему СССР'),
        p(txt('Стандартизация была сознательным выбором, а не ошибкой. Одни и те же чертежи, одни и те же заводские формы, одни и те же строительные нормативы — это позволяло тиражировать технологию на весь СССР без разработки новых проектов для каждого города.')),
        h2('Латвия в контексте: что строили здесь'),
        p(txt('В Латвии массовое строительство развернулось позже, чем в Москве, — примерно с 1958–1960 годов. Ключевые районы Риги — Пурвциемс, Иманта, Межциемс, Плявниеки, Зиепниеккалнс — это продукт именно этой эпохи. Сегодня около 70% жилого фонда Латвии построено в 1946–1990 годах.')),
        ctaBlock('Проверить дом →', '/#hero', 'Введите адрес — покажем серию, год постройки и энергетический класс.'),
        h2('Источники'),
        ul([
          [txt('csp.gov.lv — жилищный фонд Латвии')],
          [txt('em.gov.lv — «Pieejams mājoklis 2023–2027»')],
        ]),
      ]),
    },
  },

  // ── Article 8: kak-stroilis-sovetskie-panelyoty ──────────────────────────────
  {
    slug: 'kak-stroilis-sovetskie-panelyoty',
    readMinutes: 6,
    publishedAt: '2025-06-03',
    lv: {
      title: 'Kā tika celtas padomju paneļmājas: tehnoloģija, kas mainīja pilsētas',
      description: 'Uzziniet, kā padomju celtnieki uzcēla deviņstāvu mājas dažu nedēļu laikā, kāpēc tika izmantota saliktā tehnoloģija un ko tas nozīmē apkures rēķinos šodien.',
      tags: ['vēsture', 'celtniecība'],
      content: lexical([
        p(txt('1960-tajos gados padomju paneļmāju varēja uzcelt 12 darba dienās pie trīsmaiņu darba. Tas nav mīts — tā bija reāla tehnoloģiskā sistēma. Šīs sistēmas izpratne ir noderīga ne tikai no zinātkāres viedokļa: 60 gadus vecie konstruktīvie risinājumi tieši ietekmē jūsu apkures rēķinus šodien.')),
        h2('Mājokļu krīze PSRS: kāpēc vajadzēja ātrumu'),
        p(txt('Pēc Otrā pasaules kara padomju pilsētas saskārās ar akūtu mājokļu trūkumu. Cilvēki dzīvoja barakās, pagrabos un komunālajos dzīvokļos. 1954. gadā Hruščovs publiski nosodīja "arhitektonisko greznumu". Uzdevums tika formulēts skaidri: katrai padomju ģimenei — atsevišķs dzīvoklis. Latvijā masveida celtniecība izvērsās no 1955. līdz 1990. gadam. Mūsdienās aptuveni 70% ēku Latvijā ir celtas šajā periodā.')),
        h2('"Betona puzles" tehnoloģija: rūpnīca — celtnis — dzīvoklis'),
        p(txt('Saliktā paneļu tehnoloģija radikāli atrisināja ātruma problēmu: māja netika celta uz vietas, tā tika saliekta no gataviem elementiem.')),
        ul([
          [bold('Rūpnīca. '), txt('Blakus celtniecības laukumam vai pastāvīgi darbojās rūpnīca lielu dzelzsbetona paneļu — sienu, pārsegumu, kāpņu kāpņu celiņu — ražošanai. Viss no vienām formām.')],
          [bold('Celtnis. '), txt('Laukumā torņa celtnis secīgi uzstādīja paneļus uz sagatavota pamata. Šuves tika aizpildītas ar šķīdumu.')],
          [bold('Apdare. '), txt('Paralēli augšējo stāvu montāžai apakšējos jau notika apdare — tas ļāva vienlaikus veikt vairākus darbus.')],
        ]),
        calloutBlock('info', 'Galvenais princips', 'Visi izmēri standartizēti. Vienādas formas, vienādi mezgli, vienāda montāžas kārtība — Rīgā, Maskavā vai Almatā. Tāpēc padomju mājas ir tik līdzīgas.'),
        h2('Ko cēla Latvijā'),
        p(txt('Latvijā vismasīvāk tika celtas 103., 119. un 602. sērijas mājas. 119. sērija kļuva par visizplatītāko Rīgā — tā tika celta no 1965. līdz 1985. gadam un aizņem veselas Purvciema, Imantas, Plāņciema un Ziepniekkalna kvartālu kvartālus.')),
        h2('Kāpēc tas ir svarīgi šodien'),
        p(txt('1960-to gadu tehnoloģiskie risinājumi bija optimizēti celtniecības ātrumam un izmaksām, nevis energoefektivitātei. Paneļu šuves — galvenais vājais punkts: pēc 50–60 gadu ekspluatācijas tās zaudē hermētiskumu. Gala sienas ir plānākas par fasādes sienām. Bēniņu pārsegums nav moderni siltināts. Viss tas ir iebūvēts konstruktīvā — un netiek novērsts, aizstājot logus atsevišķā dzīvoklī.')),
        ctaBlock('Pārbaudīt jūsu māju →', '/#hero', 'Ievadiet adresi — parādīsim sēriju, energoklasi un tipiskos siltumzudumus.'),
        h2('Avoti'),
        ul([
          [txt('csp.gov.lv — Latvijas dzīvojamais fonds')],
          [txt('em.gov.lv — "Pieejams mājoklis 2023–2027"')],
          [txt('altum.lv — renovēto māju portfelis 2014–2020')],
        ]),
      ]),
    },
    ru: {
      title: 'Как строились советские панельки: технология, которая изменила города',
      description: 'Разбираемся, как советские строители возводили 9-этажные дома за считанные недели, почему применялась сборная технология и что это значит для счетов за отопление сегодня.',
      tags: ['история', 'строительство'],
      content: lexical([
        p(txt('В 1960-х советский панельный дом можно было построить за 12 рабочих дней при трёхсменной работе. Это не легенда — это была реальная технологическая система. Понимать её полезно не только из любопытства: конструктивные решения 60-летней давности напрямую влияют на ваши счета за отопление сегодня.')),
        h2('Жилищный кризис СССР: зачем нужна была скорость'),
        p(txt('После Второй мировой войны советские города столкнулись с острой нехваткой жилья. Люди ютились в бараках, подвалах и коммунальных квартирах. В 1954 году Хрущёв публично осудил «архитектурные излишества». В Латвии массовое строительство развернулось с 1955 по 1990 год. Сегодня около 70% зданий в стране построены именно в этот период.')),
        h2('Технология «бетонный пазл»: завод — кран — квартира'),
        p(txt('Сборная панельная технология решала проблему скорости радикально: дом не строился на месте, он собирался из готовых элементов.')),
        ul([
          [bold('Завод. '), txt('Рядом со стройплощадкой работал завод по производству крупных железобетонных панелей — стен, перекрытий, лестничных маршей. Всё делалось по одним формам.')],
          [bold('Кран. '), txt('На площадке башенный кран последовательно устанавливал панели на подготовленный фундамент. Швы заливались раствором.')],
          [bold('Отделка. '), txt('Параллельно с монтажом верхних этажей на нижних уже шла отделка — это позволяло вести несколько работ одновременно.')],
        ]),
        calloutBlock('info', 'Ключевой принцип', 'Все размеры стандартизированы. Одни и те же формы, одни и те же узлы, один и тот же монтажный порядок — в Риге, Москве или Алматы. Именно поэтому советские дома так похожи по всему бывшему СССР.'),
        h2('Что строили в Латвии'),
        p(txt('В Латвии наиболее массово строились серии 103, 119 и 602. Серия 119 стала самой распространённой в Риге — она строилась с 1965 по 1985 год и занимает целые кварталы Пурвциемса, Имантас, Плявниеки и Зиепниеккалнс.')),
        h2('Почему это важно сегодня'),
        p(txt('Технологические решения 1960-х годов были оптимизированы под скорость и стоимость строительства, а не под энергоэффективность. Стыки панелей — главное слабое место: за 50–60 лет эксплуатации они теряют герметичность. Торцевые стены тоньше фасадных. Чердачное перекрытие не имеет современного утепления. Всё это заложено в конструктив — и не исправляется заменой окон в отдельной квартире.')),
        ctaBlock('Проверить дом →', '/#hero', 'Введите адрес — покажем серию, энергокласс и типичные теплопотери.'),
        h2('Источники'),
        ul([
          [txt('csp.gov.lv — жилищный фонд Латвии')],
          [txt('em.gov.lv — «Pieejams mājoklis 2023–2027»')],
          [txt('altum.lv — портфель реновированных домов 2014–2020')],
        ]),
      ]),
    },
  },

  // ── Article 9: seriya-602-holodnye-torcy ──────────────────────────────────────
  {
    slug: 'seriya-602-holodnye-torcy',
    readMinutes: 6,
    publishedAt: '2025-06-10',
    lv: {
      title: '602. sērija: kāpēc gala dzīvokļi ir aukstākie',
      description: '602. sērijas mājas ar keramzītbetona sienām, kas aizsalst. Noskaidrojam, kāpēc gala dzīvokļu iedzīvotāji maksā visvairāk par apkuri un ko darīt.',
      tags: ['apkure', '602. sērija'],
      content: lexical([
        p(txt('Ja dzīvojat 602. sērijas mājas gala dzīvoklī, jūs zināt šo sajūtu: siena no pagalma puses ir auksta pat vasarā, ziemā uz iekšpuses ir sarma, apkures rēķins ir ievērojami augstāks nekā kaimiņiem centrālajos dzīvokļos. Tā nav konkrētās mājas problēma — tā ir sērijas konstruktīvā īpatnība.')),
        calloutBlock('info', '602. sērija — īsumā', 'Stāvos: 9 | Celtniecības gadi: 1970-to vidu – 1980-to sākums | Sienu materiāls: keramzītbetona paneļi | Tipiskais energoklase: E–F | Rajoni Rīgā: Purvciems, Mežciems, Imanta, Plāņciems'),
        h2('Kāpēc tieši gala dzīvokļi'),
        p(txt('Padomju paneļu mājā katra dzīvokļa abas puses robežojas ar citiem dzīvokļiem vai apsildītām telpām — kāpņutelpām, koridoriem. Tas ir dabisks siltuma aizsargājums. Taču gala dzīvokļi — galēji mājas garumā — vienu ārsieni ir daudz lielāku nekā vidējiem dzīvokļiem: gan fasādes, gan gala siena.')),
        p(txt('602. sērijas gala siena ir nepārtraukta ārējā virsma bez kaimiņu dzīvokļiem aiz tās. Ziemā tā tieši uzņem sala slodzi. Pie keramzītbetona plāksnes biezuma 300 mm bez mūsdienīgas siltināšanas tas ir ievērojams siltumzudumu avots.')),
        h2('Galvenais defekts: paneļi aizsalst'),
        p(txt('602. sērijas īpatnība — mikrolūzumi keramzītbetona plāksnēs, kas rodas pirmajās 20–30 ekspluatācijas gados. Caur šiem lūzumiem iekļūst mitrums, kas sasalstot tos paplašina tālāk. Rezultāts — siltummezglu hermētiskuma pārkāpums un paneļu aizsalšana.')),
        h2('Ko "aukstāk" nozīmē naudā'),
        statsBlock([
          { label: 'Vidējais dzīvoklis 50 m² (bez renovācijas)', value: '€65–90/mēn.', color: 'warning' },
          { label: 'Gala dzīvoklis 50 m² (bez renovācijas)', value: '€80–120/mēn.', color: 'danger' },
        ]),
        p(txt('Orientējošs aprēķins. Reālās vērtības atkarīgas no konkrētās mājas stāvokļa un tarifa.')),
        h2('Ko dara iedzīvotāji — un kāpēc tas nepalīdz'),
        ul([
          [txt('Elektriskais sildītājs kompensē siltumzudumus, bet izmaksā 2–3× dārgāk nekā centralizētā siltumapgāde.')],
          [txt('Iekšēja siltināšana pārvieto "rasas punktu" dziļāk sienā, kas bieži pastiprina sienas mitrināšanu un pelējuma rašanos.')],
        ]),
        p(txt('Sistēmisks risinājums — tikai ārēja siltināšana pilnas mājas renovācijas ietvaros. Tikai tā gala siena saņem pietiekamu siltumizolācijas slāni no ārienes.')),
        h2('602. sērijas renovācija'),
        p(txt('602. sērijas mājas ir prioritāra renovācijas mērķgrupa kā enerģētiski visneefektīvākās. Pilnas renovācijas gadījumā — fasādes un gala sienu siltināšana, jumta siltināšana, logu nomaiņa, ISM — siltuma patēriņš samazinās par 50–60%.')),
        ctaBlock('Pārbaudīt 602. sērijas māju →', '/#hero', 'Ievadiet adresi — parādīsim energoklasi, tipiskās problēmas un nākamo soli.'),
        h2('Avoti'),
        ul([
          [txt('altum.lv — daudzdzīvokļu māju renovācijas programma')],
          [txt('data.gov.lv — BVKB energosertifikātu datubāze')],
          [txt('likumi.lv/ta/id/322436 — MK Nr.222: ēku siltuma raksturlielumu normas')],
        ]),
      ]),
    },
    ru: {
      title: 'Серия 602: почему торцевые квартиры — самые холодные',
      description: 'Серия 602 — дома с керамзитобетонными стенами, которые промерзают. Разбираемся, почему торцевые квартиры платят за отопление больше всех и как это решить.',
      tags: ['отопление', 'серия 602'],
      content: lexical([
        p(txt('Если вы живёте в торцевой квартире дома серии 602, вы знаете это ощущение: стена со двора холодная даже летом, зимой иней на внутренней поверхности, счёт за отопление заметно выше, чем у соседей с центральными квартирами. Это не проблема конкретного дома — это конструктивная особенность серии.')),
        calloutBlock('info', 'Серия 602 — коротко', 'Этажность: 9 | Годы: середина 1970-х — начало 1980-х | Материал: керамзитобетонные панели | Энергокласс: E–F | Районы Риги: Пурвциемс, Межциемс, Иманта, Плявниеки'),
        h2('Почему именно торцевые квартиры'),
        p(txt('В советском панельном доме каждая квартира со всех сторон граничит с другими квартирами или с отапливаемыми помещениями. Это естественная тепловая защита. Но торцевые квартиры — крайние по длине дома — имеют одну наружную стену намного больше, чем у средних квартир: и фасадную, и торцевую.')),
        p(txt('Торцевая стена серии 602 — сплошная наружная поверхность без соседних квартир за ней. Зимой она принимает удар мороза напрямую. При толщине керамзитобетонной панели 300 мм без современного утепления это значительный источник теплопотерь.')),
        h2('Главный дефект: панели промерзают'),
        p(txt('Особенность серии 602 — микротрещины в керамзитобетонных панелях, которые появляются в первые 20–30 лет эксплуатации. Через эти трещины внутрь проникает влага, которая при замерзании расширяет их дальше. Результат — нарушение герметичности стыков и промерзание панельной структуры.')),
        h2('Что значит «холоднее» в деньгах'),
        statsBlock([
          { label: 'Средняя квартира 50 м² (без реновации)', value: '€65–90/мес.', color: 'warning' },
          { label: 'Торцевая квартира 50 м² (без реновации)', value: '€80–120/мес.', color: 'danger' },
        ]),
        h2('Что делают жильцы — и почему это не помогает'),
        ul([
          [txt('Электрический обогреватель компенсирует теплопотери, но стоит в 2–3 раза дороже централизованного тепла.')],
          [txt('Внутреннее утепление переносит точку росы глубже в стену, что нередко усиливает намокание конструкции и появление плесени.')],
        ]),
        p(txt('Системное решение — только наружное утепление в рамках полной реновации дома. Только так торцевая стена получает достаточный теплозащитный слой снаружи.')),
        ctaBlock('Проверить дом серии 602 →', '/#hero', 'Введите адрес — покажем энергокласс, типичные проблемы серии и следующий шаг.'),
        h2('Источники'),
        ul([
          [txt('altum.lv — программа реновации МКД')],
          [txt('data.gov.lv — база энергосертификатов BVKB')],
          [txt('likumi.lv/ta/id/322436 — MK Nr.222: нормы тепловой характеристики зданий')],
        ]),
      ]),
    },
  },

  // ── Article 10: sovetskie-podyezdy-dva-cveta ─────────────────────────────────
  {
    slug: 'sovetskie-podyezdy-dva-cveta',
    readMinutes: 5,
    publishedAt: '2025-06-17',
    lv: {
      title: 'Padomju kāpņu telpas: kāpēc sienas ir divās krāsās',
      description: 'Baltā apmetums augšā un tumši zaļa krāsa apakšā — izskaidrojam, kāpēc padomju kāpņu telpas izskatās tieši šādi un kas aiz tā slēpjas.',
      tags: ['vēsture', 'fakti'],
      content: lexical([
        p(txt('Ja esat uzaugis Latvijā, šī smarža ir pazīstama: apmetuma, krāsas un kaut kā vēl nenoteikta sajaukums. Tumši zaļas vai zilas sienas apakšā, baltas augšā. Vienāda aina — Rīgā, Daugavpilī, Liepājā, Jelgavā. Tas nav nejaušs — un aiz tā slēpjas precīza loģika.')),
        h2('Kāpēc tieši divas krāsas, nevis viena'),
        p(txt('Galvenais iemesls — praktisks. Kāpņu telpas sienu apakšējā puse tiek visvairāk nodilināta: šeit tiek nēsāti velosipēdi, bērnu rati, mēbeles; šeit pieskaras sienām ar somām un mugursomām. Krāsa mehāniskām slodzēm iztur daudz labāk nekā apmetums — nenodilst, nebirzt, vieglāk nomazgāt.')),
        p(txt('Augšējai pusei ir minimāls mehāniskais kontakts. Šeit lētais kaļķa apmetums tika izmantots lieliski: tas "elpo", regulē sienas mitrumu un ilgi notur. Tas ir lētāk un funkcionāli pamatoti.')),
        p(txt('Robeža starp diviem pārklājumiem — aptuveni 1,5–1,7 metru augstumā — vēsturiski tika saukta par "paneļi" vai "panelēšana". Tā bija PSRS sabiedrisko telpu noformēšanas standarts: skolas, slimnīcas, rūpnīcas, kāpņu telpas — visur vienādi.')),
        h2('Ugunsdrošības loģika: kontrasts kā orientieris'),
        p(txt('Ir vēl viens paskaidrojums, ko piemin padomju ugunsdrošības normas: kontrasta robeža acu līmenī kalpoja kā orientieris evakuācijā dūmainās situācijās. Dūmi paceļas augšā. Dūmainā kāpņu telpā sienu apakšējā puse paliek redzamāka ilgāk nekā augšējai. Tumšā apakšējā josla rada vizuālu horizontu, ļaujot orientēties pat pie zemas redzamības.')),
        h2('No kurienes tieši zaļā krāsa'),
        p(txt('Standarta padomju kāpņu telpu krāsas — tumši zaļa, tirkīzzila, reizēm okera vai bēša — noteica nevis dizaineri, bet krāsu ražotāji. Dažādās republikās dominēja dažādas krāsas atkarībā no tā, ko ražoja vietējā krāsu rūpnīca. Zaļā ("kazenne" vai "slimnīcas" zaļā) bija lēta ražošanā un deva izturīgu pārklājumu — tāpēc tā izplatījās pa visu PSRS.')),
        h2('Kāpņu telpas šodien: kas mainījies, kas nav'),
        p(txt('Latvijā daļa padomju kāpņu telpu saglabājusies gandrīz sākotnējā izskatā — tās pašas tumši zaļās sienas, tās pašas pastkastītes, tā pati spuldze. Remontētās vai renovētās mājās kāpņu telpas parasti pārkrāso neitrālos gaišos toņos, uzstāda domofonu un LED apgaismojumu.')),
        ctaBlock('Apskatīt jūsu mājas karti →', '/#hero', 'Ievadiet adresi — parādīsim datus no reģistra, energoklasi un gatavības indeksu.'),
      ]),
    },
    ru: {
      title: 'Советские подъезды: почему стены покрашены в два цвета',
      description: 'Запах побелки, тёмно-зелёная краска снизу и белые стены сверху — разбираем, почему советские подъезды выглядят именно так и что за этим стоит.',
      tags: ['история', 'факты'],
      content: lexical([
        p(txt('Если вы выросли в Латвии, этот запах знаком: смесь побелки, краски и чего-то ещё неопределённого. Тёмно-зелёные или синие стены снизу, белые сверху. Одна и та же картина — в Риге, Даугавпилсе, Лиепае, Елгаве. Это не случайность, и за этим есть вполне точная логика.')),
        h2('Почему именно два цвета, а не один'),
        p(txt('Главная причина — практическая. Нижняя половина стен подъезда подвергается максимальному истиранию: здесь проносят велосипеды, детские коляски, мебель; здесь задевают стены сумками и рюкзаками. Краска выдерживает механические воздействия значительно лучше побелки — не стирается, не осыпается, проще помыть.')),
        p(txt('Верхняя половина — зона минимального механического контакта. Здесь экономичная известковая побелка справлялась отлично: она «дышит», регулирует влажность стены и долго держится. Это и дешевле, и функционально оправдано.')),
        p(txt('Граница между двумя покрытиями — примерно на уровне 1,5–1,7 метра — исторически называлась «панель» или «панелировка». Она была стандартом оформления общественных помещений в СССР: школы, больницы, заводы, подъезды — везде одно и то же.')),
        h2('Пожарная логика: контраст как ориентир'),
        p(txt('Есть ещё одно объяснение, которое упоминается в советских нормах пожарной безопасности: контрастная граница на уровне глаз служила ориентиром при эвакуации в условиях задымления. Дым поднимается вверх. В задымлённом подъезде нижняя половина стен остаётся более видимой дольше. Тёмная нижняя полоса создаёт визуальный горизонт, позволяя ориентироваться даже при низкой видимости.')),
        h2('Откуда взялся именно зелёный цвет'),
        p(txt('Стандартные цвета советских подъездов — тёмно-зелёный, бирюзово-синий, иногда охра или бежевый — определялись не дизайнерами, а заводами по производству краски. В разных республиках преобладали разные цвета в зависимости от того, что производил местный лакокрасочный завод. Зелёный («казённый» или «больничный») был дёшев в производстве и давал стойкое покрытие — поэтому распространился по всему СССР.')),
        h2('Подъезды сегодня: что изменилось, что нет'),
        p(txt('В Латвии часть советских подъездов сохранилась практически в первозданном виде — те же тёмно-зелёные стены, те же почтовые ящики, та же лампочка. В отремонтированных или реновированных домах подъезды обычно перекрашиваются в нейтральные светлые тона, устанавливаются домофоны и LED-освещение.')),
        ctaBlock('Посмотреть карточку вашего дома →', '/#hero', 'Введите адрес — покажем данные из реестра, энергокласс и индекс готовности.'),
      ]),
    },
  },
]

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding blog articles into Payload CMS...\n')

  const payload = await getPayload({ config })

  for (const article of ARTICLES) {
    const existing = await payload.find({
      collection: 'blog-posts',
      where: { slug: { equals: article.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`⏭  ${article.slug} — already exists, skipping`)
      continue
    }

    // Create with LV locale (default)
    const doc = await payload.create({
      collection: 'blog-posts',
      locale: 'lv',
      data: {
        slug: article.slug,
        title: article.lv.title,
        description: article.lv.description,
        content: article.lv.content,
        tags: article.lv.tags.map((tag) => ({ tag })),
        readMinutes: article.readMinutes,
        publishedAt: article.publishedAt,
        published: true,
      },
    })

    // Update with RU locale
    await payload.update({
      collection: 'blog-posts',
      id: doc.id,
      locale: 'ru',
      data: {
        title: article.ru.title,
        description: article.ru.description,
        content: article.ru.content,
        tags: article.ru.tags.map((tag) => ({ tag })),
      },
    })

    console.log(`✅ ${article.slug} (LV + RU)`)
  }

  console.log('\nDone. All articles seeded.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
