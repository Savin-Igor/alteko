# Plan: ALTEKO → Mājas gatavības platforma (rewrite)

## Goal

Перепозиционировать ALTEKO с «маркетплейс реновации с комиссией от подрядчика» на **«платформа подготовки многоквартирного дома к финансированию и ремонту»**:

- LV: **Mājas gatavības platforma**
- RU: **Платформа готовности дома**

Переписать всю проектную документацию (~25 файлов), сохранив существующий код, и обновить CLAUDE.md и AGENT.md под новый флоу. Код не трогаем в этой итерации — только документация.

## Context

### Внешние факты (верифицированы по первичным источникам, май 2026)
- ALTUM 2021-2027 закрыта для новых заявок: €173M зарезервированы, 338 заявок до 13.05.2025 (altum.lv)
- Latvijas Sociālā klimata fonda plāns 2026-2032 принят MK rīkojums Nr.393 от 2.07.2025
- МКД-блок SCF: €127M публичных + €31.75M нац. софинансирования, €186M общих, MK правила Q4 2026, заявки Q2 2027 (likumi.lv/ta/id/361681)
- ALTUM remonta aizdevums жив: €10k+, 3.9% годовых, до 30.06.2031 (altum.lv)
- BIS Mājas lieta уже даёт e-voting и протоколы собственников (bis.gov.lv)
- ALTUM требует ≥5 опрошенных поставщиков и ≥2 независимых предложения для выбора подрядчика
- SCF Plan Латвии всё ещё на оценке Еврокомиссией — реальные выплаты зависят от одобрения и старта ETS2

### Внутренний контекст (что уже есть в коде)
- ~40k зданий из VZD + энергоданные BVKB + транзакции
- Адресный поиск (Jāņa sēta + LVM WFS)
- PDF→GPT-4o vision парсинг
- Бенчмаркинг
- Smart-ID/eParaksts голосование
- Каталог подрядчиков с верификацией
- Payload CMS + блог (LV/RU)

### Откуда пришла идея разворота
Файл `v2.md` в корне репо — независимая критика эксперта (4 раунда диалога). Ключевые тезисы эксперта подтверждены 10 первичными источниками.

## Steps

### Phase 1 — Foundation (фундамент)
1. Создать `.claude/plans/readiness-platform-rewrite.md` (этот файл)
2. Создать `docs/reference/readiness-glossary.md` — таблица **LV / RU / EN** для всех новых концепций
3. Обновить корневой `CLAUDE.md` — новая концепция, верифицированные факты, что не трогать
4. Обновить `docs/README.md` — новая структура индекса + статус «решённые / нерешённые вопросы»

### Phase 2 — Business (бизнес-слой)
5. `docs/business/concept.md` — новая центральная идея (готовность, не маркетплейс)
6. `docs/business/market.md` — сегменты под новую идею, объяснение SCF и ALTUM remonta aizdevums, конкуренция с BIS
7. `docs/business/monetization.md` — 4 продукта (Readiness Report, Board Workspace, Project Preparation Package, Professional Portfolio); убрать success fee 1.5%
8. `docs/business/roadmap.md` — новая 90-дневная карта + длинный путь до Q2 2027

### Phase 3 — Product (продукт)
9. `docs/product/overview.md` — 4 режима (publiskais / iedzīvotāja / valdes / speciālista), новый user journey
10. **Новый**: `docs/product/module-readiness.md` — `BuildingReadinessScore`, `next_best_action`, статусы готовности
11. `docs/product/mvp.md` — новый MVP с акцентом на готовность, документы, кампании решений
12. `docs/product/module-audit.md` — аудит как trust artifact для собрания, не как бизнес-движок
13. `docs/product/module-renovation.md` → переписать как **Финансовые сценарии** (5 сценариев, не один ALTUM)
14. **Переименование**: `docs/product/module-marketplace.md` → `docs/product/module-tender-room.md`; убрать success fee
15. `docs/product/design.md` — UX 4 режимов, честные формулировки
16. `docs/product/design-system.md` — токены остаются, обновить разделы под новые экраны
17. `docs/product/content-strategy.md` — переписать нарратив под готовность

### Phase 4 — Technical (техническая часть)
18. `docs/technical/architecture.md` — новый слой `readiness/`, новые API routes (`/api/readiness/*`, `/api/financing/*`, `/api/decisions/*`)
19. `docs/technical/data-model.md` — новые модели: `BuildingReadinessScore`, `FinancingScenario`, `DecisionCampaign` (расширение `VotingCampaign`); enum `FundingWindowStatus`, `DataConfidence`, `LegalConfidence`
20. `docs/technical/integrations.md` — добавить SCF rules engine, EM/ALTUM rules sources
21. `docs/technical/tech-stack.md` — обновить если нужно (вряд ли)
22. `docs/technical/local-development.md` — обновить если нужно
23. `docs/technical/address-search.md` — без изменений (вынести в out-of-scope)

