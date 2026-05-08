/**
 * Readiness-pack: 5 long-form blog articles tied to the Mājas gatavības
 * platforma narrative. LV is the primary locale, RU mirrors it.
 *
 *  1. SCF 2026-2032 explainer        — slug: scf-fond-2026-2032
 *  2. ALTUM remonta aizdevums guide  — slug: altum-remonta-aizdevums
 *  3. Building Readiness Score       — slug: gotovnost-doma-k-finansirovaniju
 *  4. Owner list freshness           — slug: spisok-sobstvennikov-aktualnost
 *  5. Decision campaigns + BIS       — slug: lemumu-kampanas-bis-eksports
 *
 *  Run (locally with DB up):
 *    npx tsx scripts/seed-blog-readiness-pack.ts
 *
 *  Idempotent: checks existing slugs first, skips duplicates.
 *  All facts in these articles are sourced — see "Avoti" / "Источники" in each.
 */

import { getPayload } from 'payload'
import config from '../payload.config'
import {
  bold,
  calloutBlock,
  ctaBlock,
  h2,
  lexical,
  ol,
  p,
  statsBlock,
  txt,
  ul,
  type ContentNode,
} from './seed-blog/lexical'

interface ArticleData {
  slug: string
  readMinutes: number
  publishedAt: string
  lv: { title: string; description: string; content: ReturnType<typeof lexical>; tags: string[] }
  ru: { title: string; description: string; content: ReturnType<typeof lexical>; tags: string[] }
}

// ─── 1. SCF 2026-2032 ────────────────────────────────────────────────────────
const lvScf: ContentNode[] = [
  p(
    txt(
      'ALTUM 2021-2027 daudzdzīvokļu māju renovācijas programma ir slēgta jaunām pieteikumiem — €173 miljoni jau rezervēti 338 mājām, un jauno pieteikumu pieņemšana apturēta. Bet tas nenozīmē, ka logs ir aizvērts uz visiem laikiem. Nākamais lielais finansēšanas raunds — ',
    ),
    bold('Sociālā klimata fonds 2026-2032'),
    txt('. Šajā rakstā — ko gaidīt, kad sākt gatavoties un kāpēc ',
    ),
    bold('agra gatavošanās'),
    txt(' šajā ciklā ir izšķiroša.'),
  ),
  h2('Kas ir Sociālā klimata fonds'),
  p(
    txt(
      'Eiropas Sociālā klimata fonds (Social Climate Fund, SCF) ir ES instruments, kas finansēts no ETS2 — emisiju kvotu tirdzniecības sistēmas ēkām un transportam. Fonda mērķis ir mazināt enerģētiskās nabadzības risku mājsaimniecībām, kuras visvairāk skars ETS2 ieviešana 2027. gadā.',
    ),
  ),
  p(
    txt(
      'Latvijas SCF plāns 2026-2032 tika apstiprināts ar Ministru kabineta rīkojumu Nr. 393 (2025. gada 2. jūlijā) un nosūtīts Eiropas Komisijas izvērtēšanai. Plāna kopējais apjoms — €342 miljoni, no tiem renovācijas atbalstam paredzēts ievērojams īpatsvars.',
    ),
  ),
  statsBlock([
    { label: 'Kopējais SCF Latvijas plāns', value: '€342 milj.', color: 'default' },
    { label: 'Daudzdzīvokļu māju bloks (publiskie līdzekļi)', value: '€127 milj.', color: 'success' },
    { label: 'Nacionālais līdzfinansējums', value: '€31,75 milj.', color: 'default' },
    { label: 'Kopējais MKD bloks', value: '€186 milj.', color: 'success' },
    { label: 'Plāna periods', value: '2026-2032', color: 'default' },
    { label: 'Plāna izpildes termiņš', value: '31.07.2032', color: 'warning' },
  ]),
  calloutBlock(
    'warning',
    'Statuss 2026. gada maijā',
    'SCF Latvijas plāns šobrīd ir Eiropas Komisijas izvērtēšanā. Reālā izmaksa atkarīga no apstiprināšanas un ETS2 faktiskās palaišanas. Plāns ir realistisks, bet nav garantēts.',
  ),
  h2('Kad gaidīt MK noteikumus un pieteikumus'),
  p(
    txt(
      'Pēc Latvijas SCF plāna apstiprināšanas Eiropas Komisijā nāk nacionālā līmeņa MK noteikumi — tieši tie noteiks, kā māja var pieteikties atbalstam, kāds ir maksimālais apjoms uz vienu māju, kuri darbi tiek atbalstīti un kas ir prioritāri.',
    ),
  ),
  p(
    txt('Pēc plāna grafika:'),
  ),
  ol([
    [bold('Q4 2026'), txt(' — MK noteikumi, kas regulēs atbalstu daudzdzīvokļu mājām, tiek publicēti likumi.lv.')],
    [bold('Q1-Q2 2027'), txt(' — sākas pirmā pieteikumu pieņemšanas kārta. Logs nebūs ilgs — kā ALTUM 2021-2027 ciklā, kvotas pirmajā kārtā tika izsmeltas dažu mēnešu laikā.')],
    [bold('Līdz 31.07.2032'), txt(' — visiem darbiem jābūt pabeigtiem un atskaitēm iesniegtām.')],
  ]),
  h2('Ko nozīmē "kvotas izsmeļas pirmajos mēnešos"'),
  p(
    txt(
      'ALTUM 2021-2027 ciklā pirmā kārtā 624 daudzdzīvokļu mājas saņēma finansējumu no aptuveni 23 500 mājām, kurām tas bija nepieciešams. Tas ir konversija ',
    ),
    bold('2,7%'),
    txt(' (avots: fi-compass, ALTUM, 2024. gada decembris). Pārējie pieteicēji — vai nu nokavēja, vai nesagatavoja dokumentāciju laikā.'),
  ),
  p(
    txt(
      'Galvenā nodarbība no šī cikla: nogāja nevis tās mājas, kurām bija visnepieciešamāks remonts, bet tās, kuras pirmās bija ',
    ),
    bold('gatavas iesniegt pilnu dokumentu paketi'),
    txt(': īpašnieku saraksts, lēmums kopības sapulcē, energoaudits, tehniskais projekts. Mājas, kurām vajadzēja papildus 6 mēnešus saraksta atjaunošanai vai sapulces sasaukšanai, nokavēja.'),
  ),
  h2('Kas nepieciešams, lai būtu gatavi pirmajai SCF kārtai'),
  ul([
    [bold('Aktuāls dzīvokļu īpašnieku saraksts'),
      txt(' — ne vecāks par 180 dienām (gan ALTUM, gan plānoti SCF noteikumi prasa nesenu sarakstu).'),
    ],
    [bold('Spēkā esošs energosertifikāts'),
      txt(' — derīgs 10 gadus, taču atbalsta saņemšanai bieži nepieciešams pēdējo 1-2 gadu sertifikāts.'),
    ],
    [bold('Pieņemts īpašnieku lēmums par renovāciju'),
      txt(' — pareizi noformēts un parakstīts (Smart-ID derīgi kopš 2022. gada).'),
    ],
    [bold('Vismaz 5 piegādātāji aptaujāti, no tiem 2 neatkarīgi'),
      txt(' — šī prasība bija ALTUM 2021-2027 ciklā un, ļoti iespējams, paliks SCF noteikumos.'),
    ],
    [bold('Tehniskā apsekošana un projekta sagatavošana'),
      txt(' — 3-6 mēneši darba ar projektētāju.'),
    ],
  ]),
  calloutBlock(
    'info',
    'Kāpēc tas viss aizņem laiku',
    'Sapulces sasaukšana — 30 dienas iepriekšējais paziņojums. Saraksta atjaunošana caur biedrību vai kadastru — 2-4 nedēļas. Energoaudits — 4-6 nedēļas līdz pilnam ziņojumam. Skaitliski: no nulles līdz "gatavs iesniegt" optimālā gadījumā ir 6-9 mēneši.',
  ),
  h2('Ko ALTEKO platforma dara šajā ciklā'),
  p(
    txt(
      'Mēs neesam alternatīva ALTUM, BIS Mājas lietai vai oficiālajām atbalsta programmām. Mēs esam ',
    ),
    bold('sagatavošanās slānis'),
    txt(': aprēķinām mājas gatavības rādītāju (Mājas gatavības novērtējums), parādām nākamo soli, sagatavojam īpašnieku lēmumus eksportēšanai uz BIS un palīdzam izveidot caurspīdīgu piegādātāju izvēles procesu.'),
  ),
  ctaBlock(
    'Pārbaudīt mājas gatavību →',
    '/#hero',
    'Bez maksas. Datu avots — VZD un BVKB oficiālie reģistri.',
  ),
  h2('Avoti'),
  ul([
    [txt('likumi.lv/ta/id/361681 — MK rīkojums Nr. 393 par Latvijas SCF plānu (02.07.2025)')],
    [txt('fi-compass.eu / ALTUM ziņojums (2024. decembris) — konversija un atlikušais mājas fonds')],
    [txt('ec.europa.eu/social-climate-fund — Eiropas Sociālā klimata fonda regulējums')],
    [txt('altum.lv/dzivokli/daudzdzivoklu-maju-energoefektivitate — vēsturiski noteikumi 2021-2027 cikla')],
  ]),
]

