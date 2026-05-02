import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── MDX content strings ─────────────────────────────────────────────────────

const ALTUM_RU = `
Государство готово покрыть почти половину стоимости реновации вашего дома — и большинство жильцов об этом не знают. Разбираем программу Altum по шагам.

<Callout type="info" title="Ключевые факты">
- Субсидия: **до 49–50% стоимости** (безвозвратно)
- Программа действует с 2009 года
- Завершили реновацию: 624 дома из ~23 500 нуждающихся (2,7%)
- Требуется: ≥50% голосов собственников квартир
</Callout>

## Что такое Altum и причём здесь субсидия

**Altum** — государственный банк развития Латвии. Программа *«Daudzdzīvokļu māju renovācija»* работает с 2009 года: государство напрямую субсидирует до 49% затрат на реновацию. Это не кредит — деньги не нужно возвращать.

Оставшиеся ~51% жильцы финансируют сами — либо из накоплений, либо через кредит от Altum под льготную ставку. Срок окупаемости для жильцов — 8–12 лет, а экономия на отоплении начинается с первого месяца после завершения работ.

## Кто может получить субсидию

Требования к дому:

- Построен до 1993 года (преимущественно советский период)
- Не менее 3 квартир
- Зарегистрированная *biedrība* собственников или правление
- Готовность провести аудит и разработать техническое задание

Фактически под эти условия подпадает подавляющее большинство советских панельных домов в Риге, Даугавпилсе, Резекне, Елгаве и других городах.

## Почему только 2,7% домов прошли реновацию

За 15+ лет программы реновировано 624 дома из примерно 23 500 нуждающихся. Это 2,7%. При таком темпе программа займёт ещё 500 лет.

Причины провала не финансовые — субсидия щедрая. Причины организационные:

- Трудно собрать 50%+ голосов в письменном виде
- Сложно понять, какие документы нужны и в каком порядке
- Нет единой площадки для выбора подрядчика
- Управляющие компании не заинтересованы в помощи

ALTEKO создан именно для того, чтобы устранить эти барьеры — от первого счёта до подписанного договора с подрядчиком.

<InlineCta label="Проверить расходы →" note="Первый шаг — понять, на сколько переплачивает ваш дом." />

## Процесс шаг за шагом

1. **Аудит расходов** — понять отправную точку: сколько дом тратит сейчас и насколько это отличается от нормы.
2. **Техническое обследование** — профессиональный энергоаудит здания: теплопотери, состояние фасада, окон, крыши, инженерных систем.
3. **Разработка технического задания** — список работ, смета, сроки. Это основа для подачи заявки в Altum.
4. **Голосование собственников** — нужно ≥50% «за» от всех собственников. Smart-ID позволяет голосовать электронно — законно с 2022 г.
5. **Подача в Altum** — заявление о намерении + пакет документов. Altum рассматривает в течение 30 рабочих дней.
6. **Тендер и выбор подрядчика** — минимум 3 предложения. Altum проверяет соответствие смете.
7. **Строительство и субсидия** — Altum выплачивает субсидию после завершения работ и инспекции.

## Сколько придётся заплатить жильцам

Типичная стоимость реновации 9-этажного дома серии 119 в Риге (5 400 м²) — €500 000–700 000. Altum покрывает ~€250 000–350 000. Остаток делится между квартирами пропорционально площади.

<StatsTable rows={[
  { label: "Полная стоимость реновации", value: "€600 000" },
  { label: "Субсидия Altum (49%)", value: "€294 000", color: "text-success" },
  { label: "Доля жильцов", value: "€306 000" },
  { label: "На квартиру 50 м² (из 100 кв.)", value: "~€1 530", color: "text-primary" }
]} />

## Источники

- [altum.lv — программа реновации многоквартирных домов](https://www.altum.lv/privatpersonam/majokla-energoefektivitate/)
- [fi-compass.eu — Altum case study (декабрь 2024)](https://www.fi-compass.eu/publication/case-studies/altum-multi-family-building-renovation-programme-latvia)
- [likumi.lv — Dzīvokļa īpašuma likums](https://likumi.lv/ta/id/60980)
`

