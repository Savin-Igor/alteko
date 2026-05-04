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
- [data-model.md](technical/data-model.md) — Prisma schema (с новыми моделями readiness)
- [integrations.md](technical/integrations.md) — внешние API и системы
- [tech-stack.md](technical/tech-stack.md) — стек
- [address-search.md](technical/address-search.md) — Jāņa sēta + LVM WFS
- [local-development.md](technical/local-development.md) — локальная разработка

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

- ~~**Концепция «маркетплейс реновации с комиссией от подрядчика»**~~ — **отменено.** Создаёт конфликт интересов при выборе поставщика. Заменено на «платформа готовности» + фиксированные подписки. См. [concept.md](business/concept.md), [monetization.md](business/monetization.md).
- ~~**Зависимость от текущей программы ALTUM**~~ — **отменено.** Программа 2021-2027 закрыта (€173M зарезервированы, 13.05.2025). Продукт перенацелен на готовность к SCF 2026-2032 + ALTUM remonta aizdevums.
- ~~**E-voting как UVP**~~ — **отменено.** BIS Mājas lieta уже это умеет. ALTEKO готовит решения и экспортирует в BIS.
- ~~**Юридическая сила Smart-ID голосования**~~ — Действительно. Dzīvokļa īpašuma likums, ст. 20(7-8), поправки 2022 г.
- ~~**Цифра ~23 500 зданий**~~ — Верифицировано. Это здания, *нуждающиеся в реновации*, всего фонд ~38 600 (CSB).
- ~~**Конверсия Altum**~~ — Верифицировано: 2,7%. 624 завершённых из 23 500.
- ~~**+10–11% к стоимости квартиры**~~ — Верифицировано. Latvijas Banka DP 3/2025.
- ~~**Frontend-фреймворк**~~ — Решено: Next.js 15 + TypeScript, SSR.

### Нерешённые

1. **SCF Plan Латвии не одобрен ЕК** — на оценке Еврокомиссии (май 2026). Реальные выплаты зависят от одобрения + старта ETS2. Следить за `employment-social-affairs.ec.europa.eu`.
2. **MK noteikumi для меры МКД SCF** — выйдут в Q4 2026. До этого правила пригодности неизвестны точно. Нужен версионируемый rules engine.
3. **F-класс порог в МКД-программе SCF** — 125 kWh/m²/год для домов >250 m² плановое, но точно зафиксировано будет в MK noteikumi.
4. **Данные о собственниках из Zemesgrāmata** — публичного API нет. Для решений собственников — ручной CSV от правления или экспорт через BIS.
5. **Удаление 1.5% commission хардкода из `api/tenders/*`** — отдельная итерация после доков.
6. **Цены 4 платных продуктов** — диапазоны заданы (см. [monetization.md](business/monetization.md)), точные цифры — после первых пилотов.
7. **Готовность правления / mājas vecākais платить за Readiness Report** — не валидировано рынком. Рекомендуется 5 интервью с biedrības до запуска.

### Запланированные изменения в коде (отдельная итерация)

- Новые Prisma-модели: `BuildingReadinessScore`, `FinancingScenario`, `DecisionCampaign` (расширение `VotingCampaign`)
- Новые enum'ы: `FundingWindowStatus`, `DataConfidence`, `LegalConfidence`, `BuildingProjectStatus`, `DecisionType`
- Новые API routes: `/api/readiness/*`, `/api/financing/*`, `/api/decisions/*`
- Удаление 1.5% commission из `api/tenders/bid` и `api/tenders/select`
- i18n-копирайт: переписать messages под новые термины из `readiness-glossary.md`

См. подробности в [data-model.md](technical/data-model.md) и [architecture.md](technical/architecture.md).