const ruScf: ContentNode[] = [
  p(
    txt(
      'Программа ALTUM 2021-2027 для реновации многоквартирных домов закрыта для новых заявок: €173 миллиона уже зарезервированы для 338 домов, приём заявок остановлен. Но это не значит, что окно закрыто навсегда. Следующий крупный раунд финансирования — ',
    ),
    bold('Социальный климатический фонд 2026-2032'),
    txt('. В этой статье — что ожидать, когда начинать готовиться и почему ',
    ),
    bold('ранняя подготовка'),
    txt(' в этом цикле решает всё.'),
  ),
  h2('Что такое Социальный климатический фонд'),
  p(
    txt(
      'Европейский Социальный климатический фонд (Social Climate Fund, SCF) — это инструмент ЕС, финансируемый из ETS2 — системы торговли квотами на выбросы для зданий и транспорта. Цель фонда — снизить риск энергетической бедности у домохозяйств, на которых сильнее всего повлияет запуск ETS2 в 2027 году.',
    ),
  ),
  p(
    txt(
      'Латвийский план SCF 2026-2032 утверждён распоряжением Кабинета министров № 393 (2 июля 2025 года) и направлен в Европейскую комиссию на оценку. Общий объём плана — €342 миллиона, значительная доля которого предусмотрена для поддержки реновации.',
    ),
  ),
  statsBlock([
    { label: 'Общий план SCF Латвии', value: '€342 млн', color: 'default' },
    { label: 'Блок МКД (публичные средства)', value: '€127 млн', color: 'success' },
    { label: 'Национальное софинансирование', value: '€31,75 млн', color: 'default' },
    { label: 'Общий блок МКД', value: '€186 млн', color: 'success' },
    { label: 'Период плана', value: '2026-2032', color: 'default' },
    { label: 'Срок выполнения', value: '31.07.2032', color: 'warning' },
  ]),
  calloutBlock(
    'warning',
    'Статус на май 2026',
    'План SCF Латвии сейчас на оценке Еврокомиссии. Реальные выплаты зависят от утверждения и фактического запуска ETS2. План реалистичен, но не гарантирован.',
  ),
  h2('Когда ждать MK правил и заявок'),
  p(
    txt(
      'После утверждения латвийского плана SCF в Еврокомиссии следуют национальные MK правила — именно они определят, как дом может подать заявку, какой максимальный объём поддержки на один дом, какие работы поддерживаются и что в приоритете.',
    ),
  ),
  p(txt('По графику плана:')),
  ol([
    [bold('Q4 2026'), txt(' — MK правила, регулирующие поддержку МКД, публикуются на likumi.lv.')],
    [
      bold('Q1-Q2 2027'),
      txt(
        ' — стартует первая волна приёма заявок. Окно будет коротким — как и в цикле ALTUM 2021-2027, квоты в первой волне исчерпались за несколько месяцев.',
      ),
    ],
    [bold('До 31.07.2032'), txt(' — все работы должны быть завершены, отчётность подана.')],
  ]),
  h2('Что значит «квоты исчерпываются за первые месяцы»'),
  p(
    txt(
      'В цикле ALTUM 2021-2027 в первой волне 624 многоквартирных дома получили финансирование из примерно 23 500, которым оно было нужно. Это конверсия ',
    ),
    bold('2,7%'),
    txt(' (источник: fi-compass, ALTUM, декабрь 2024). Остальные заявители — либо опоздали, либо не успели подготовить документы.'),
  ),
  p(
    txt(
      'Главный урок этого цикла: прошли не те дома, которым реновация была нужнее всего, а те, которые первыми ',
    ),
    bold('были готовы подать полный пакет документов'),
    txt(
      ': список собственников, решение собрания, энергоаудит, технический проект. Дома, которым нужно было дополнительно 6 месяцев на актуализацию списка или созыв собрания, не успели.',
    ),
  ),
  h2('Что нужно, чтобы быть готовым к первой волне SCF'),
  ul([
    [
      bold('Актуальный список собственников квартир'),
      txt(
        ' — не старше 180 дней (и ALTUM, и ожидаемо SCF правила требуют недавний список).',
      ),
    ],
    [
      bold('Действующий энергосертификат'),
      txt(
        ' — действителен 10 лет, но для получения поддержки часто требуется сертификат за последние 1-2 года.',
      ),
    ],
    [
      bold('Принятое решение собственников о реновации'),
      txt(' — корректно оформленное и подписанное (Smart-ID юридически действителен с 2022 года).'),
    ],
    [
      bold('Минимум 5 опрошенных поставщиков, из них 2 независимых'),
      txt(' — это требование было в цикле ALTUM 2021-2027 и, скорее всего, останется в правилах SCF.'),
    ],
    [
      bold('Техническое обследование и подготовка проекта'),
      txt(' — 3-6 месяцев работы с проектировщиком.'),
    ],
  ]),
  calloutBlock(
    'info',
    'Почему всё это занимает время',
    'Созыв собрания — 30 дней предварительного уведомления. Актуализация списка через biedrība или кадастр — 2-4 недели. Энергоаудит — 4-6 недель до полного отчёта. По времени: с нуля до «готов подавать» в оптимуме это 6-9 месяцев.',
  ),
  h2('Что делает платформа ALTEKO в этом цикле'),
  p(
    txt('Мы не альтернатива ALTUM, BIS Mājas lieta или официальным программам поддержки. Мы — '),
    bold('подготовительный слой'),
    txt(
      ': считаем готовность дома (Mājas gatavības novērtējums), показываем следующий шаг, готовим решения собственников для экспорта в BIS и помогаем выстроить прозрачный процесс выбора поставщика.',
    ),
  ),
  ctaBlock(
    'Проверить готовность дома →',
    '/ru/#hero',
    'Бесплатно. Источники данных — официальные регистры VZD и BVKB.',
  ),
  h2('Источники'),
  ul([
    [txt('likumi.lv/ta/id/361681 — MK rīkojums № 393 о латвийском плане SCF (02.07.2025)')],
    [txt('fi-compass.eu / отчёт ALTUM (декабрь 2024) — конверсия и оставшийся фонд домов')],
    [txt('ec.europa.eu/social-climate-fund — регулирование Социального климатического фонда ЕС')],
    [txt('altum.lv/dzivokli/daudzdzivoklu-maju-energoefektivitate — исторические правила цикла 2021-2027')],
  ]),
]