const ALTUM_LV = `
Valsts ir gatava segt gandrīz pusi no jūsu mājas renovācijas izmaksām — un lielākā daļa iedzīvotāju par to nezina. Izskaidrojam Altum programmu soli pa solim.

<Callout type="info" title="Galvenie fakti">
- Subsīdija: **līdz 49–50% no izmaksām** (neatmaksājama)
- Programma darbojas kopš 2009. gada
- Renovāciju pabeigušas: 624 mājas no ~23 500 nepieciešamajām (2,7%)
- Nepieciešams: ≥50% dzīvokļu īpašnieku balsu
</Callout>

## Kas ir Altum un kāda saistība ar subsīdiju

**Altum** — Latvijas valsts attīstības banka. Programma *«Daudzdzīvokļu māju renovācija»* darbojas kopš 2009. gada: valsts tieši subsidē līdz 49% no renovācijas izmaksām. Tā nav aizdevums — nauda nav jāatmaksā.

Atlikušos ~51% iedzīvotāji finansē paši — no uzkrājumiem vai ar Altum aizdevumu par preferenciālo likmi. Atmaksāšanās termiņš — 8–12 gadi, bet ietaupījumi apkurē sākas no pirmā mēneša pēc darbu pabeigšanas.

## Kas var saņemt subsīdiju

Prasības mājai:

- Uzbūvēta līdz 1993. gadam (galvenokārt padomju periods)
- Vismaz 3 dzīvokļi
- Reģistrēta dzīvokļu īpašnieku *biedrība* vai pārvalde
- Gatavība veikt auditu un izstrādāt tehnisko uzdevumu

Faktiski šīm prasībām atbilst lielākā daļa padomju laika paneļu māju Rīgā, Daugavpilī, Rēzeknē, Jelgavā un citās pilsētās.

## Kāpēc tikai 2,7% māju ir renovētas

15+ gadu laikā renovētas 624 mājas no aptuveni 23 500 nepieciešamajām. Tas ir 2,7%. Šādā tempā programma ilgs vēl 500 gadus.

Neveiksmes iemesli nav finansiāli — subsīdija ir dāsna. Iemesli ir organizatoriski:

- Grūti savākt 50%+ balsu rakstiski
- Sarežģīti saprast, kādi dokumenti nepieciešami un kādā secībā
- Nav vienotas platformas darbuzņēmēju izvēlei
- Apsaimniekotājiem nav intereses palīdzēt

ALTEKO ir izveidots tieši lai novērstu šos šķēršļus — no pirmā rēķina līdz parakstītam līgumam ar darbuzņēmēju.

<InlineCta label="Pārbaudīt izdevumus →" note="Pirmais solis — saprast, cik jūsu māja pārmaksā." />

## Process soli pa solim

1. **Izdevumu audits** — saprast sākumpunktu: cik māja tērē tagad un cik tas atšķiras no normas.
2. **Tehniskā apsekošana** — profesionāls ēkas energoaudits: siltuma zudumi, fasādes, logu, jumta, inženiersistēmu stāvoklis.
3. **Tehniskā uzdevuma izstrāde** — darbu saraksts, tāme, termiņi. Tas ir Altum pieteikuma pamats.
4. **Dzīvokļu īpašnieku balsojums** — nepieciešams ≥50% «par» no visiem īpašniekiem. Smart-ID ļauj balsot elektroniski — likumīgi kopš 2022. gada.
5. **Iesniegšana Altum** — nodomu pieteikums + dokumentu pakete. Altum izskata 30 darba dienu laikā.
6. **Iepirkums un darbuzņēmēja izvēle** — vismaz 3 piedāvājumi. Altum pārbauda atbilstību tāmei.
7. **Būvniecība un subsīdija** — Altum izmaksā subsīdiju pēc darbu pabeigšanas un inspekcijas.

## Cik būs jāmaksā iedzīvotājiem

Tipiskās 9 stāvu 119. sērijas mājas renovācijas izmaksas Rīgā (5 400 m²) — €500 000–700 000. Altum sedz ~€250 000–350 000. Atlikums tiek sadalīts starp dzīvokļiem proporcionāli platībai.

<StatsTable rows={[
  { label: "Pilnas renovācijas izmaksas", value: "€600 000" },
  { label: "Altum subsīdija (49%)", value: "€294 000", color: "text-success" },
  { label: "Iedzīvotāju daļa", value: "€306 000" },
  { label: "50 m² dzīvoklim (no 100 dz.)", value: "~€1 530", color: "text-primary" }
]} />

## Avoti

- [altum.lv — daudzdzīvokļu māju renovācijas programma](https://www.altum.lv/privatpersonam/majokla-energoefektivitate/)
- [fi-compass.eu — Altum gadījuma izpēte (2024. gada decembris)](https://www.fi-compass.eu/publication/case-studies/altum-multi-family-building-renovation-programme-latvia)
- [likumi.lv — Dzīvokļa īpašuma likums](https://likumi.lv/ta/id/60980)
`

