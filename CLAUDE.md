# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Проект

**ALTEKO** — **Mājas gatavības platforma** / **Платформа готовности дома**: помогаем многоквартирному дому стать **готовым к финансированию и ремонту** (данные, документы, решения собственников, сценарии финансирования, прозрачный выбор поставщиков).

**Ключевая фраза для лендинга:**
> **«Когда финансирование откроется, первыми будут не те, кто первым услышал новость. Первыми будут те, у кого уже готовы данные, решения собственников и документы.»**

**Не путать со старой концепцией:**
- ❌ ALTEKO — это **не** «маркетплейс реновации» с комиссией от подрядчика
- ❌ ALTEKO — это **не** «подадим вашу заявку в текущую программу ALTUM» (она закрыта для новых заявок)
- ❌ ALTEKO — это **не** замена BIS Mājas lieta (BIS уже даёт e-voting; ALTEKO — подготовительный слой)

**Что ALTEKO делает:**
1. Считает **Mājas gatavības novērtējums** (Building Readiness Score) для дома
2. Показывает **Nākamais solis** (next best action) — что конкретно сделать
3. Предлагает **5 финансовых сценариев** (SCF 2026-2032, ALTUM remonta aizdevums, банк, свой ремонтный фонд, смешанный)
4. Готовит **Lēmumu kampaņas** (Decision Campaigns) собственников и экспортирует в BIS
5. Даёт **Piegādātāju atlases telpa** (Tender Room) — прозрачный процесс выбора поставщика без success fee

**Целевые пользователи (4 режима):**
- **Publiskais režīms** — любой посетитель: карточка дома, публичные данные, CTA «получить отчёт о готовности»
- **Iedzīvotāja režīms** — владелец квартиры: загрузка счёта, сравнение, анализ как trust artifact
- **Valdes režīms** — biedrība / mājas vecākais: история, кампании решений, экспорт в BIS
- **Speciālista režīms** — apsaimniekotājs / ESCO / projektu vadītājs: портфель домов, pipeline, приоритеты

**Стадия:** код частично написан (см. `src/`), документация переписана под Mājas gatavības platforma после внешней экспертизы (см. `v2.md` и `docs/migration-from-v1.md`).

---

## Рабочий протокол

### Перед началом любой задачи

1. Прочитай `docs/README.md` — индекс + открытые вопросы
2. Прочитай `docs/reference/readiness-glossary.md` — **обязательно**, там LV/RU/EN термины
3. Прочитай релевантные файлы документации (не угадывай по памяти)
4. Пойми:
   - продукт = подготовка дома, не маркетплейс
   - пользователя — четыре режима с разной мотивацией
   - что текущее окно ALTUM закрыто, следующее — SCF 2026-2032

### При выполнении задачи

- Не придумывать архитектуру или логику — опираться только на документацию и реальные источники
- Стек не пересматривать (зафиксирован, см. ниже)
- Факты — только верифицированные или явно помеченные
- Любой UI-термин **сначала** проверяется в `readiness-glossary.md`

### При неопределённости

1. Проверить через интернет: likumi.lv, csp.gov.lv, altum.lv, latvijas banka, fi-compass.eu, vzd.gov.lv, tapportals.mk.gov.lv, employment-social-affairs.ec.europa.eu, bis.gov.lv, bvkb.gov.lv
2. Если не нашёл — явно написать: **«не уверен»**, **«предположение»**, **«требует проверки»**
3. Не заполнять пробелы правдоподобными догадками

### Всегда

- Различать: **факт** / **вывод** / **предположение** — указывать явно
- Не скрывать сомнения
- При противоречиях в документации — указать оба места, предложить варианты решения

---

## Фокус

| Приоритет | Что важно |
|-----------|-----------|
| UX | 4 режима продукта; LV — основной, RU — второй; простой язык, нет английского в UI |
| Бизнес | Платный Readiness Report; подписки правлений и специалистов; **никакого success fee от подрядчиков** |
| Юр-риски | Конфликт интересов исключён; данные — только с consent; экспорт в BIS, не подмена BIS |
| Данные | Только верифицированные факты с источниками; статусы достоверности на UI |