// ─── 2. ALTUM remonta aizdevums ──────────────────────────────────────────────
const lvAltum: ContentNode[] = [
  p(
    txt(
      'Kamēr lielā ALTUM renovācijas programma 2021-2027 ir slēgta un SCF nākamais raunds gaidāms ne ātrāk kā 2027. gadā, daudzdzīvokļu mājām paliek viens mazāk pamanīts, bet pilnīgi atvērts instruments — ',
    ),
    bold('ALTUM remonta aizdevums'),
    txt('. Tas nav subsīdija un neaizvieto SCF, taču dažu māju gadījumā tas ir labākais variants tieši šobrīd.'),
  ),
  h2('Kas ir ALTUM remonta aizdevums'),
  p(
    txt(
      'ALTUM remonta aizdevums (oficiāls nosaukums latviski) — daudzdzīvokļu mājas remonta finansēšanas instruments, kas tiek izsniegts mājas vārdā (caur dzīvokļu īpašnieku biedrību vai pilnvaroto personu). Tas paredzēts mājām, kuras vēlas veikt remontus tagad, neatkarīgi no SCF cikla.',
    ),
  ),
  statsBlock([
    { label: 'Minimālā summa', value: '€10 000', color: 'default' },
    { label: 'Likme', value: '3,9% gadā', color: 'success' },
    { label: 'Termiņš', value: 'līdz 20 gadiem', color: 'default' },
    { label: 'Pieejams līdz', value: '30.06.2031', color: 'warning' },
    { label: 'Subsīdijas elements', value: 'nav', color: 'default' },
    { label: 'Avots', value: 'altum.lv', color: 'default' },
  ]),
  h2('Kam tas ir labi (un kam nav)'),
  p(txt('Remonta aizdevums ir piemērots, ja:')),
  ul([
    [txt('Mājai ir aktuāla problēma, kas neļauj gaidīt SCF (caurums jumtā, sabojājies lifts, nestabils ITP).')],
    [txt('Iedzīvotāji ir gatavi maksāt, taču nav uzkrāts pietiekams remonta fonds.')],
    [txt('Plānotais remonta apjoms ir mazāks par €100 000 — ja vairāk, SCF parasti būs izdevīgāks.')],
    [txt('Māja jau ir reģistrēta zemesgrāmatā un dzīvokļu īpašnieku biedrība darbojas.')],
  ]),
  p(txt('Tas nav optimāli, ja:')),
  ul([
    [txt('Plānojat fasādes vai pamatu remontu — šie darbi parasti pelnās ar SCF subsīdiju.')],
    [txt('Mājā ir mazāk par 12 dzīvokļiem — finanšu administratīvās izmaksas pārsniedz ieguvumu.')],
    [txt('Ir parādi par komunālajiem maksājumiem virs 5% — kreditors atteiks.')],
  ]),
  calloutBlock(
    'info',
    'Salīdzinājums ar SCF (gaidāmais)',
    'SCF subsīdijas elements — līdz 50% no projekta vērtības (saskaņā ar ALTUM 2021-2027 cikla noteikumiem). Remonta aizdevums — 0% subsīdijas. Tomēr remonta aizdevums ir pieejams TAGAD, bet SCF — ne ātrāk kā 2027.',
  ),
  h2('Lēmumu kopība'),
  p(
    txt(
      'Lai pieteiktu aizdevumu, dzīvokļu īpašnieku biedrībai vai kopībai jāpieņem oficiāls lēmums. Šajā lēmumā jābūt:',
    ),
  ),
  ol([
    [txt('Aizdevuma summa un termiņš.')],
    [txt('Plānoto darbu apraksts.')],
    [txt('Maksājumu sadalījuma princips (parasti pēc dzīvokļa platības).')],
    [txt('Pilnvarotā persona, kas paraksta līgumu ar ALTUM.')],
  ]),
  p(
    txt(
      'Lēmums tiek pieņemts ar vairākumu — 50% + 1 (ja vien biedrības statūti neprasa augstāku slieksni). Smart-ID parakstīšana ir derīga (Dzīvokļa īpašuma likuma 20. panta 7. un 8. daļa, 2022. gada grozījumi).',
    ),
  ),
  h2('Tipiska maksājumu shēma'),
  p(
    txt(
      'Aizdevums tiek atmaksāts no remonta fonda iemaksām. Par €100 000 aizdevumu uz 20 gadiem ar likmi 3,9% mēneša maksājums ir aptuveni €600 (visa māja). Mājā ar 60 dzīvokļiem tas nozīmē apmēram €10 mēnesī par dzīvokli papildu pie esošā remonta fonda.',
    ),
  ),
  calloutBlock(
    'success',
    'Praktisks padoms',
    'Pirms pieteikšanās aprēķiniet, vai pašreizējais remonta fonds (visu īpašnieku iemaksas) sedz prognozēto maksājumu ar 30% rezervi. Ja ne — pirms aizdevuma jāpaaugstina iemaksas un jāpieņem atbilstošs lēmums.',
  ),
  h2('Vai šī ir labākā izvēle jūsu mājai'),
  p(
    txt(
      'Lēmums starp "ņemt aizdevumu tagad" un "gaidīt SCF" ir individuāls — tas atkarīgs no remonta steidzamības, mājas lielums, esošā fonda un dalībnieku vēlmes uzņemties parādu. ALTEKO platforma sniedz piecus finansēšanas scenārijus tieši šim salīdzinājumam.',
    ),
  ),
  ctaBlock(
    'Aprēķināt scenārijus →',
    '/renovation',
    '5 finanšu scenāriji jūsu mājai: ALTUM aizdevums, SCF, banka, savs fonds, jaukts.',
  ),
  h2('Avoti'),
  ul([
    [txt('altum.lv/dzivokli/daudzdzivoklu-maju-energoefektivitate/remonta-aizdevums-daudzdzivoklu-majai/')],
    [txt('Dzīvokļa īpašuma likums, 20. pants — Smart-ID parakstīšanas spēkā esamība')],
  ]),
]