const NORMA_RU = `
Счёт за отопление пришёл — и непонятно, это много или нормально? Разбираемся, как оценить расходы вашего дома и что считается переплатой.

<Callout type="warning" title="Типичная картина в Латвии">
- Средняя переплата за отопление в советских домах: **+23% к норме**
- Дома класса D–E платят за тепло в 1,5–2 раза больше реновированных
- За горячую воду переплата: **+15% в среднем**
- За уборку — до **+47%** выше медианы
</Callout>

## Как считается «норма»

Единой официальной нормы потребления тепла на м² в Латвии нет — SPRK регулирует тарифы поставщиков, но не контролирует эффективность зданий. Это пространство без надзора: управляющая компания может выставлять любую сумму, и жильцы не знают, нормально ли это.

Реальный бенчмарк формируется из сравнения: сколько тратит ваш дом против похожих домов той же серии, в том же квартале, схожей площади. Именно это делает ALTEKO — строит медиану по сотням загруженных счетов и показывает ваше отклонение.

## Типичные расходы по классу энергоэффективности

| Класс | Тип здания | Отопление, €/м²/мес. |
|-------|-----------|----------------------|
| A–B | После реновации | 0,60–0,90 |
| C | Частично утеплённый | 0,90–1,20 |
| D | Советский, типовой | 1,20–1,80 |
| E–G | Ветхий, без утепления | 1,80–2,50+ |

## Почему одинаковые дома платят по-разному

Два дома серии 119, построенных в одном году, могут отличаться по расходам в 1,5 раза. Причины:

- **Система отопления.** ИТП экономит 15–25% по сравнению с централизованным регулированием.
- **Состояние фасада.** Трещины, отсутствие утепления на торцах, щели у балконов — дополнительные теплопотери.
- **Управляющая компания.** Одна вовремя регулирует подачу тепла при потеплении, другая — нет. Разница до 20%.
- **Горизонт сравнения.** Управляющие компании сравнивают ваш дом с «планом» — который сами и составили. Реального рыночного бенчмарка у них нет.

<InlineCta label="Проверить ваш дом →" note="Загрузите счёт — сравним с нормой по серии и кварталу." />

## Признаки того, что вы переплачиваете

Проверьте по своему счёту:

- Плата за отопление выше €1.50/м² в месяц в январе — это уже выше медианы для класса D.
- Разница между общедомовым счётчиком воды и суммой квартирных счётчиков превышает 15% — возможна утечка.
- Строка «администрирование» больше €0.25/м²/мес. — заметно выше медианы по рынку.
- Строка «уборка» больше €0.35/м²/мес. — стоит запросить детализацию у управляющей компании.

## Что делать, если дом переплачивает

Три уровня реакции — в зависимости от масштаба проблемы:

1. **Быстрый:** запросить детализацию у управляющей компании. По любой строке имеете право получить расшифровку.
2. **Средний:** потребовать установку ИТП или балансировки системы отопления.
3. **Полный:** запустить реновацию с субсидией Altum. Устраняет проблему на 30+ лет. Государство покрывает до 49% затрат.

## Источники

- [sprk.gov.lv — тарифы и нормативы ЖКХ](https://www.sprk.gov.lv)
- [altum.lv — программа энергоэффективности](https://www.altum.lv)
- [data.gov.lv — энергосертификаты BVKB](https://data.gov.lv)
`