### Phase 5 — Reference (справочник)
24. `docs/reference/key-facts.md` — добавить 10 верифицированных SCF фактов; пометить устаревшие пункты
25. `docs/reference/glossary.md` — добавить SCF, ETS2, EIKIS, KEM, KPVIS, mans.altum.lv, BIS Mājas lieta, ESCO
26. `docs/reference/data-sources.md` — добавить tapportals.mk.gov.lv, employment-social-affairs.ec.europa.eu
27. `docs/reference/building-series.md` — без изменений

### Phase 6 — Cross-cutting (сквозные)
28. `docs/diagrams.md` — новые диаграммы под readiness flow (Mermaid)
29. `AGENT.md` — инструкции AI-агентам под новый флоу (что ALTEKO теперь не делает)
30. `docs/migration-from-v1.md` — что изменилось и почему, ссылка на v2.md как первичный материал
31. Финальный pass `docs/README.md`

### Финал
- Один коммит на каждую фазу (6 коммитов)
- В конце: суммарный обзор для пользователя — что переписано, что осталось, что делать дальше с кодом

## Risks

### R1: Расхождение между документацией и кодом
- В `api/tenders/bid` и `api/tenders/select` хардкод `1.5%` комиссии. Документация в новой версии говорит «нет success fee».
- **Mitigation:** в обновлённой `monetization.md` явно пометить «1.5% хардкод в коде → подлежит удалению в следующей итерации (после правки docs)». В код добавлять `// FIXME: deprecated, see monetization.md` — но это уже **отдельная итерация после доков**.

### R2: Перевод English-терминов эксперта на LV/RU
- Эксперт оперирует «BuildingReadinessScore», «Tender Room», «Decision Campaign» — это рабочие названия. UI должен быть LV/RU.
- **Mitigation:** `readiness-glossary.md` фиксирует **LV название (основное) / RU название / EN ключ для кода**. Все последующие doc-файлы ссылаются только на этот глоссарий.

### R3: SCF не одобрен Еврокомиссией
- Если ЕК не одобрит план Латвии или ETS2 будет отложен — продукт «готовность к SCF» становится менее ценным.
- **Mitigation:** документация должна явно показывать **5 финансовых сценариев** (SCF, ALTUM remonta aizdevums, банк, свой фонд, смешанный), не привязываясь только к SCF. Также явный disclaimer: «SCF план на оценке ЕК».

### R4: Объём 30 файлов — большой
- Велик риск, что часть файлов станет противоречивой к концу.
- **Mitigation:** идти от ядра к периферии: сначала glossary + concept (это становится якорем), потом всё остальное. После каждой фазы — sanity check на cross-references.

### R5: Старые `knowledge/1.md`–`4.md` остаются в репо как «исходные материалы»
- Они ссылаются на старую концепцию (комиссия с подрядчика, маркетплейс).
- **Mitigation:** не трогаем, но в `docs/migration-from-v1.md` пишем явно «исходные заметки сохранены, но больше не отражают целевую модель».

### R6: Ветка readiness-rewrite — длинная, main работает
- Долгий rewrite в worktree → возможен merge conflict.
- **Mitigation:** rewrite касается только `docs/`, `CLAUDE.md`, `AGENT.md`. Активная разработка в main идёт по коду — пересечение минимальное. Перед merge — `git fetch && git rebase main`.

## Out of scope (для этой итерации)

- Прав­ка кода (Prisma migrations, API routes, UI компоненты, i18n-словари next-intl)
- Удаление 1.5% комиссии из `api/tenders/bid`/`api/tenders/select` (отдельная итерация)
- Изменения схемы БД (новые модели описываем только в `data-model.md`, миграции — следующая итерация)
- Создание реальных юридических документов / DPA / GDPR consent flow
- Тестирование рынком (5 интервью с biedrības) — **рекомендуется, но за пределами doc-rewrite**

## Языковая политика (фиксирую здесь, чтобы не повторять)

- Документация → русский (как в текущем CLAUDE.md)
- Код, комментарии, коммиты → английский
- UI-термины приводятся как **LV (основной) + RU (вторичный)** через глоссарий
- Не переводим: Altum, Kadastrs, Zemesgrāmata, Smart-ID, eParaksts, biedrība, RNP, Lursoft, Jāņa sēta, VZD, BVKB, LVM, CSP, BIS, Mājas lieta, KEM, EM, ETS2, EIKIS, SCF, Sociālā klimata fonds, MK noteikumi, ALTUM remonta aizdevums, mans.altum.lv, KPVIS, ESCO, EIKIS, mājas vecākais, dzīvokļu īpašnieku biedrība, dzīvokļu īpašnieku kopība, apsaimniekotājs

## Definition of Done

- Все 30 файлов переписаны
- Все cross-references корректны (нет ссылок на удалённые файлы)
- `docs/README.md` индекс отражает новую структуру
- `CLAUDE.md` синхронизирован
- 6 коммитов в ветке `readiness-rewrite`
- Финальный обзор для пользователя готов