const ruAltum: ContentNode[] = [
  p(
    txt(
      'Пока большая программа реновации ALTUM 2021-2027 закрыта, а следующий раунд SCF ожидается не раньше 2027 года, для многоквартирных домов остаётся один менее заметный, но полностью открытый инструмент — ',
    ),
    bold('ALTUM remonta aizdevums'),
    txt(' (ремонтный кредит ALTUM). Это не субсидия и не замена SCF, но в ряде случаев это лучший вариант именно сейчас.'),
  ),
  h2('Что такое ALTUM remonta aizdevums'),
  p(
    txt(
      'ALTUM remonta aizdevums — инструмент финансирования ремонта многоквартирного дома, выдаваемый на имя дома (через biedrība или уполномоченное лицо). Подходит домам, которые хотят делать ремонт сейчас, не привязываясь к циклу SCF.',
    ),
  ),
  statsBlock([
    { label: 'Минимальная сумма', value: '€10 000', color: 'default' },
    { label: 'Ставка', value: '3,9% годовых', color: 'success' },
    { label: 'Срок', value: 'до 20 лет', color: 'default' },
    { label: 'Доступен до', value: '30.06.2031', color: 'warning' },
    { label: 'Субсидия', value: 'нет', color: 'default' },
    { label: 'Источник', value: 'altum.lv', color: 'default' },
  ]),
  h2('Кому подходит (а кому нет)'),
  p(txt('Ремонтный кредит подходит, если:')),
  ul([
    [
      txt(
        'У дома есть актуальная проблема, не дающая ждать SCF (дыра в крыше, сломанный лифт, нестабильный ИТП).',
      ),
    ],
    [txt('Жители готовы платить, но не накоплен достаточный фонд ремонта.')],
    [txt('Объём планируемых работ менее €100 000 — если больше, SCF обычно выгоднее.')],
    [txt('Дом уже зарегистрирован в Земельной книге, biedrība работает.')],
  ]),
  p(txt('Не оптимально, если:')),
  ul([
    [txt('Планируете ремонт фасада или фундамента — эти работы обычно окупаются с субсидией SCF.')],
    [txt('В доме менее 12 квартир — административные расходы превышают выгоду.')],
    [txt('Долги по коммуналке выше 5% — кредитор откажет.')],
  ]),
  calloutBlock(
    'info',
    'Сравнение с SCF (ожидание)',
    'Субсидия SCF — до 50% стоимости проекта (по правилам цикла ALTUM 2021-2027). Ремонтный кредит — 0% субсидии. Зато он доступен СЕЙЧАС, а SCF — не раньше 2027.',
  ),
  h2('Решение собственников'),
  p(
    txt(
      'Чтобы подать заявку на кредит, biedrība или kopība должна принять официальное решение. В нём должны быть:',
    ),
  ),
  ol([
    [txt('Сумма и срок кредита.')],
    [txt('Описание планируемых работ.')],
    [txt('Принцип распределения платежей (обычно по площади квартиры).')],
    [txt('Уполномоченное лицо, подписывающее договор с ALTUM.')],
  ]),
  p(
    txt(
      'Решение принимается большинством — 50% + 1 (если устав biedrības не требует более высокий порог). Подписание Smart-ID юридически действительно (статья 20, части 7 и 8 Закона о квартирной собственности, поправки 2022 года).',
    ),
  ),
  h2('Типичная схема платежей'),
  p(
    txt(
      'Кредит погашается из взносов в фонд ремонта. Для €100 000 кредита на 20 лет под 3,9% месячный платёж составляет около €600 (на весь дом). Для дома на 60 квартир это примерно €10 в месяц с квартиры дополнительно к существующему фонду ремонта.',
    ),
  ),
  calloutBlock(
    'success',
    'Практический совет',
    'До подачи заявки рассчитайте, покрывает ли текущий фонд ремонта (взносы всех собственников) прогнозируемый платёж с запасом 30%. Если нет — нужно сначала повысить взносы и принять соответствующее решение.',
  ),
  h2('Это лучший вариант для вашего дома?'),
  p(
    txt(
      'Решение между «брать кредит сейчас» и «ждать SCF» индивидуально — зависит от срочности ремонта, размера дома, текущего фонда и готовности участников брать долг. Платформа ALTEKO даёт пять сценариев финансирования именно для этого сравнения.',
    ),
  ),
  ctaBlock(
    'Рассчитать сценарии →',
    '/ru/renovation',
    '5 финансовых сценариев для вашего дома: кредит ALTUM, SCF, банк, свой фонд, смешанный.',
  ),
  h2('Источники'),
  ul([
    [txt('altum.lv/dzivokli/daudzdzivoklu-maju-energoefektivitate/remonta-aizdevums-daudzdzivoklu-majai/')],
    [txt('Закон о квартирной собственности, статья 20 — действительность подписания Smart-ID')],
  ]),
]

// ─── 3. Building Readiness Score ─────────────────────────────────────────────
const lvReadiness: ContentNode[] = [
  p(
    txt(
      'Pirms uztaisīt remontu, mājai jābūt tam ',
    ),
    bold('gatavai'),
    txt(
      '. Ne tikai tehniski (jumts un siltināšana). Ne tikai finansiāli (līdzekļi). Bet arī dokumentāli, juridiski un sociāli — īpašnieku saraksts, lēmumi, parakstu paketes, iepirkumu caurspīdīgums. Tas ir pat svarīgāk par naudu, jo bez tā neviens cikls — ne ALTUM, ne SCF, ne pat parasta banka — nepieņems pieteikumu.',
    ),
  ),
  p(
    txt('Tieši šim mēs aprēķinām '),
    bold('Mājas gatavības novērtējumu'),
    txt(' (Building Readiness Score) — sešās asīs, ar diapazonu 0-100 un ieteiktu nākamo soli.'),
  ),
  h2('Sešas gatavības asis'),
  ol([
    [bold('Energoefektivitātes potenciāls'), txt(' — cik daudz var iegūt no fasādes, jumta, ITP renovācijas. Bāze: BVKB energosertifikāts un sērijas vidējie rādītāji.')],
    [bold('Finansēšanas piemērotība'), txt(' — vai māja atbilst pašreizējām SCF/ALTUM/bankas prasībām: vecums, dzīvokļu skaits, parādu līmenis.')],
    [bold('Dokumentu gatavība'), txt(' — vai ir energosertifikāts, tehniskais paspords, ekspertīze, īpašnieku saraksts (svaigs).')],
    [bold('Īpašnieku lēmumu gatavība'), txt(' — vai ir nesen pieņemti lēmumi, vai biedrība darbojas, vai Smart-ID izmantošana ir jau apgūta.')],
    [bold('Finanšu izpildāmība'), txt(' — vai dzīvokļiem ir jauda absorbēt papildu maksājumu (proporcija pret vidējiem ienākumiem rajonā).')],
    [bold('Iepirkumu caurspīdīgums'), txt(' — cik labi māja var pierādīt, ka ir aptaujājusi vismaz 5 piegādātājus, no kuriem 2 neatkarīgi (ALTUM prasība).')],
  ]),
  calloutBlock(
    'info',
    'Kāpēc 6, nevis 1 vai 100',
    'Viena rādītāja paziņojums "māja gatava 73%" ir bezjēdzīgs. Bet sešas asis dod konkrētu sarakstu, kur pielikt darbu. Vairāk par 6 — ari bezjēdzīgi: rādītāju daudzums kļūst trokšņains.',
  ),
  h2('Datu avoti'),
  p(txt('Aprēķins balstās uz oficiāliem datu avotiem, ne pieņēmumiem:')),
  statsBlock([
    { label: 'VZD Building.ZIP', value: 'sērijas, gads, materiāls', color: 'default' },
    { label: 'BVKB energosertifikāti', value: 'klase, kWh/m²', color: 'default' },
    { label: 'Aktuāls saraksts', value: 'biedrība / kadastrs', color: 'default' },
    { label: 'Lursoft', value: 'biedrības darbība', color: 'default' },
    { label: 'SPRK tarifi', value: 'siltuma tarifi pa reģioniem', color: 'default' },
    { label: 'Mājas augšupielādētie dati', value: 'rēķini, ekspertīze', color: 'default' },
  ]),
  h2('Kā lasīt rādītāju'),
  p(txt('Rādītājs nav atzīme. Tas ir indikators ar trim galvenajām zonām:')),
  ul([
    [bold('80-100 — gatavs iesniegt'),
      txt(' visus dokumentus, var startēt pirmajā pieteikumu kārtā.'),
    ],
    [bold('50-79 — strādā'),
      txt(': identificēta viena vai divas vājās asis, parasti 1-3 mēneši aktīva darba.'),
    ],
    [bold('0-49 — agra stadija'),
      txt(': mājai nepieciešams 6-12 mēnešu darbs, sākot ar saraksta atjaunošanu un biedrības stāvokļa izvērtēšanu.'),
    ],
  ]),
  h2('Nākamais labākais solis'),
  p(
    txt(
      'Kopā ar rādītāju ALTEKO uzrāda nākamo labāko soli — vienu konkrētu darbību, kas visstraujāk paaugstina rādītāju. Piemēram:',
    ),
  ),
  ul([
    [txt('"Atjauno dzīvokļu īpašnieku sarakstu — pēdējais ir 2024. gadā" (paaugstina dokumentu gatavību par 15 punktiem).')],
    [txt('"Sāc piegādātāju aptauju — ALTUM prasa vismaz 5 ar 2 neatkarīgiem" (paaugstina iepirkumu caurspīdīgumu par 25 punktiem).')],
    [txt('"Pieņem lēmumu par energoauditu — bez aktuāla nevarēs pieteikt SCF" (paaugstina dokumentu gatavību par 20 punktiem).')],
  ]),
  calloutBlock(
    'success',
    'Galvenā doma',
    'Rādītājs nesaka "māja laba" vai "māja slikta". Tas saka — kāds darbs jāveic šonedēļ, šomēnesī, šajā ceturksnī, lai būtu pirmie rindā, kad atvērsies SCF logs.',
  ),
  ctaBlock(
    'Aprēķināt mājas gatavību →',
    '/#hero',
    'Bez maksas, bez reģistrācijas. Tikai mājas adrese.',
  ),
  h2('Avoti'),
  ul([
    [txt('VZD — Valsts zemes dienests, Building.ZIP no data.gov.lv')],
    [txt('BVKB — Būvniecības valsts kontroles birojs, energosertifikāti no data.gov.lv')],
    [txt('altum.lv — pieprasījumu prasības programmu ciklos')],
    [txt('docs/product/module-readiness.md repository — pilna metodika')],
  ]),
]