const NORMA_LV = `
Apkures rēķins ir pienācis — un nav skaidrs, vai tas ir daudz vai normāli? Noskaidrojam, kā novērtēt jūsu mājas izdevumus un kas tiek uzskatīts par pārmaksu.

<Callout type="warning" title="Tipiskais attēls Latvijā">
- Vidējā pārmaksa par apkuri padomju mājās: **+23% virs normas**
- D–E klases mājas par siltumu maksā 1,5–2 reizes vairāk nekā renovētās
- Par karstā ūdens apgādi pārmaksa: **+15% vidēji**
- Par uzkopšanu — līdz **+47%** virs mediānas
</Callout>

## Kā tiek aprēķināta «norma»

Latvijā nav vienotas oficiālās siltumenerģijas patēriņa normas uz m² — SPRK regulē piegādātāju tarifus, bet nekontrolē ēku efektivitāti. Šī ir uzraudzības robu zona: apsaimniekotājs var izrakstīt jebkuru summu, un iedzīvotāji nezina, vai tā ir normāla.

Reāls etalons veidojas no salīdzinājuma: cik tērē jūsu māja salīdzinājumā ar līdzīgām mājām vienā sērijā, vienā rajonā, ar līdzīgu platību. Tieši to dara ALTEKO — veido mediānu no simtiem augšupielādētu rēķinu un parāda jūsu novirzi.

## Tipiskās izmaksas pēc energoefektivitātes klases

| Klase | Ēkas tips | Apkure, €/m²/mēn. |
|-------|-----------|-------------------|
| A–B | Pēc renovācijas | 0,60–0,90 |
| C | Daļēji siltināta | 0,90–1,20 |
| D | Padomju, tipveida | 1,20–1,80 |
| E–G | Nolietota, bez siltināšanas | 1,80–2,50+ |

## Kāpēc vienādas mājas maksā atšķirīgi

Divas 119. sērijas mājas, kas celtas vienā gadā, var atšķirties izmaksās 1,5 reizes. Iemesli:

- **Apkures sistēma.** IAS (individuālā apkures sistēma) ietaupa 15–25% salīdzinājumā ar centralizētu regulēšanu.
- **Fasādes stāvoklis.** Plaisas, siltumizolācijas trūkums uz sānu sienām, spraugu klātbūtne pie balkoniem — papildu siltuma zudumi.
- **Apsaimniekotājs.** Viens laicīgi regulē siltuma piegādi atkusnim, otrs — ne. Starpība līdz 20%.
- **Salīdzinājuma horizonts.** Apsaimniekotāji salīdzina jūsu māju ar «plānu» — kuru paši arī sastādījuši. Reāla tirgus etalona tiem nav.

<InlineCta label="Pārbaudīt savu māju →" note="Augšupielādējiet rēķinu — salīdzināsim ar normu pēc sērijas un rajona." />

## Pazīmes, ka jūs pārmaksājat

Pārbaudiet savā rēķinā:

- Apkures maksa pārsniedz €1,50/m² mēnesī janvārī — tas jau ir virs D klases mediānas.
- Starpība starp mājas kopējo ūdens skaitītāju un dzīvokļu skaitītāju summu pārsniedz 15% — iespējama noplūde.
- Rinda «administrēšana» pārsniedz €0,25/m²/mēn. — tas ir ievērojami virs tirgus mediānas.
- Rinda «uzkopšana» pārsniedz €0,35/m²/mēn. — ir vērts pieprasīt detalizāciju no apsaimniekotāja.

## Ko darīt, ja māja pārmaksā

Trīs reaģēšanas līmeņi — atkarībā no problēmas mēroga:

1. **Ātri:** pieprasīt detalizāciju no apsaimniekotāja. Par katru rindu jums ir tiesības saņemt atšifrējumu.
2. **Vidēji:** pieprasīt IAS uzstādīšanu vai apkures sistēmas balansēšanu.
3. **Pilnīgi:** uzsākt renovāciju ar Altum subsīdiju. Novērš problēmu uz 30+ gadiem. Valsts sedz līdz 49% izmaksu.

## Avoti

- [sprk.gov.lv — komunālo pakalpojumu tarifi un normatīvi](https://www.sprk.gov.lv)
- [altum.lv — energoefektivitātes programma](https://www.altum.lv)
- [data.gov.lv — BVKB energosertifikāti](https://data.gov.lv)
`

