# Контент-стратегия ALTEKO

Этот документ — единая точка отсчёта для всего контента платформы. Перед тем как менять копирайт на любой странице, добавлять новый блок или планировать статью в блог, сначала сверьтесь с этим документом и `docs/reference/readiness-glossary.md`.

---

## 1. Нарративный стержень

В v2 нарратив строится не вокруг «трёх эмоциональных стадий жильца» (как было в v1), а вокруг **одного главного утверждения**:

> **«Когда финансирование откроется, первыми будут не те, кто первым услышал новость. Первыми будут те, у кого уже готовы данные, решения собственников и документы.»**

Любой контент должен отвечать на один из вопросов пользователя в этой логике:

| Вопрос | Кому | Контент-формат |
|--------|------|----------------|
| «Что происходит с финансированием?» | Все | Статьи о SCF, ALTUM remonta aizdevums, ETS2 |
| «Готов ли мой дом?» | Жилец, правление | Поиск адреса → карточка → readiness score |
| «Что делать сейчас?» | Правление | `nextBestAction` + статьи «как запустить подготовку» |
| «Кто за это платит?» | Правление, специалист | Финансовые сценарии, планы платежей |
| «Как защититься от плохих подрядчиков?» | Правление | Tender Room, Supplier Risk Check |
| «Почему счёт такой?» | Жилец | Izdevumu izpratne (бывший аудит) |

**Главное правило:** контент о реновации не идёт впереди контента о готовности. Сначала — карточка дома и readiness score, потом — финансовые сценарии и подготовка.

---

## 2. Целевые аудитории

| ID | Аудитория | Боль | Точка входа | Режим продукта |
|----|-----------|------|-------------|----------------|
| A1 | Жилец (владелец квартиры) | «Почему такой счёт?» | Главная, блог, поиск Google | Iedzīvotāja |
| A2 | Председатель biedrība / mājas vecākais | «Не упустить следующее окно финансирования» | Главная (блок «Правлениям»), блог о SCF | Valdes |
| A3 | apsaimniekotājs / ESCO / projektu vadītājs | «Excel + WhatsApp — это ад» | Главная (блок «Специалистам»), B2B-блог | Speciālista |
| A4 | Сосед по шарлинку | «Сосед прислал ссылку» | /b/[token] | Publiskais → Iedzīvotāja |
| C  | Подрядчик | «Где найти подготовленные тендеры» | /contractors | Tender Room |

Убрана из v1 «стадия Действие» как отдельная сущность — действие распределено по всем режимам.

---

## 3. Карта страниц

| Страница | Аудитория | Задача | Статус (v2) |
|----------|-----------|--------|-------------|
| `/` | A1 + A2 + A3 | «Готов ли дом?» — три блока, по режимам | **Требует переписывания — §4** |
| `/building/[code]` | A1, A4 | Карточка дома + readiness score | Требует доработки — добавить readiness |
| `/audit/upload` | A1 | Загрузить PDF | ОК (копирайт обновить) |
| `/audit/preview` | A1 | Удержать пока идёт анализ | ОК (копирайт обновить) |
| `/audit/report/[id]` | A1 | Trust artifact: вопросы управляющему + ссылка на готовность | **Требует переписывания — §5** |
| `/b/[token]` | A4 | Карточка дома с readiness score | Обновить копирайт |
| `/financing` *(новая)* | A1, A2 | 5 финансовых сценариев | **Новая — §6** |
| `/readiness/order` *(новая)* | A2 | Заказ Gatavības atskaite | **Новая** |
| `/dashboard` | A2 | Valdes darba telpa: дом, документы, кампании | Большая доработка |
| `/dashboard/campaigns` | A2 | Decision Campaigns | Новая в Phase 2 |
| `/dashboard/portfolio` | A3 | Speciālista portfelis | Новая в Phase 2 |
| `/voting/[campaignId]` | A1, A4 | Голосование собственника | Сохранено, копирайт обновить |
| `/contractors` | C | Tender Room для подрядчиков | Сохранено, переименовать |
| `/contractors/register` | C | Регистрация | Сохранено |
| `/blog` | A1, A2, A3 | SEO-контент | **Большое расширение — §7** |
| `/privacy`, `/terms` | Все | GDPR | Обновить под новую политику |
| `/auth/signin` | Все | Magic link | Сохранено |

---

## 4. Главная страница: правки

### Старый герой (v1) — отменён

Текущий H1: «Снизьте счёт за отопление на 60%. Государство платит до 49%.»

**Удаляем.** Это категоричное обещание субсидии и экономии — нарушает Принцип 8 (честность).

### Новый герой (v2)

```
H1 (LV): Sagatavojiet māju nākamajam finansējuma logam
H1 (RU): Подготовьте дом к следующему окну финансирования

H2 (LV): Pārbaudiet mājas gatavību, sagatavojiet dokumentus un
         īpašnieku lēmumus pirms programmas atvēršanās 2027. gadā
H2 (RU): Проверьте готовность дома, подготовьте документы и решения
         собственников до открытия программы в 2027 году

CTA primary: [Atrast māju] / [Найти дом] → поиск адреса
CTA secondary: [Skatīt finansējuma scenārijus] / [Финансовые сценарии]
```