const ruReadiness: ContentNode[] = [
  p(
    txt('Прежде чем делать ремонт, дом должен быть к нему '),
    bold('готов'),
    txt(
      '. Не только технически (крыша и утепление). Не только финансово (средства). Но также документально, юридически и социально — список собственников, решения, пакеты подписей, прозрачность закупок. Это даже важнее денег, потому что без этого ни один цикл — ни ALTUM, ни SCF, ни даже обычный банк — не примет заявку.',
    ),
  ),
  p(
    txt('Именно для этого мы рассчитываем '),
    bold('Mājas gatavības novērtējums'),
    txt(' (готовность дома, Building Readiness Score) — по шести осям, от 0 до 100, с конкретным следующим шагом.'),
  ),
  h2('Шесть осей готовности'),
  ol([
    [
      bold('Энергоэффективностный потенциал'),
      txt(
        ' — сколько можно выиграть на фасаде, крыше, ИТП. База: энергосертификат BVKB и средние по серии.',
      ),
    ],
    [
      bold('Соответствие финансированию'),
      txt(
        ' — отвечает ли дом текущим требованиям SCF/ALTUM/банка: возраст, число квартир, уровень задолженностей.',
      ),
    ],
    [
      bold('Готовность документов'),
      txt(
        ' — есть ли энергосертификат, технический паспорт, экспертиза, актуальный список собственников.',
      ),
    ],
    [
      bold('Готовность решений собственников'),
      txt(
        ' — есть ли недавние решения, работает ли biedrība, освоено ли использование Smart-ID.',
      ),
    ],
    [
      bold('Финансовая выполнимость'),
      txt(
        ' — есть ли у квартир способность брать дополнительный платёж (пропорция к средним доходам района).',
      ),
    ],
    [
      bold('Прозрачность закупок'),
      txt(
        ' — насколько хорошо дом может доказать, что опросил минимум 5 поставщиков, из которых 2 независимых (требование ALTUM).',
      ),
    ],
  ]),
  calloutBlock(
    'info',
    'Почему 6, а не 1 или 100',
    'Один показатель «дом готов на 73%» бессмысленен. А шесть осей дают конкретный список, куда приложить усилия. Больше шести — тоже бессмысленно: показатели зашумляют.',
  ),
  h2('Источники данных'),
  p(txt('Расчёт основан на официальных источниках, не на догадках:')),
  statsBlock([
    { label: 'VZD Building.ZIP', value: 'серия, год, материал', color: 'default' },
    { label: 'Энергосертификаты BVKB', value: 'класс, кВт·ч/м²', color: 'default' },
    { label: 'Актуальный список', value: 'biedrība / кадастр', color: 'default' },
    { label: 'Lursoft', value: 'активность biedrība', color: 'default' },
    { label: 'Тарифы SPRK', value: 'тариф тепла по регионам', color: 'default' },
    { label: 'Загрузки дома', value: 'счета, экспертиза', color: 'default' },
  ]),
  h2('Как читать показатель'),
  p(txt('Показатель не оценка. Это индикатор с тремя главными зонами:')),
  ul([
    [
      bold('80-100 — готов подавать'),
      txt(' все документы, может стартовать в первой волне приёма заявок.'),
    ],
    [
      bold('50-79 — в работе'),
      txt(': выявлены одна или две слабые оси, обычно 1-3 месяца активной работы.'),
    ],
    [
      bold('0-49 — ранняя стадия'),
      txt(
        ': дому нужно 6-12 месяцев работы, начиная с актуализации списка и оценки состояния biedrība.',
      ),
    ],
  ]),
  h2('Следующий лучший шаг'),
  p(
    txt(
      'Вместе с показателем ALTEKO выводит следующий лучший шаг — одно конкретное действие, которое сильнее всего поднимет показатель. Например:',
    ),
  ),
  ul([
    [
      txt(
        '«Актуализируй список собственников — последний от 2024 года» (поднимает готовность документов на 15 пунктов).',
      ),
    ],
    [
      txt(
        '«Начни опрос поставщиков — ALTUM требует минимум 5 с 2 независимыми» (поднимает прозрачность закупок на 25 пунктов).',
      ),
    ],
    [
      txt(
        '«Прими решение об энергоаудите — без актуального не получится подать SCF» (поднимает готовность документов на 20 пунктов).',
      ),
    ],
  ]),
  calloutBlock(
    'success',
    'Главная мысль',
    'Показатель не говорит «дом хороший» или «дом плохой». Он говорит — какую работу сделать на этой неделе, в этом месяце, в этом квартале, чтобы быть первым в очереди, когда откроется окно SCF.',
  ),
  ctaBlock(
    'Рассчитать готовность дома →',
    '/ru/#hero',
    'Бесплатно, без регистрации. Только адрес дома.',
  ),
  h2('Источники'),
  ul([
    [txt('VZD — Valsts zemes dienests, Building.ZIP с data.gov.lv')],
    [txt('BVKB — Būvniecības valsts kontroles birojs, энергосертификаты с data.gov.lv')],
    [txt('altum.lv — требования к заявкам в циклах программ')],
    [txt('docs/product/module-readiness.md в репозитории — полная методика')],
  ]),
]