---

## Стек (не обсуждается)

| Слой | Решение |
|------|---------|
| Язык | TypeScript |
| Framework | Next.js 15 (App Router, SSR) |
| Backend | Next.js API Routes — монолит, без отдельного сервера |
| ORM | Prisma |
| БД | PostgreSQL |
| AI | GPT-4o via OpenAI SDK (из API Routes) |
| CMS | Payload CMS 3.x (блог, медиа) |
| Файлы | S3-совместимое хранилище |
| Auth | NextAuth.js (magic link); Smart-ID/eParaksts — только для подписи решений |
| i18n | next-intl: lv (default, без префикса), ru (`/ru/...`) |
| Инфра | Docker + GitHub Actions |

---

## Структура документации

```
docs/
├── README.md                       ← читать первым: индекс + открытые вопросы
├── diagrams.md                     ← Mermaid-диаграммы
├── migration-from-v1.md            ← что и почему изменилось в концепции
├── business/
│   ├── concept.md                  ← бизнес-идея (готовность, не маркетплейс)
│   ├── market.md                   ← рынок, SCF, конкуренция с BIS
│   ├── monetization.md             ← 4 продукта, без success fee
│   └── roadmap.md                  ← 90-дневный план + до Q2 2027
├── product/
│   ├── overview.md                 ← 4 режима, user journeys
│   ├── module-readiness.md         ← Building Readiness Score (центральный)
│   ├── module-audit.md             ← аудит как trust artifact
│   ├── module-renovation.md        ← Финансовые сценарии
│   ├── module-tender-room.md       ← бывший marketplace
│   ├── mvp.md
│   ├── design.md
│   ├── design-system.md
│   └── content-strategy.md
├── technical/
│   ├── architecture.md
│   ├── data-model.md               ← Prisma schema (с новыми моделями)
│   ├── integrations.md
│   ├── tech-stack.md
│   ├── address-search.md
│   └── local-development.md
└── reference/
    ├── readiness-glossary.md       ← ОБЯЗАТЕЛЕН для UI-терминов (LV/RU/EN)
    ├── glossary.md                 ← общие термины
    ├── key-facts.md                ← все цифры с источниками
    ├── data-sources.md             ← внешние источники
    └── building-series.md
```

Полная Prisma schema — в `docs/technical/data-model.md`.

---

## Язык

- **Документация** → русский
- **Код, комментарии, коммиты** → английский
- **UI-копирайт** → **LV (default) + RU (вторичный)**, через `readiness-glossary.md`
- **Не переводить (фиксированные):** Altum, ALTUM remonta aizdevums, Kadastrs, Zemesgrāmata, Smart-ID, eParaksts, biedrība, RNP, Lursoft, Jāņa sēta, VZD, BVKB, LVM, CSP, BIS, Mājas lieta, KEM, EM, ETS2, EIKIS, SCF, Sociālā klimata fonds, MK noteikumi, mans.altum.lv, KPVIS, ESCO, mājas vecākais, dzīvokļu īpašnieku biedrība, dzīvokļu īpašnieku kopība, apsaimniekotājs, pilnvarotā persona, projektu vadītājs

---

## Зафиксированные технические решения