### Три блока ниже героя

**Блок 1 — для жильцов:**
> «Vai jūsu rēķins ir adekvāts? — Augšupielādējiet mēneša rēķinu, salīdziniet ar līdzīgām mājām»

**Блок 2 — для правлений:**
> «Vai māja ir gatava? — Saņemiet Gatavības atskaiti par EUR 600. Mēs parādīsim, kas iztrūkst»

**Блок 3 — для специалистов:**
> «Vai pārvaldāt vairākas mājas? — Mūsu Speciālista portfelis aizstāj jūsu Excel»

---

## 5. /audit/report/[id]: переписывание под Trust Artifact

См. `module-audit.md` → раздел «Полный отчёт». Главные изменения копирайта:

- Заголовок раздела результатов: **«Pārskats»** / «Отчёт» (вместо «Аудит»)
- Подзаголовок: **«Datu ticamība: vidēja»** (всегда показывать confidence)
- Новый раздел «**Jautājumi apsaimniekotājam**» / «Вопросы управляющему» — главное полезное действие
- Новый раздел «**Mājas gatavība**» / «Готовность дома» — связь с центральным модулем
- CTA в конце: **«Saņemt pilnu Gatavības atskaiti EUR 600»** (вместо «Начать реновацию»)

---

## 6. /financing — новая страница (Финансовые сценарии)

**Цель:** показать дому 5 реалистичных вариантов финансирования.

**Структура:**
1. Заголовок: «Finansējuma scenāriji jūsu mājai» / «Финансовые сценарии для вашего дома»
2. Дисклеймер: «Provizoriski. Datu ticamība: средняя»
3. 5 карточек сценариев: SCF, ALTUM remonta aizdevums, банк, свой фонд, смешанный
4. У каждой карточки: статус окна, объём, ставка, ежемесячный платёж на квартиру
5. CTA: «Saņemt pilnu Gatavības atskaiti» — для precision расчёта

См. `module-renovation.md` → UI-схема экрана.

---

## 7. SEO-кластеры по аудиториям

### A1 — жилец (Izdevumu izpratne)

**LV запросы:**
- pārbaudīt komunālo rēķinu
- mājas izmaksu salīdzinājums
- 119 sērija apkure
- kāpēc augsts rēķins par apkuri

**RU запросы:**
- проверить счёт коммуналка Латвия
- почему высокий счёт за отопление
- сравнение тарифов многоквартирный дом Рига
- управляющий завышает счета Латвия

### A2 — правление (Mājas gatavība)

**LV запросы:**
- mājas sagatavošana renovācijai
- daudzdzīvokļu mājas energoefektivitāte
- ALTUM remonta aizdevums daudzdzīvokļu māju
- sociālā klimata fonds 2026 mājas
- īpašnieku balsojums BIS Mājas lietā
- biedrība pārvaldīt māju

**RU запросы:**
- как подготовить дом к реновации Латвия
- ALTUM ремонтный кредит Латвия
- Социальный климатический фонд жильё 2026
- голосование собственников онлайн Латвия
- biedrība создать многоквартирный дом

### A3 — специалист (Speciālista režīms)

**LV запросы:**
- daudzdzīvokļu māju pārvaldīšana programma
- ESCO Latvija renovācija
- projektu vadītājs daudzdzīvokļu māju
- apsaimniekotāja darba rīks

**RU запросы:**
- инструмент для управляющего жилым фондом
- проектный менеджер реновация Латвия
- ESCO Латвия программа

### C — подрядчик

**LV запросы:**
- daudzdzīvokļu māju renovācijas konkursi
- iepirkumi māju siltināšanai
- ALTUM piegādātāju atlase

**RU запросы:**
- тендеры реновация многоквартирные дома Латвия
- закупки утепление фасадов

---

## 8. Структура внутренних ссылок

```
/ (Главная)
  ↓ [адресный поиск]
/building/[code] → readiness score, краткие сценарии
  ↓ [Augšupielādēt rēķinu]
/audit/upload → /audit/preview → /audit/report/[id] → email gate → trust artifact
  ↓ [Mājas gatavība →]
/financing → 5 сценариев
  ↓ [Saņemt Gatavības atskaiti →]
/readiness/order → форма заказа + оплата
  ↓ [Pieslēgties Valdes darba telpai →]
/dashboard → Decision Campaigns + документы
  ↓
/voting/[id] → /dashboard/campaigns

Реферальный путь:
/b/[token] → /building/[code] → /audit/upload

Speciālista путь (Phase 2):
/dashboard/portfolio → portfolio view → дом → tender room

Подрядчики (Tender Room):
/contractors → /contractors/register → /contractors/[id]/profile
/contractors/tenders/[id] → подача предложения
```

---

## 9. Тональность и стиль