const SERIYA_RU = `
Если ваш дом построен в Риге между 1970 и 1985 годом и в нём 9 этажей — скорее всего, это серия 119. Самый массовый советский проект в Латвии, и один из самых энергозатратных.

<Callout type="info" title="Серия 119 — коротко">
- Этажность: 5 и 9 этажей
- Годы постройки: 1965–1985
- Материал стен: крупнопанельный бетон
- Типичный энергокласс: D–E
- Районы в Риге: Пурвциемс, Иманта, Плявниеки, Зиепниеккалнс
- Количество квартир: 60–120
</Callout>

## Почему серия 119 тратит так много тепла

Дома строились по советским нормам тепловой защиты — они были рассчитаны на дешёвое централизованное теплоснабжение, а не на эффективность. Основные причины теплопотерь:

- **Стыки панелей.** Горизонтальные и вертикальные швы между панелями со временем теряют герметичность. Через них уходит до 15% тепла.
- **Торцевые стены.** Они тоньше фасадных и хуже утеплены. Квартиры на торцах платят за отопление на 20–30% больше среднего по дому.
- **Крыша.** Чердачное перекрытие в серии 119 не имеет эффективного утепления — тепло уходит через потолок последнего этажа.
- **Окна.** Исторически — деревянные одинарные рамы. Даже если жильцы заменили окна в квартире, подъезды и лестничные клетки остаются с оригинальными.
- **Система отопления.** Центральное регулирование без ИТП: при потеплении до +10°C подача тепла не снижается оперативно — дом «перетапливает».

## Сколько тратит типичный дом серии 119

| Статья | €/м²/мес. (отопительный сезон) |
|--------|--------------------------------|
| Отопление (до реновации) | 1,40–2,20 |
| Отопление (после реновации) | 0,65–0,95 |
| Горячая вода | 0,28–0,38 |
| Холодная вода + канализация | 0,14–0,18 |
| Ремонтный фонд | 0,20–0,45 |

<InlineCta label="Узнайте точные цифры для вашего дома" note="Загрузите счёт — сравним с нормой для вашей серии и квартала." />

## Что даёт реновация серии 119

Реновация дома серии 119 — это комплекс работ: утепление фасада и кровли, замена окон в подъездах, установка ИТП, обновление инженерных систем.

<StatsTable rows={[
  { label: "Экономия на отоплении", value: "−50–60%", color: "text-success" },
  { label: "Средняя экономия в месяц", value: "€100–150/квартира", color: "text-success" },
  { label: "Рост стоимости квартиры", value: "+10–11%", color: "text-success" },
  { label: "Субсидия Altum", value: "до 49%", color: "text-primary" }
]} />

## Как начать

Первый шаг — понять текущую ситуацию: насколько ваши расходы отличаются от нормы для таких же домов. Это даёт аргументы для разговора с соседями и управляющей компанией.

## Источники

- [altum.lv — результаты реновированных домов](https://www.altum.lv)
- [Latvijas Banka DP 3/2025 — влияние реновации на стоимость жилья](https://www.bank.lv/publikacijas-un-prese/publikacijas/diskusijas-materiali/raksts/7083)
- [data.gov.lv — база энергосертификатов BVKB](https://data.gov.lv/dati/lv/dataset/eku-energosertifikati)
`