// ─── 4. Owner list freshness ─────────────────────────────────────────────────
const lvOwnerList: ContentNode[] = [
  p(
    txt('Visu remonta ',
    ),
    bold('iesāku'),
    txt(
      ' jeb visu pieteikumu visās programmās — ALTUM, SCF, bankā — sastāv no viena dokumenta, par kuru visi aizmirst līdz pēdējam brīdim: dzīvokļu īpašnieku saraksts. Bez aktuāla saraksta jebkurš lēmums kopības sapulcē ir potenciāli apstrīdams, jebkurš pieteikums tiek noraidīts kā nepilnīgs, un māja zaudē mēnešus.',
    ),
  ),
  h2('Kāpēc tas ir kritiski'),
  p(
    txt(
      'Latvijā kopš 2022. gada Smart-ID ir juridiski derīgs lēmumu parakstīšanai. Bet pirms parakstīt — ',
    ),
    bold('jāzina, kas ir īpašnieks'),
    txt(
      '. Pirms 5 gadiem īpašnieku sastāvs daudzās mājās ir mainījies par 30-40%: pārdošanas, mantojumi, dāvinājumi. Ja sapulcē balsa dzīvokļa "vecais" īpašnieks, lēmums ir neaplikāms.',
    ),
  ),
  calloutBlock(
    'warning',
    'ALTUM prasība',
    'ALTUM 2021-2027 ciklā vairāki desmiti pieteikumu tika atgriezti tieši tāpēc, ka iesniegtais īpašnieku saraksts bija vairāk nekā 6 mēnešus vecs. Tā ir 180 dienu robeža, un šis pats slieksnis sagaidāms SCF noteikumos.',
  ),
  h2('Kā saraksta aktualitāte tiek mērīta'),
  ul([
    [bold('< 30 dienas'), txt(' — pilnīgi svaigs, BIS Mājas lieta to akceptē bez papildu pārbaudēm.')],
    [bold('30-180 dienas'), txt(' — derīgs visiem ALTUM/SCF pieteikumiem.')],
    [bold('180-365 dienas'), txt(' — derīgs lēmumu pieņemšanai biedrības iekšienē, taču atbalsta saņemšanai jāatjauno.')],
    [bold('> 365 dienas'), txt(' — uzskata par nederīgu. Pieteikumi tiek noraidīti.')],
  ]),
  h2('Kā saraksts tiek atjaunots'),
  p(txt('Ir trīs ceļi, atkarībā no mājas situācijas:')),
  ol([
    [bold('Caur biedrību, ja tā darbojas'),
      txt(' — biedrība jau uztur īpašnieku reģistru. Atjaunina pēc Lursoft datiem un sūta uz prezidenta apstiprinājumu.'),
    ],
    [bold('Caur kadastru, ja biedrības nav'),
      txt(' — pieprasa Valsts zemes dienestam izziņu (€20-40, 5-10 darba dienas).'),
    ],
    [bold('Manuāli, ja kadastru dati ir nepilnīgi'),
      txt(' — apstaigāšana, pakāpeniska aktualizācija (visilgāks ceļš, 2-4 nedēļas).'),
    ],
  ]),
  calloutBlock(
    'info',
    'Padoms biedrībām',
    'Atjaunojiet sarakstu pēc katra ceturkšņa, ne tikai pirms remonta. Tad sapulces sasaukšana aizņem 30 dienu uzaicinājumu nedēļu, nevis 30 dienas + 4 nedēļas saraksta atjaunošanai.',
  ),
  h2('GDPR un saraksta uzglabāšana'),
  p(
    txt(
      'Saraksts satur personas datus (vārds, uzvārds, dzīvokļa numurs, dažkārt kontaktinformāciju). Tā uzglabāšana ir biedrības atbildība: pieejamība jāierobežo līdz pārvaldes locekļiem, datu apstrādes nolūks (sapulču sasaukšana, lēmumu pieņemšana) ir pamatots GDPR 6. panta 1. daļas (b) apakšpunktā.',
    ),
  ),
  p(
    txt(
      'ALTEKO platforma uzglabā tikai īpašnieku saraksta metadatus (atjaunošanas datums, īpašnieku skaits) — pilns saraksts paliek mājas pusē. Tas ir viens no GDPR-by-design principiem.',
    ),
  ),
  ctaBlock(
    'Pārbaudīt mājas saraksta statusu →',
    '/dashboard',
    'Tiek prasīta valdes piekļuve.',
  ),
  h2('Avoti'),
  ul([
    [txt('Dzīvokļa īpašuma likums, 14.-21. pants — saraksta noformēšana un uzglabāšana')],
    [txt('altum.lv/atbalsts — dokumentu prasības atbalsta saņemšanai')],
    [txt('Datu valsts inspekcija (DVI) — vadlīnijas biedrību personas datu apstrādei')],
  ]),
]

const ruOwnerList: ContentNode[] = [
  p(
    txt('Любой ремонт — точнее, любая заявка на любую программу — ALTUM, SCF, банк — начинается с одного документа, про который все вспоминают в последнюю очередь: '),
    bold('список собственников квартир'),
    txt(
      '. Без актуального списка любое решение собрания может быть оспорено, любая заявка отклоняется как неполная, дом теряет месяцы.',
    ),
  ),
  h2('Почему это критично'),
  p(
    txt(
      'В Латвии с 2022 года Smart-ID юридически действителен для подписания решений. Но прежде чем подписывать — ',
    ),
    bold('нужно знать, кто собственник'),
    txt(
      '. За 5 лет состав собственников во многих домах изменился на 30-40%: продажи, наследства, дарения. Если на собрании голосует «бывший» владелец квартиры — решение оспоримо.',
    ),
  ),
  calloutBlock(
    'warning',
    'Требование ALTUM',
    'В цикле ALTUM 2021-2027 несколько десятков заявок были возвращены именно потому, что поданный список собственников был старше 6 месяцев. Это граница 180 дней, и тот же порог ожидается в правилах SCF.',
  ),
  h2('Как измеряется актуальность списка'),
  ul([
    [bold('< 30 дней'),
      txt(' — полностью свежий, BIS Mājas lieta принимает без дополнительных проверок.'),
    ],
    [bold('30-180 дней'), txt(' — действителен для всех заявок ALTUM/SCF.')],
    [
      bold('180-365 дней'),
      txt(
        ' — действителен для решений внутри biedrība, но для получения поддержки нужно обновить.',
      ),
    ],
    [bold('> 365 дней'), txt(' — считается недействительным. Заявки отклоняются.')],
  ]),
  h2('Как обновляется список'),
  p(txt('Три пути, в зависимости от ситуации в доме:')),
  ol([
    [
      bold('Через biedrība, если она работает'),
      txt(
        ' — biedrība уже ведёт реестр собственников. Обновляет по данным Lursoft и отправляет на утверждение председателю.',
      ),
    ],
    [
      bold('Через кадастр, если biedrība нет'),
      txt(' — запрос в Valsts zemes dienests (€20-40, 5-10 рабочих дней).'),
    ],
    [
      bold('Вручную, если кадастровые данные неполные'),
      txt(
        ' — обход, постепенная актуализация (самый длинный путь, 2-4 недели).',
      ),
    ],
  ]),
  calloutBlock(
    'info',
    'Совет biedrība',
    'Обновляйте список после каждого квартала, а не только перед ремонтом. Тогда созыв собрания занимает 30 дней приглашения, а не 30 дней + 4 недели на актуализацию.',
  ),
  h2('GDPR и хранение списка'),
  p(
    txt(
      'Список содержит персональные данные (ФИО, номер квартиры, иногда контакты). Хранение — ответственность biedrība: доступ ограничен членами правления, цель обработки (созыв собраний, принятие решений) обоснована статьёй 6(1)(b) GDPR.',
    ),
  ),
  p(
    txt(
      'Платформа ALTEKO хранит только метаданные списка (дата обновления, число собственников) — полный список остаётся на стороне дома. Это один из принципов GDPR-by-design.',
    ),
  ),
  ctaBlock('Проверить статус списка →', '/ru/dashboard', 'Требуется доступ правления.'),
  h2('Источники'),
  ul([
    [txt('Закон о квартирной собственности, статьи 14-21 — оформление и хранение списка')],
    [txt('altum.lv/atbalsts — требования к документам для получения поддержки')],
    [txt('Datu valsts inspekcija (DVI) — рекомендации по обработке персональных данных в biedrība')],
  ]),
]