| Тема | Решение |
|------|---------|
| Адресный поиск | Jāņa sēta API → LVM GeoServer WFS → PostgreSQL. Подробно: `docs/technical/address-search.md` |
| Zemesgrāmata | API нет. Для голосования — ручной CSV от правления. Не предлагать API-интеграцию |
| Парсинг PDF | Один вызов GPT-4o (vision). Без Tesseract, без Python-сервиса |
| Серия здания | Не в открытых данных. Эвристика: год + материал + этажи + средняя площадь BuildingUnit. Поле nullable |
| Данные зданий | VZD Building.ZIP (еженедельно) + BVKB энергосертификаты (ежедневно) из data.gov.lv |
| E-voting | ALTEKO готовит решения и экспортирует в BIS Mājas lieta. Не дублировать BIS-функции напрямую |
| Smart-ID/eParaksts | Используются для подписи **решений собственников**, не для входа на платформу (вход — magic link) |
| Маркетплейс | **Piegādātāju atlases telpa** без success fee. Подрядчики платят фиксированную подписку |
| Deploy trigger | `git tag v*` → GitHub Actions → GHCR → SSH в Hetzner. Push в main = только CI. Подробно: `docs/DEPLOY.md` |
| Port allocation на VPS | ALTEKO = `127.0.0.1:3020`. MezaData = 3010. Локально = 3000 |
| Server data path | `/mnt/data/alteko/{postgres,uploads,backups}` (Hetzner Volume). Локально = `./data/postgres` |

---

## Верифицированные факты (главные, май 2026)

| Факт | Источник |
|------|---------|
| ALTUM 2021-2027 закрыта для новых заявок (€173M зарезервированы; 338 заявок) | altum.lv (программа МКД) |
| Latvijas SCF plāns 2026-2032 принят MK rīkojums Nr.393 (2.07.2025) | likumi.lv/ta/id/361681 |
| МКД-блок SCF: €127M публичных + €31.75M нац. = €186M общих | likumi.lv/ta/id/361681 |
| MK правила Q4 2026, заявки до Q2 2027, реализация до 31.07.2032 | likumi.lv/ta/id/361681 |
| ALTUM remonta aizdevums: €10k+, 3.9%, 20 лет, до 30.06.2031 | altum.lv |
| BIS Mājas lieta: e-voting и протоколы уже есть | bis.gov.lv |
| ALTUM требует ≥5 опрошенных и ≥2 независимых поставщика | altum.lv (pakalpojumu-sniedzeju-atlase) |
| ~23 500 домов нуждаются в реновации; весь фонд ~38 600 | ALTUM / CSB, Upitis et al. 2020 |
| Конверсия ALTUM: 2,7% (624 дома) | fi-compass, ALTUM, дек. 2024 |
| Субсидия ALTUM: до 49–50% стоимости | altum.lv, fi-compass 2024 |
| Smart-ID e-voting законно с 2022 г. | Dzīvokļa īpašuma likums, ст. 20(7-8) |
| Ценовая премия после реновации: ~10–11% | Latvijas Banka, DP 3/2025 |
| 51% домов — советские панельные | Минэкономики Латвии, 2023 |

**ВНИМАНИЕ:** SCF Plan Латвии **на оценке Еврокомиссии** (май 2026). Реальные выплаты зависят от одобрения и фактического запуска ETS2.

Все числа → `docs/reference/key-facts.md` с пометкой [ВЕРИФИЦИРОВАНО] или [НЕ ВЕРИФИЦИРОВАНО].

---

## Запрещено в продукте и текстах

| Запрещено | Почему |
|-----------|--------|
| «Подадим вашу заявку в ALTUM» | Текущая программа закрыта |
| «Получите субсидию» | Гарантировать нельзя; зависит от MK правил и одобрения ЕК |
| «1.5% комиссия с подрядчика» | Конфликт интересов с выбором поставщика |
| Английские термины в UI | LV — default, RU — второй |
| Замена BIS | BIS — государственный контур; ALTEKO — подготовительный слой |
| Голосование как UVP | BIS Mājas lieta уже это делает |

---

## Формат вывода

- Решения — с обоснованием
- Сомнительные места — список явно
- Использованные источники — список с URL и годом
- Противоречия — указать оба места, предложить варианты

---

## Предпочтения пользователя

- Общение на русском
- Кратко и по делу — таблица или список вместо абзацев
- Параллельная работа где возможно
- Перед реализацией — проверять реальные источники
- **Работать в worktree** — main общая, тимейты пушат в main напрямую
- Не делать `git push` без явного запроса