const SERIYA_LV = `
Ja jūsu māja Rīgā uzbūvēta no 1970. līdz 1985. gadam un tajā ir 9 stāvi — visticamāk, tā ir 119. sērija. Visizplatītākais padomju projekts Latvijā un viens no lielākajiem enerģijas patērētājiem.

<Callout type="info" title="119. sērija — īsumā">
- Stāvu skaits: 5 un 9 stāvi
- Celtniecības gadi: 1965–1985
- Sienu materiāls: lielbloku betons
- Tipiskā energoklase: D–E
- Rajoni Rīgā: Purvciems, Imanta, Pļavnieki, Ziepniekkalns
- Dzīvokļu skaits: 60–120
</Callout>

## Kāpēc 119. sērija tērē tik daudz siltuma

Mājas celtas pēc padomju laika siltumaizsardzības normām — tās bija paredzētas lētai centralizētai siltumapgādei, nevis efektivitātei. Galvenie siltuma zudumu iemesli:

- **Paneļu šuves.** Horizontālās un vertikālās šuves starp paneļiem laika gaitā zaudē hermētiskumu. Caur tām aizplūst līdz 15% siltuma.
- **Gala sienas.** Tās ir plānākas par fasādes sienām un sliktāk siltinātas. Gala dzīvokļi par apkuri maksā par 20–30% vairāk nekā mājas vidējais rādītājs.
- **Jumts.** Bēniņu pārsegums 119. sērijā nav efektīvi siltināts — siltums aizplūst caur augšējā stāva griestiem.
- **Logi.** Vēsturiski — koka vienrāmja logi. Pat ja iedzīvotāji dzīvoklī nomainījuši logus, kāpņu telpas paliek ar oriģinālajiem.
- **Apkures sistēma.** Centralizēta regulēšana bez IAS: atkusnim iestājoties līdz +10°C, siltuma piegāde neatbilstoši nesamazinās — māja «pārkūst».

## Cik tērē tipiska 119. sērijas māja

| Rinda | €/m²/mēn. (apkures sezona) |
|-------|---------------------------|
| Apkure (pirms renovācijas) | 1,40–2,20 |
| Apkure (pēc renovācijas) | 0,65–0,95 |
| Karstais ūdens | 0,28–0,38 |
| Aukstais ūdens + kanalizācija | 0,14–0,18 |
| Remonta uzkrājums | 0,20–0,45 |

<InlineCta label="Uzziniet precīzus skaitļus savai mājai" note="Augšupielādējiet rēķinu — salīdzināsim ar normu jūsu sērijas un rajona mājām." />

## Ko dod 119. sērijas renovācija

119. sērijas mājas renovācija ir komplekss darbu kopums: fasādes un jumta siltināšana, logu nomaiņa kāpņu telpās, IAS uzstādīšana, inženiersistēmu atjaunošana.

<StatsTable rows={[
  { label: "Ietaupījumi apkurē", value: "−50–60%", color: "text-success" },
  { label: "Vidējie ietaupījumi mēnesī", value: "€100–150/dzīvoklim", color: "text-success" },
  { label: "Dzīvokļa vērtības pieaugums", value: "+10–11%", color: "text-success" },
  { label: "Altum subsīdija", value: "līdz 49%", color: "text-primary" }
]} />

## Kā sākt

Pirmais solis — saprast pašreizējo situāciju: cik jūsu izdevumi atšķiras no normas līdzīgām mājām. Tas dod argumentus sarunai ar kaimiņiem un apsaimniekotāju.

## Avoti

- [altum.lv — renovēto māju rezultāti](https://www.altum.lv)
- [Latvijas Banka DP 3/2025 — renovācijas ietekme uz mājokļa vērtību](https://www.bank.lv/publikacijas-un-prese/publikacijas/diskusijas-materiali/raksts/7083)
- [data.gov.lv — BVKB energosertifikātu bāze](https://data.gov.lv/dati/lv/dataset/eku-energosertifikati)
`