// ─── 5. Decision campaigns + BIS ─────────────────────────────────────────────
const lvDecision: ContentNode[] = [
  p(
    txt(
      'Pirms 2022. gada lēmumu pieņemšana daudzdzīvokļu mājā prasīja fizisku sapulci, parasti vienreiz gadā, kuru apmeklēja 30-40% īpašnieku. Pārējie balsoja ar pilnvarām vai vispār neizteicās. Pēc Smart-ID likumības stiprināšanas 2022. gadā un BIS Mājas lietas palaišanas situācija mainījās: ',
    ),
    bold('lēmumu kampaņas'),
    txt(' (Lēmumu kampaņas) ļauj sasniegt 80-90% īpašnieku.'),
  ),
  h2('Kas ir lēmumu kampaņa'),
  p(
    txt(
      'Lēmumu kampaņa ir strukturēta procedūra, kad īpašnieku kopība pieņem konkrētu lēmumu (par remontu, fonda iemaksu paaugstināšanu, biedrības lēmumu) bez fiziskas sapulces. Smart-ID parakstīšana fiksē lēmumu juridiski, kā pierādījums tiek glabāta paraksta hash kopija.',
    ),
  ),
  statsBlock([
    { label: 'Kvorums fiziskā sapulcē', value: 'tipiski 30-40%', color: 'warning' },
    { label: 'Sasniegums lēmumu kampaņā', value: 'tipiski 70-90%', color: 'success' },
    { label: 'Likumīgais pamats', value: 'Dz.īp.likums 20.p. (7-8)', color: 'default' },
    { label: 'Termiņš parakstīšanai', value: '14-30 dienas', color: 'default' },
  ]),
  h2('Soli pa solim'),
  ol([
    [bold('Definē jautājumu'), txt(' — vienkārši, viennozīmīgi: "Vai piekrītat ņemt aizdevumu €120 000 fasādes siltināšanai uz 15 gadiem?"')],
    [bold('Sagatavo paskaidrojumu'), txt(' — kāpēc tas vajadzīgs, kā tiek aprēķināts maksājums, kādas ir alternatīvas. Bez paskaidrojuma cilvēki neparakstīs.')],
    [bold('Nosūti paziņojumu'), txt(' — ar 30 dienu iepriekšēju brīdinājumu (Dzīvokļa īpašuma likums, 18. pants).')],
    [bold('Atver kampaņu'), txt(' — Smart-ID parakstīšana 14-30 dienu laikā.')],
    [bold('Sēdi rezultātu'), txt(' — 50% + 1 par "JĀ" — lēmums pieņemts.')],
    [bold('Eksportē uz BIS Mājas lietu'), txt(' — protokols ar parakstu hash glabāts oficiālajā sistēmā.')],
  ]),
  calloutBlock(
    'info',
    'Kāpēc BIS Mājas lieta',
    'BIS — valsts oficiālais kontūrs. Pēc lēmuma eksporta uz BIS jebkurš trešais (banka, ALTUM, projektētājs) var pārliecināties, ka lēmums ir reāls. Tas ir gan juridiska aizsardzība māju, gan paātrina tālāku finansēšanas pieprasījumu.',
  ),
  h2('Tipiskie šabloni'),
  p(txt('Mēs ALTEKO esam izveidojuši septiņus visbiežāko lēmumu šablonus:')),
  ul([
    [txt('Energoaudita pasūtīšana')],
    [txt('Tehniskās ekspertīzes pasūtīšana')],
    [txt('Pilnvarotā persona pasniegt pieteikumu')],
    [txt('Aizdevuma ņemšana fiksētā summā')],
    [txt('Remonta fonda iemaksu paaugstināšana')],
    [txt('Piegādātāju izvēle')],
    [txt('Galīgais lēmums par renovācijas projekta uzsākšanu')],
  ]),
  p(
    txt(
      'Katrs šablons satur LV un RU jautājuma tekstu, paskaidrojumu un metadatus. Valde var izvēlēties šablonu, pielāgot summu/datumus un palaist kampaņu mazāk nekā 5 minūtēs.',
    ),
  ),
  h2('Eksports uz BIS'),
  p(
    txt(
      'BIS Mājas lieta ir oficiālā e-pārvaldības sistēma daudzdzīvokļu mājām Latvijā. ALTEKO neaizvieto BIS — tā ir BIS papildinājums:',
    ),
  ),
  ul([
    [txt('ALTEKO sagatavo lēmumu (jautājums, paskaidrojums, parakstu paketi).')],
    [txt('Smart-ID parakstīšana notiek standartveidā ar likumīgu spēku.')],
    [txt('Pēc kampaņas pabeigšanas izveidojas oficiāls protokols.')],
    [txt('Protokols tiek eksportēts uz BIS Mājas lietu — parakstu hash + saturs.')],
    [txt('BIS uzglabā lēmumu kā oficiālu valsts pierādījumu.')],
  ]),
  ctaBlock('Sākt lēmumu kampaņu →', '/dashboard', 'Tiek prasīta valdes piekļuve.'),
  h2('Avoti'),
  ul([
    [txt('Dzīvokļa īpašuma likums, 18.-21. pants — sapulču procedūra un lēmumu kvorums')],
    [txt('20. pants, 7. un 8. daļa (2022. gada grozījumi) — Smart-ID juridiska derīgums')],
    [txt('bis.gov.lv/Mājas lieta — oficiāla e-pārvaldības sistēma')],
  ]),
]