| Аудитория | Тон | Пример |
|-----------|-----|--------|
| A1 (жилец) | Прямой, эмпатичный, без обвинений | «Расходы выше медианы — обсудите на собрании» |
| A2 (правление) | Профессиональный, инструментальный, деловой | «Подготовьте дом до открытия SCF — окно Q2 2027» |
| A3 (специалист) | Сухой, технический, плотный | «Pipeline 47 māju · 12 ar steidzamiem termiņiem» |
| A4 (сосед) | Информативный, без давления | «Сосед проверил готовность вашего дома» |
| C (подрядчик) | Деловой, прозрачный | «Прозрачные тендеры от подготовленных домов» |

---

## 10. Блог: план контента (обновлённый)

### Цель
20+ статей за 12 месяцев после запуска. Главные темы — SCF и подготовка.

### Темы по аудиториям

**A2 — для правлений (главный приоритет):**

| Тема | Slug | Язык | Приоритет |
|------|------|------|-----------|
| Sociālā klimata fonds 2026-2032: kas tas ir un ko tas nozīmē jūsu mājai | `socialais-klimata-fonds-2026` | LV + RU | 1 |
| ALTUM 2021-2027 closed: ko darīt tagad | `altum-2021-2027-closed-next-steps` | LV + RU | 1 |
| ALTUM remonta aizdevums: salīdzinājums ar grantu | `altum-remonta-aizdevums-vs-grants` | LV + RU | 1 |
| 7 īpašnieku lēmumu, kas vajadzīgi finansējumam | `7-ipasnieku-lemumi` | LV + RU | 1 |
| Kā sagatavot māju 2027. gada finansējuma logam | `gatavoshana-2027` | LV + RU | 2 |
| BIS Mājas lieta: kā tā atvieglo balsošanu | `bis-majas-lieta-balsosana` | LV + RU | 2 |
| Tehniskā apsekošana — kas tas ir, kad jāveic | `tehniska-apsekosana` | LV + RU | 2 |

**A1 — для жильцов:**

| Тема | Slug | Язык | Приоритет |
|------|------|------|-----------|
| Kā lasīt apsaimniekotāja rēķinu | `ka-lasit-rekinu` | LV + RU | 1 |
| Kāpēc 119. sērijas mājas pārmaksā par apkuri | `119-serija-apkure` | LV + RU | 2 |
| Karstā ūdens skaitītāju starpība: kad ir aizdomas | `udens-skaitiitaju-starpiba` | LV + RU | 2 |

**A3 — для специалистов:**

| Тема | Slug | Язык | Приоритет |
|------|------|------|-----------|
| ALTUM piegādātāju atlases prasības — pilns saraksts | `altum-piegadataju-atlase` | LV + RU | 1 |
| Kā pārvaldīt 30+ māju vienlaicīgi | `30-maju-parvaldisana` | LV + RU | 2 |
| Konflikta interešu pārbaude: praktisks ceļvedis | `konflikta-interesu-parbaude` | LV + RU | 2 |

**Темы из v1, которые остаются:**

| Тема | Статус |
|------|--------|
| Серия 119 / 103 / 104 | Сохранить, пересмотреть копирайт под trust artifact |
| Норма расхода тепла | Сохранить как справочник |
| 12 шагов программы Altum | **Удалить** — заменить на «Шаги подготовки к SCF» |
| Электронное голосование Smart-ID | **Переписать** под Decision Campaigns + BIS Mājas lieta |

---

## 11. Правила локализации

- LV — первичный язык для SEO (Google.lv); RU — равный по качеству, написан в естественном регистре
- Не дословный перевод
- **Ни один английский термин в публикуемом контенте**
- Термины из `readiness-glossary.md` — обязательны для UI; в блоге допустимы расширенные русские синонимы при первом упоминании
- Все цифры идентичны в обеих версиях — проверять по `docs/reference/key-facts.md`
- Не обещать субсидию или окупаемость в категоричной форме

---

## 12. Метрики

| Метрика | Ориентир | Где измерять |
|---------|----------|--------------|
| Email capture rate (audit report) | ≥40% | Аналитика событий |
| Audit → /financing | ≥25% завершивших audit report | Аналитика воронки |
| /financing → /readiness/order (оплата) | ≥3% | Stripe / payment provider |
| /building/[code] → /audit/upload | ≥30% | Аналитика воронки |
| Главная → A1 / A2 / A3 paths | Распределение | Аналитика событий |
| Органический трафик блога | Рост M-o-M с 3 месяца | Google Search Console |

---

## Связанные документы

- `docs/product/overview.md` — 4 режима продукта
- `docs/product/module-readiness.md` — Building Readiness Score
- `docs/product/module-audit.md` — Izdevumu izpratne (trust artifact)
- `docs/product/module-renovation.md` — Финансовые сценарии
- `docs/product/module-tender-room.md` — Piegādātāju atlases telpa
- `docs/reference/readiness-glossary.md` — UI-термины LV/RU/EN
- `docs/reference/key-facts.md` — все цифры с источниками
- `src/messages/lv.json`, `src/messages/ru.json` — актуальный копирайт платформы (после переписывания)
