# Миграция с v1 на v2: Mājas gatavības platforma

Документ фиксирует разворот концепции ALTEKO в мае 2026 г. Цель — чтобы любой новый человек на проекте (или AI-агент) мог за 5 минут понять: что было, что стало, почему изменилось.

---

## Контекст

В мае 2026 г. была проведена внешняя экспертиза проекта (см. `v2.md` в корне репо — диалог из 4 раундов с независимым экспертом). Эксперт выявил три фундаментальные ошибки концепции v1:

1. Привязка к закрытой программе ALTUM 2021-2027
2. Конфликт интересов через комиссию от подрядчика
3. Конкуренция с государственным контуром BIS вместо надстройки

Все ключевые факты эксперта были верифицированы через первичные источники (altum.lv, likumi.lv, bis.gov.lv, employment-social-affairs.ec.europa.eu, iub.gov.lv).

---

## Что изменилось

### Главный позиционный сдвиг

| | v1 | v2 |
|--|----|-----|
| Главное обещание | «Снизьте счёт за отопление на 60%, государство платит до 49%» | «Подготовьте дом к следующему окну финансирования» |
| Главная сущность | Аудит + калькулятор реновации + маркетплейс | **Building Readiness Score** + **Next Best Action** |
| Главный платный продукт | Комиссия 1.5% от сделки реновации | **Gatavības atskaite** €300–900 + 3 других продукта |
| Главный клиент | Жилец, загрузивший PDF | biedrība / mājas vecākais (Valdes mode) + apsaimniekotājs (Speciālista mode) |
| Главное окно денег | ALTUM 2021-2027 | **SCF 2026-2032** (€127M на МКД) + **ALTUM remonta aizdevums** уже сейчас |

### Дорожная карта

| | v1 | v2 |
|--|----|-----|
| Phase 1 | Сбор данных (500 PDF) | Validation: 3 платных Readiness Report |
| Phase 2 | Доверие, B2B-подписки | Repeat: 10 домов в подписке + 1 специалист |
| Phase 3 | Полная реновация + маркетплейс + первый контракт | Pre-Window Prep: 50 домов, 5 специалистов, готовность к Q4 2026 |
| Phase 4 | Масштабирование (банк, моб. приложение) | SCF Window (Q2 2027+): конверсия в поданные заявки |

### Монетизация

| | v1 | v2 |
|--|----|-----|
| Главный поток | Success fee 1.5% от подрядчика (€4.5–12k за сделку) | Gatavības atskaite €300–900 + Valdes darba telpa €30–100/мес. + Projekta sagatavošanas pakete €2–8k + Speciālista portfelis €100–500/мес. |
| Подрядчики | 1.5% при победе | Фиксированная подписка €50–200/мес. за профиль |
| LTV дома | €4 500–12 000 разово | €6 040 за 24 мес. |
| LTV специалиста | — | €15 200 за 36 мес. |

### Модули

| Старое | Новое (LV / RU) | Что изменилось |
|--------|------------------|----------------|
| Аудит расходов | **Izdevumu izpratne** / **Понимание расходов** | Теперь trust artifact, не воронка к комиссии |
| Калькулятор реновации (один ALTUM) | **Finansējuma scenāriji** / **Финансовые сценарии** | 5 сценариев со статусом окна |
| Электронное голосование | **Lēmumu kampaņas** / **Кампании решений** | 7 типов решений + экспорт в BIS, не замена BIS |
| Маркетплейс подрядчиков | **Piegādātāju atlases telpa** / **Комната выбора поставщиков** | Без success fee, с Supplier Risk Check (Lursoft + IUB) |
| (отсутствовал) | **Mājas gatavības novērtējums** / **Оценка готовности дома** | Новый центральный модуль |

### Архитектура

| | v1 | v2 |
|--|----|-----|
| Центральная сущность | Building + Apartment | Building + **BuildingReadinessScore** |
| Финансирование | `RenovationProject.commissionAmount` (1.5%) | **FinancingScenario** (1:N для дома, по одной на сценарий) + **RulesEngineVersion** |
| Голосование | `VotingCampaign` | **DecisionCampaign** (с подготовительной фазой) → опциональный `VotingCampaign` для формального голоса |
| Подрядчики | `Contractor` без подписки | `Contractor.subscriptionTier`: NONE / BASIC / PLUS |
| Заказы | (отсутствовала) | **ReadinessReportOrder** + Stripe webhook |
| Слой `lib/` | calculator/, benchmarks/ | + readiness/, financing/, decisions/, supplier-risk/ |

### Языковые правила

| | v1 | v2 |
|--|----|-----|
| Документация | Русский | Русский |
| Код / коммиты | Английский | Английский |
| UI | LV + RU, но местами проникает EN | **Только LV + RU**, через `docs/reference/readiness-glossary.md` |

---

## Что осталось без изменений