// ─── Seed ────────────────────────────────────────────────────────────────────

const POSTS = [
  {
    slug: 'subsidiya-altum-renovaciya-2025',
    locale: 'ru',
    title: 'Субсидия Altum на реновацию многоквартирного дома: полное руководство 2025',
    description: 'Как получить до 49% субсидии от государства на реновацию советского дома в Латвии. Условия, документы, сроки и типичные ошибки.',
    content: ALTUM_RU,
    publishedAt: new Date('2025-04-15'),
    readMinutes: 8,
    tags: ['реновация', 'субсидии'],
  },
  {
    slug: 'subsidiya-altum-renovaciya-2025',
    locale: 'lv',
    title: 'Altum subsīdija daudzdzīvokļu mājas renovācijai: pilnīgs ceļvedis 2025',
    description: 'Kā saņemt līdz 49% subsīdiju no valsts daudzdzīvokļu mājas renovācijai Latvijā. Nosacījumi, dokumenti, termiņi un tipiskie kļūdas.',
    content: ALTUM_LV,
    publishedAt: new Date('2025-04-15'),
    readMinutes: 8,
    tags: ['renovācija', 'subsīdijas'],
  },
  {
    slug: 'norma-rashoda-tepla-latviya',
    locale: 'ru',
    title: 'Норма расхода тепла в многоквартирном доме Латвии: сколько должно быть',
    description: 'Как понять, нормально ли ваш дом тратит на отопление. Бенчмарки по серии, кварталу и площади — и что делать, если дом переплачивает.',
    content: NORMA_RU,
    publishedAt: new Date('2025-04-22'),
    readMinutes: 6,
    tags: ['отопление', 'расходы'],
  },
  {
    slug: 'norma-rashoda-tepla-latviya',
    locale: 'lv',
    title: 'Siltumenerģijas patēriņa norma daudzdzīvokļu mājā Latvijā: cik jāmaksā',
    description: 'Kā saprast, vai jūsu māja pārmaksā par apkuri. Etaloni pēc sērijas, rajona un platības — un ko darīt, ja māja pārmaksā.',
    content: NORMA_LV,
    publishedAt: new Date('2025-04-22'),
    readMinutes: 6,
    tags: ['apkure', 'izdevumi'],
  },
  {
    slug: 'seriya-119-latviya',
    locale: 'ru',
    title: 'Дома серии 119 в Латвии: почему жители переплачивают и что с этим делать',
    description: 'Серия 119 — самый распространённый советский проект в Риге. Разбираемся, почему эти дома тратят так много на отопление и как это исправить.',
    content: SERIYA_RU,
    publishedAt: new Date('2025-04-29'),
    readMinutes: 7,
    tags: ['отопление', 'реновация'],
  },
  {
    slug: 'seriya-119-latviya',
    locale: 'lv',
    title: '119. sērijas mājas Latvijā: kāpēc iedzīvotāji pārmaksā un ko darīt',
    description: '119. sērija ir visizplatītākais padomju projekts Rīgā. Noskaidrojam, kāpēc šīs mājas tērē tik daudz siltuma un kā to labot.',
    content: SERIYA_LV,
    publishedAt: new Date('2025-04-29'),
    readMinutes: 7,
    tags: ['apkure', 'renovācija'],
  },
]

async function main() {
  console.log('Seeding blog posts...')

  for (const post of POSTS) {
    await prisma.blogPost.upsert({
      where: { slug_locale: { slug: post.slug, locale: post.locale } },
      create: post,
      update: {
        title: post.title,
        description: post.description,
        content: post.content,
        readMinutes: post.readMinutes,
        tags: post.tags,
      },
    })
    console.log(`  ✓ [${post.locale}] ${post.slug}`)
  }

  console.log('Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