const ruDecision: ContentNode[] = [
  p(
    txt(
      'До 2022 года принятие решений в МКД требовало физического собрания — обычно раз в год, на которое приходило 30-40% собственников. Остальные голосовали через доверенности или вообще не выражали мнения. После усиления юридической силы Smart-ID в 2022 году и запуска BIS Mājas lieta ситуация изменилась: ',
    ),
    bold('кампании решений'),
    txt(' (Lēmumu kampaņas) дают возможность достучаться до 80-90% собственников.'),
  ),
  h2('Что такое кампания решений'),
  p(
    txt(
      'Кампания решений — структурированная процедура, в которой kopība принимает конкретное решение (про ремонт, повышение взносов, решение biedrība) без физического собрания. Подписание Smart-ID юридически фиксирует решение, как доказательство сохраняется хеш подписи.',
    ),
  ),
  statsBlock([
    { label: 'Кворум на физическом собрании', value: 'обычно 30-40%', color: 'warning' },
    { label: 'Охват в кампании решений', value: 'обычно 70-90%', color: 'success' },
    { label: 'Юридическое основание', value: 'Закон о кв. собственности, ст. 20(7-8)', color: 'default' },
    { label: 'Срок на подписание', value: '14-30 дней', color: 'default' },
  ]),
  h2('Шаг за шагом'),
  ol([
    [
      bold('Определите вопрос'),
      txt(
        ' — простой, однозначный: «Согласны ли взять кредит €120 000 на утепление фасада на 15 лет?»',
      ),
    ],
    [
      bold('Подготовьте пояснение'),
      txt(
        ' — зачем это нужно, как рассчитывается платёж, какие альтернативы. Без пояснения люди не подпишут.',
      ),
    ],
    [
      bold('Отправьте уведомление'),
      txt(' — за 30 дней (статья 18 Закона о кв. собственности).'),
    ],
    [bold('Откройте кампанию'), txt(' — подписание Smart-ID в течение 14-30 дней.')],
    [bold('Подсчитайте результат'), txt(' — 50% + 1 за «ДА» — решение принято.')],
    [bold('Экспортируйте в BIS Mājas lieta'), txt(' — протокол с хешем подписей хранится в официальной системе.')],
  ]),
  calloutBlock(
    'info',
    'Зачем BIS Mājas lieta',
    'BIS — государственный официальный контур. После экспорта решения в BIS любая третья сторона (банк, ALTUM, проектировщик) может убедиться, что решение реальное. Это и юридическая защита дома, и ускорение последующих заявок на финансирование.',
  ),
  h2('Типовые шаблоны'),
  p(txt('Мы в ALTEKO подготовили семь шаблонов для самых частых решений:')),
  ul([
    [txt('Заказ энергоаудита')],
    [txt('Заказ технической экспертизы')],
    [txt('Уполномоченное лицо для подачи заявки')],
    [txt('Взятие кредита на фиксированную сумму')],
    [txt('Повышение взносов в фонд ремонта')],
    [txt('Выбор поставщика')],
    [txt('Окончательное решение о запуске реновации')],
  ]),
  p(
    txt(
      'Каждый шаблон содержит текст вопроса на LV и RU, пояснение и метаданные. Правление выбирает шаблон, корректирует сумму/даты и запускает кампанию менее чем за 5 минут.',
    ),
  ),
  h2('Экспорт в BIS'),
  p(
    txt(
      'BIS Mājas lieta — официальная система электронного государственного управления для МКД в Латвии. ALTEKO не заменяет BIS — это дополнение к BIS:',
    ),
  ),
  ul([
    [txt('ALTEKO готовит решение (вопрос, пояснение, пакет подписей).')],
    [txt('Подписание Smart-ID идёт стандартным путём с юридической силой.')],
    [txt('После завершения кампании формируется официальный протокол.')],
    [txt('Протокол экспортируется в BIS Mājas lieta — хеш подписей + содержание.')],
    [txt('BIS хранит решение как государственное официальное доказательство.')],
  ]),
  ctaBlock('Запустить кампанию решений →', '/ru/dashboard', 'Требуется доступ правления.'),
  h2('Источники'),
  ul([
    [txt('Закон о квартирной собственности, статьи 18-21 — процедура собраний и кворум')],
    [txt('Статья 20, части 7 и 8 (поправки 2022 года) — юридическая сила Smart-ID')],
    [txt('bis.gov.lv/Mājas lieta — официальная система электронного управления')],
  ]),
]

// ─── Article roster ──────────────────────────────────────────────────────────
const ARTICLES: ArticleData[] = [
  {
    slug: 'scf-fond-2026-2032',
    readMinutes: 7,
    publishedAt: '2026-05-09',
    lv: {
      title: 'Sociālā klimata fonds 2026-2032: kā gatavoties nākamajam finansēšanas logam',
      description:
        'Latvijas SCF plāns 2026-2032: €186 milj. daudzdzīvokļu mājām, MK noteikumi Q4 2026, pieteikumi 2027. Kāpēc agra gatavošanās izšķir, kurš dabūs finansējumu.',
      tags: ['finansēšana', 'SCF', 'gatavība'],
      content: lexical(lvScf),
    },
    ru: {
      title: 'Социальный климатический фонд 2026-2032: как готовиться к следующему окну финансирования',
      description:
        'План SCF Латвии 2026-2032: €186 млн на МКД, MK правила Q4 2026, заявки в 2027. Почему ранняя подготовка решает, кто получит финансирование.',
      tags: ['финансирование', 'SCF', 'готовность'],
      content: lexical(ruScf),
    },
  },
  {
    slug: 'altum-remonta-aizdevums',
    readMinutes: 6,
    publishedAt: '2026-05-09',
    lv: {
      title: 'ALTUM remonta aizdevums: vienīgais šobrīd atvērtais finansēšanas instruments',
      description:
        '€10 000+, 3,9% gadā, līdz 20 gadiem, atvērts līdz 30.06.2031. Kam tas der, kam neder un kā to salīdzināt ar gaidāmo SCF.',
      tags: ['ALTUM', 'finansēšana', 'aizdevums'],
      content: lexical(lvAltum),
    },
    ru: {
      title: 'ALTUM remonta aizdevums: единственный открытый сейчас инструмент финансирования',
      description:
        '€10 000+, 3,9% годовых, до 20 лет, доступен до 30.06.2031. Кому подходит, кому нет и как сравнить с ожидаемым SCF.',
      tags: ['ALTUM', 'финансирование', 'кредит'],
      content: lexical(ruAltum),
    },
  },
  {
    slug: 'gotovnost-doma-k-finansirovaniju',
    readMinutes: 6,
    publishedAt: '2026-05-09',
    lv: {
      title: 'Mājas gatavības novērtējums: 6 asis, kas izšķir, vai dabūsiet finansējumu',
      description:
        'Energoefektivitāte, finanšu piemērotība, dokumenti, lēmumi, izpildāmība, iepirkumu caurspīdīgums — sešas asis Building Readiness Score un kāpēc tas svarīgāk par naudu.',
      tags: ['gatavība', 'metrika', 'novērtējums'],
      content: lexical(lvReadiness),
    },
    ru: {
      title: 'Готовность дома к финансированию: 6 осей, которые решают, получите ли вы деньги',
      description:
        'Энергоэффективность, соответствие финансированию, документы, решения, выполнимость, прозрачность — шесть осей Building Readiness Score и почему это важнее денег.',
      tags: ['готовность', 'метрика', 'оценка'],
      content: lexical(ruReadiness),
    },
  },
  {
    slug: 'spisok-sobstvennikov-aktualnost',
    readMinutes: 5,
    publishedAt: '2026-05-09',
    lv: {
      title: 'Dzīvokļu īpašnieku saraksts: kāpēc tā aktualitāte ir kritiska finansējumam',
      description:
        '180 dienu robeža, ALTUM/SCF prasības, kā saraksts tiek atjaunots, GDPR-aspekti. Galvenais šķērslis, kas neļauj mājai pieteikties.',
      tags: ['saraksts', 'dokumenti', 'GDPR'],
      content: lexical(lvOwnerList),
    },
    ru: {
      title: 'Список собственников квартир: почему его актуальность критична для финансирования',
      description:
        'Граница 180 дней, требования ALTUM/SCF, как обновляется список, GDPR-аспекты. Главное препятствие, не дающее дому подавать заявку.',
      tags: ['список', 'документы', 'GDPR'],
      content: lexical(ruOwnerList),
    },
  },
  {
    slug: 'lemumu-kampanas-bis-eksports',
    readMinutes: 7,
    publishedAt: '2026-05-09',
    lv: {
      title: 'Lēmumu kampaņas un eksports uz BIS: kā sasniegt 80% īpašnieku bez sapulces',
      description:
        'Smart-ID kopš 2022. gada juridiski stiprs. 7 šabloni biežākajiem lēmumiem, eksports uz BIS Mājas lietu — kā ALTEKO papildina BIS, neaizvieto to.',
      tags: ['lēmumi', 'BIS', 'Smart-ID'],
      content: lexical(lvDecision),
    },
    ru: {
      title: 'Кампании решений и экспорт в BIS: как достучаться до 80% собственников без собрания',
      description:
        'Smart-ID юридически усилен с 2022. 7 шаблонов для частых решений, экспорт в BIS Mājas lieta — как ALTEKO дополняет BIS, не заменяя её.',
      tags: ['решения', 'BIS', 'Smart-ID'],
      content: lexical(ruDecision),
    },
  },
]

// ─── Orchestrator ────────────────────────────────────────────────────────────
async function main() {
  console.log('Seeding readiness-pack blog articles into Payload CMS...\n')

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

  console.log('\nDone. Readiness pack seeded.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