Переписана концепция, не код. Большая часть кода переиспользуется:

- ✅ Стек: Next.js 15, Prisma, PostgreSQL, GPT-4o, Payload CMS
- ✅ Адресный поиск (Jāņa sēta + LVM WFS)
- ✅ Карточка дома (Building) + ~40k записей в БД
- ✅ Энергоданные BVKB (синхронизация ежедневно)
- ✅ Серии зданий (BuildingSeries + эвристика)
- ✅ PDF→GPT-4o vision парсинг
- ✅ Бенчмаркинг (BenchmarkSegment)
- ✅ Smart-ID / eParaksts флоу (теперь для подписи решений, не «голосования» как UVP)
- ✅ Каталог подрядчиков (~2 000 в БД)
- ✅ NextAuth magic-link
- ✅ i18n (next-intl: lv default, ru с префиксом)
- ✅ Docker + GitHub Actions

---

## Что должно быть удалено или изменено в коде (отдельная итерация)

Это **запланированные изменения**, не выполненные в этой итерации rewrite доков:

### Critical (блокирует запуск под новой концепцией)

1. **Удалить хардкод 1.5%** в `src/app/api/tenders/bid/route.ts` и `src/app/api/tenders/select/route.ts`
2. **Переписать i18n-копирайт** в `src/messages/lv.json` и `src/messages/ru.json` под глоссарий
3. **Удалить с лендинга** обещания «получите субсидию ALTUM» и «снизьте счёт на 60%»

### High priority

4. Добавить новые Prisma-модели: `BuildingReadinessScore`, `FinancingScenario`, `DecisionCampaign`, `ReadinessReportOrder`, `RulesEngineVersion`
5. Добавить новые enum'ы: `FundingWindowStatus`, `DataConfidence`, `LegalConfidence`, `BuildingProjectStatus`, `DecisionType`, `FinancingScenarioType`, `FinancingEligibility`, `ContractorSubscriptionTier`
6. Расширить `UserRole` enum: `BOARD_MEMBER`, `PROFESSIONAL`
7. Реализовать `src/lib/readiness/` — расчёт BuildingReadinessScore + nextBestAction
8. Реализовать `src/lib/financing/` — 5 сценариев + rules engine с версионированием
9. Создать новые API routes: `/api/readiness/*`, `/api/financing/*`, `/api/decisions/*`, `/api/readiness-report/*`
10. Создать страницы: `/financing`, `/readiness/order`, `/dashboard/portfolio`

### Medium priority

11. Реализовать `src/lib/decisions/` — Decision Campaigns с экспортом в BIS
12. Реализовать `src/lib/supplier-risk/` — граф связей через Lursoft + IUB
13. Интегрировать Stripe для платежей за Readiness Report
14. Обновить навигацию: `SiteHeader`, `SiteFooter`, breadcrumbs

### Low priority

15. Добавить `src/lib/financing/rules/scf-2026-2032.ts` (черновые правила до выхода MK noteikumi)
16. Новые seed-файлы для тестовых данных
17. Обновить storybook / тесты

---

## Что осталось как «исходный материал» (не удалять)

- `knowledge/1.md`–`4.md` — оригинальные черновые заметки. **Не отражают целевую модель**, но сохранены как исторический контекст
- `v2.md` — диалог с независимым экспертом, на основе которого выполнен разворот. **Не source of truth**, но первоисточник идеи разворота

Не удалены, чтобы можно было проследить логику решений.

---

## Список коммитов rewrite

В ветке `readiness-rewrite`:

| Коммит | Что сделано |
|--------|-------------|
| `444db88` | Phase 1: foundation (план, глоссарий, CLAUDE.md, README) |
| `be3f130` | Phase 2: business (concept, market, monetization, roadmap) |
| `e3674d8` | Phase 3: product (overview, mvp, modules, design, content) |
| `0485339` | Phase 4: technical (architecture, data-model, integrations) |
| `33b1e0e` | Phase 5: reference (key-facts, glossary, data-sources) |
| (текущий) | Phase 6: cross-cutting (diagrams, AGENT.md, migration-from-v1.md) |

---

## Что делать дальше

После принятия этой концепции (документация):

1. **Валидация рынка (рекомендуется до кода):** 5 интервью с biedrības / mājas vecākais / специалистами. Проверить, готовы ли они платить €300–900 за Readiness Report
2. **Удаление 1.5% commission хардкода** — отдельная итерация в коде
3. **Лендинг переписать под Mājas gatavības platforma** — minimum viable change
4. **Реализация новых моделей и API** — итеративно по списку выше
5. **Первый платный пилот** — продать 1 Readiness Report за реальные деньги до масштабной разработки

---

*Источники: v2.md, верифицировано через altum.lv, likumi.lv/ta/id/361681, bis.gov.lv, employment-social-affairs.ec.europa.eu, fi-compass дек. 2024*
