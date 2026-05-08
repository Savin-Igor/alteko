# ALTEKO — Документация

**Mājas gatavības platforma** / **Платформа готовности дома**: помогаем многоквартирному дому в Латвии стать готовым к финансированию и ремонту.

> **Внимание:** концепция переписана в мае 2026 г. после внешней экспертизы. См. [migration-from-v1.md](migration-from-v1.md) и `v2.md` в корне репо.

---

## С чего начинать чтение

1. **[reference/readiness-glossary.md](reference/readiness-glossary.md)** — единственный источник правды для UI-терминов (LV / RU / EN). **Обязательно** перед любым изменением.
2. **[business/concept.md](business/concept.md)** — главная идея: готовность, не маркетплейс.
3. **[product/overview.md](product/overview.md)** — 4 режима продукта и user journeys.
4. **[product/module-readiness.md](product/module-readiness.md)** — центральный модуль: Building Readiness Score.

---

## Структура

### Бизнес
Проблема, рынок, бизнес-модель.

- [concept.md](business/concept.md) — идея, логика готовности, почему именно сейчас, что заменяет старую модель
- [market.md](business/market.md) — целевой рынок, сегменты (4 режима), конкуренты (включая BIS как смежный сегмент)
- [monetization.md](business/monetization.md) — 4 платных продукта; **никакого success fee** от подрядчиков
- [roadmap.md](business/roadmap.md) — 90-дневный план + длинная дорога до Q2 2027
- [validation-interviews.md](business/validation-interviews.md) — скрипт интервью с biedrija, трекинг 5 валидационных встреч

### Продукт
Как платформа работает для пользователей.

- [overview.md](product/overview.md) — 4 режима (publiskais / iedzīvotāja / valdes / speciālista), user journey
- [module-readiness.md](product/module-readiness.md) — **центральный**: Building Readiness Score, next best action
- [module-audit.md](product/module-audit.md) — аудит расходов как trust artifact для собрания
- [module-renovation.md](product/module-renovation.md) — Финансовые сценарии (5 вариантов), не только ALTUM
- [module-tender-room.md](product/module-tender-room.md) — Piegādātāju atlases telpa (бывший marketplace)
- [mvp.md](product/mvp.md) — скоуп MVP с акцентом на готовность
- [design.md](product/design.md) — UX-принципы, экраны, состояния
- [design-system.md](product/design-system.md) — токены, компоненты, CSS
- [content-strategy.md](product/content-strategy.md) — нарратив, страницы, блог

### Диаграммы
- [diagrams.md](./diagrams.md) — Mermaid: архитектура, потоки данных, user flow

### Техническая часть
- [architecture.md](technical/architecture.md) — слои, API routes, диаграмма
- [data-model.md](technical/data-model.md) — Prisma schema (актуальная, v2)
- [integrations.md](technical/integrations.md) — внешние API и системы
- [tech-stack.md](technical/tech-stack.md) — стек
- [address-search.md](technical/address-search.md) — Jāņa sēta + LVM WFS
- [local-development.md](technical/local-development.md) — локальная разработка
- [adr/](technical/adr/) — Architecture Decision Records (зафиксированные технические решения)
  - [0001-s3-provider.md](technical/adr/0001-s3-provider.md) — Hetzner Object Storage для production файлов

### Справочник
- **[readiness-glossary.md](reference/readiness-glossary.md)** — **обязательный**: LV/RU/EN термины новой концепции
- [glossary.md](reference/glossary.md) — общие латвийские термины и аббревиатуры
- [key-facts.md](reference/key-facts.md) — все цифры с пометками [ВЕРИФИЦИРОВАНО] / [НЕ ВЕРИФИЦИРОВАНО]
- [data-sources.md](reference/data-sources.md) — внешние источники, тип доступа, приоритет
- [building-series.md](reference/building-series.md) — серии 103/104/119/467/602

---

## Исходные материалы

- `knowledge/1.md`–`4.md` — оригинальные черновые заметки. **Не отражают целевую модель**, сохранены как исторический контекст. Терминология устарела.
- `v2.md` — диалог с независимым экспертом, на основе которого выполнен разворот концепции (май 2026).

---

## Открытые вопросы

### Решённые

- ~~**Концепция «маркетплейс реновации с комиссией от подрядчика»**~~ — **отменено.** Конфликт интересов. Заменено на «платформа готовности» + фиксированные подписки. См. [concept.md](business/concept.md), [monetization.md](business/monetization.md).
- ~~**Зависимость от текущей программы ALTUM**~~ — **отменено.** Программа 2021-2027 закрыта (€173M зарезервированы, 13.05.2025). Продукт перенацелен на готовность к SCF 2026-2032 + ALTUM remonta aizdevums.
- ~~**E-voting как UVP**~~ — **отменено.** BIS Mājas lieta уже это умеет. ALTEKO готовит решения и экспортирует в BIS.
- ~~**Юридическая сила Smart-ID голосования**~~ — Действительно. Dzīvokļa īpašuma likums, ст. 20(7-8), поправки 2022 г.
- ~~**Цифра ~23 500 зданий**~~ — Верифицировано. Нуждаются в реновации, всего фонд ~38 600 (CSB).
- ~~**Конверсия Altum**~~ — Верифицировано: 2,7%. 624 завершённых из 23 500.
- ~~**+10–11% к стоимости квартиры**~~ — Верифицировано. Latvijas Banka DP 3/2025.
- ~~**Frontend-фреймворк**~~ — Решено: Next.js 15 + TypeScript, SSR.
- ~~**Новые Prisma-модели v2**~~ — ✅ Реализованы: `BuildingReadinessScore`, `FinancingScenario`, `DecisionCampaign`, `BuildingDocument`, `ReadinessReportOrder`. Миграции применены.
- ~~**Новые enum'ы v2**~~ — ✅ `FundingWindowStatus`, `DataConfidence`, `LegalConfidence`, `BuildingProjectStatus`, `DecisionType`, `BuildingDocumentType` в схеме.
- ~~**Новые API routes**~~ — ✅ `/api/readiness/*`, `/api/financing/*`, `/api/decisions/*`, `/api/readiness-report/*` реализованы.
- ~~**Удаление 1.5% commission из `api/tenders/*`**~~ — ✅ `commissionAmount` удалён в миграции `20260504000002_v2_readiness_platform`. `offerCount` добавлен вместо него.
- ~~**i18n-копирайт под новые термины**~~ — ✅ `messages/lv.json` и `ru.json` переписаны. Misleading "Altum subsīdija" убраны.
- ~~**Готовность правления платить за Readiness Report — не валидировано**~~ — Трекинг создан: [validation-interviews.md](business/validation-interviews.md). Скрипт 5 интервью готов.
- ~~**Gatavības atskaite как первый платный продукт**~~ — ✅ Реализован: PDF (PDFKit, 8 секций, LV+RU), GPT-4o narrative, email (Mailhog локально), `mark-paid` endpoint, статусная страница.

### Нерешённые (актуальные)

1. **SCF Plan Латвии не одобрен ЕК** — на оценке Еврокомиссии (май 2026). Реальные выплаты зависят от одобрения + старта ETS2. Следить за `employment-social-affairs.ec.europa.eu`. В UI: SCF сценарий содержит disclaimer.
2. **MK noteikumi для меры МКД SCF** — выйдут в Q4 2026. До этого правила пригодности неизвестны точно. Текущий rules engine использует энергокласс F/G как прокси.
3. **F-класс порог в МКД-программе SCF** — 125 kWh/m²/год для домов >250 m². Точно зафиксировано будет в MK noteikumi.
4. **Данные о собственниках из Zemesgrāmata** — публичного API нет. Путь: ручной CSV от правления → `POST /api/voting/owners-upload`.
5. **Цены 4 платных продуктов** — диапазоны заданы (см. [monetization.md](business/monetization.md)), точные цифры — после первых пилотов.
6. **Регистрация SIA** — Privacy Policy содержит placeholder `[jāreģistrē pirms publiskās palaišanas]`. Нужно зарегистрировать SIA до публичного запуска. GitHub issue #122.

### Следующие задачи в коде (GitHub Issues)

| Приоритет | Issue | Задача |
|-----------|-------|--------|
| **P0** | [#121](https://github.com/Savin-Igor/alteko/issues/121) | Readiness Score UI на странице `/building/[cadastralCode]` |
| **P0** | [#122](https://github.com/Savin-Igor/alteko/issues/122) | Зарегистрировать SIA, заполнить Privacy Policy |
| **P1** | [#123](https://github.com/Savin-Igor/alteko/issues/123) | Вопросы управляющему + «Следующий шаг» в отчёте аудита |
| **P1** | [#124](https://github.com/Savin-Igor/alteko/issues/124) | Valdes režīms dashboard |
| **P1** | [#125](https://github.com/Savin-Igor/alteko/issues/125) | Шаблоны кампаний решений + PDF для BIS |
| **P2** | [#127](https://github.com/Savin-Igor/alteko/issues/127) | 7 статей блога (4–10) в Payload CMS |
| **P3** | [#129](https://github.com/Savin-Igor/alteko/issues/129) | Speciālista portfelis — Phase 2 (не начинать до первых клиентов) |

---

*Последнее обновление: май 2026. Статус реализации актуален на дату коммита.*
