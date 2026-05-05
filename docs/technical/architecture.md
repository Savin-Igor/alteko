# Архитектура системы

## Обзор

ALTEKO — монолит на Next.js: одно TypeScript-приложение, которое обрабатывает и пользовательский интерфейс (SSR-страницы), и backend (API Routes). PostgreSQL — основная БД, доступ через Prisma ORM. Отдельного backend-сервера или микросервиса нет.

---

## Диаграмма слоёв

```
┌──────────────────────────────────────────────────────────────────┐
│                        КЛИЕНТЫ                                   │
│   Веб-браузер (десктоп + мобильный)                              │
└──────────────────────────┬───────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼───────────────────────────────────────┐
│                   ПРИЛОЖЕНИЕ NEXT.JS                             │
│   TypeScript — один Docker-контейнер                             │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  СТРАНИЦЫ (App Router — SSR)                            │   │
│   │  /dashboard  /audit  /renovation  /voting  /marketplace │   │
│   │  /auth/signin  /auth/verify                             │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  MIDDLEWARE (next-intl)                                  │   │
│   │  Маршрутизация lv (без префикса) / ru (/ru/...)          │   │
│   │  Не обрабатывает: /api/, /_next/, статика               │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  API ROUTES (/api/*)                                    │   │
│   │                                                          │   │
│   │  ИЗДЕРЖКИ (бывш. АУДИТ)     БЕНЧМАРКИ                   │   │
│   │  POST /api/audit/upload     GET  /api/benchmarks/compare │   │
│   │  POST /api/audit/parse      GET  /api/benchmark/price    │   │
│   │  POST /api/audit/email-gate                              │   │
│   │                                                          │   │
│   │  ГОТОВНОСТЬ (новые v2)     ФИНАНСИРОВАНИЕ (новые v2)    │   │
│   │  GET  /api/readiness/:cad   GET  /api/financing/scenarios│   │
│   │  POST /api/readiness/recalc POST /api/financing/calculate│   │
│   │  GET  /api/readiness/passport                            │   │
│   │                                                          │   │
│   │  АДРЕС                                                   │   │
│   │  GET  /api/address/search   GET /api/address/resolve     │   │
│   │                                                          │   │
│   │  РЕШЕНИЯ (новые/расшир.)   АУТЕНТИФИКАЦИЯ               │   │
│   │  POST /api/decisions/create POST /api/auth/smartid/init  │   │
│   │  POST /api/decisions/intent POST /api/auth/smartid/verify│   │
│   │  POST /api/decisions/export-bis  GET /api/auth/eparaksts │   │
│   │  POST /api/voting/* (legacy, расширяются)                │   │
│   │                                                          │   │
│   │  TENDER ROOM (бывш. МАРКЕТПЛЕЙС)  ЗДАНИЯ                │   │
│   │  POST /api/contractors/verify  GET /api/buildings/share-token │
│   │  POST /api/contractors/profile                           │   │
│   │  POST /api/contractors/subscribe (новый: подписка)       │   │
│   │  POST /api/tenders/bid    (FIXME: убрать 1.5% хардкод)   │   │
│   │  POST /api/tenders/select (FIXME: убрать 1.5% хардкод)   │   │
│   │  GET  /api/tenders/risk-check (новый: Lursoft+IUB)       │   │
│   │                                                          │   │
│   │  READINESS REPORT (платный продукт)                      │   │
│   │  POST /api/readiness-report/order                        │   │
│   │  POST /api/readiness-report/payment-webhook              │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  LIB (общая серверная логика)                           │   │
│   │  prisma.ts · llm.ts · s3.ts                              │   │
│   │  calculator/ · benchmarks/                              │   │
│   │  readiness/    (новый v2: расчёт BuildingReadinessScore)│   │
│   │  financing/    (новый v2: rules engine, 5 сценариев)    │   │
│   │  decisions/    (новый v2: Decision Campaigns + BIS export)│ │
│   │  supplier-risk/(новый v2: Lursoft + IUB graph)          │   │
│   │  stubs.ts (STUB_MODE=true)                              │   │
│   └─────────────────────────────────────────────────────────┘   │
└────┬──────────────────────┬───────────────────────┬─────────────┘
     │                      │                       │
┌────▼─────┐      ┌─────────▼──────────┐   ┌───────▼───────┐
│PostgreSQL│      │   LLM API          │   │Внешние API    │
│(Prisma)  │      │   (OpenAI GPT-4o)  │   │               │
│          │      │                    │   │Jāņa sēta      │
│Пользоват.│      │  - парсинг PDF     │   │LVM GeoServer  │
│Здания    │      │  (vision, один     │   │Lursoft        │
│Расходы   │      │   вызов, без OCR)  │   │Nodemailer     │
│Голоса    │      │                    │   │(magic link)   │
│Проекты   │      └────────────────────┘   └───────────────┘
└──────────┘
     │
┌────▼─────┐
│  S3      │
│Хранилище │
│PDF/доки  │
└──────────┘
```

---

## Ответственность компонентов

### Страницы Next.js (App Router, SSR)

- SSR-страницы на React, локализованные через next-intl
- Данные запрашиваются напрямую через Prisma (серверные компоненты) или через API Routes (клиентские компоненты)
- Кастомные страницы аутентификации: `/auth/signin`, `/auth/verify`

### Middleware (next-intl)

- Перехватывает все пути, кроме `/api/`, `/_next/` и статических файлов
- Локаль `lv` — по умолчанию, без префикса; `ru` — с префиксом `/ru/...`

### API Routes Next.js (`/api/*`)

Backend-логика. Каждый route — TypeScript-функция:
- Валидация входных данных
- Проверка авторизации (через сессию NextAuth)
- Бизнес-логика (с использованием утилит из `src/lib/`)
- Доступ к БД (через Prisma client)
- Ответ

**Группы routes:**

| Группа | Routes | Назначение |
|--------|--------|-----------|
| `audit/` | upload, parse, email-gate | PDF → S3 → GPT-4o vision → ExpenseItem[] → привязка к пользователю; питает readiness `data_confidence` |
| `benchmarks/` | compare, price | Сравнение с BenchmarkSegment по series × district × areaRange |
| `readiness/` *(новая v2)* | :cadastralCode, recalc, passport | Расчёт BuildingReadinessScore + nextBestAction + Mājas pase |
| `financing/` *(новая v2)* | scenarios, calculate | 5 сценариев финансирования с rules engine |
| `decisions/` *(новая v2)* | create, intent, export-bis | Decision Campaigns с подготовительной фазой и экспортом в BIS Mājas lieta |
| `renovation/` *(legacy)* | calculate, documents, campaign-status | Сохранены для обратной совместимости; новый функционал — в `financing/` и `decisions/` |
| `voting/` *(legacy/расширяется)* | create, vote, status, owners-upload, protocol | Подпись и финальное голосование. В v2 связан с `decisions/` через `DecisionCampaign.formalCampaignId` |
| `address/` | search, resolve | Jāņa sēta → LVM GeoServer WFS → Building в БД |
| `auth/` | smartid/init, smartid/verify, eparaksts/callback | Подписание решений (не вход на платформу) |
| `contractors/` | verify, profile, subscribe | Верификация через Lursoft + ведение профиля + подписка (новое) |
| `tenders/` | bid, select, risk-check | Tender Room. **FIXME:** убрать 1.5% commission хардкод (отдельная итерация) |
| `readiness-report/` *(новая v2)* | order, payment-webhook | Платный Gatavības atskaite €300-900 + Stripe webhook |
| `tenders/` | bid, select | Заявки и выбор победителя |
| `buildings/` | share-token | Публичная ссылка на здание |

### Права доступа

| Route | Требование |
|-------|-----------|
| `POST /api/voting/create` | Роль `ASSOCIATION_ADMIN` или `PLATFORM_ADMIN` |
| `POST /api/voting/owners-upload` | Роль `ASSOCIATION_ADMIN` или `PLATFORM_ADMIN` |
| Остальные voting routes | Аутентифицированный пользователь |

### Prisma (ORM)

- `prisma/schema.prisma` — единственный источник правды для схемы БД
- `prisma generate` генерирует TypeScript-клиент
- `prisma migrate deploy` запускает ожидающие миграции (используется в CI/CD)
- Prisma client — синглтон (`src/lib/prisma.ts`), общий для всех API Routes

### LLM (GPT-4o через OpenAI SDK)

Вызывается из `src/lib/llm.ts`. Один сценарий использования:
- **Парсинг PDF**: PDF → presigned URL → base64-кодирование → `data:application/pdf;base64,...` → GPT-4o vision → structured JSON

**Без OCR.** Нет отдельного шага извлечения текста, нет Tesseract, нет Python-сервиса. Один вызов GPT-4o обрабатывает PDF напрямую через vision API.

Категории расходов, извлекаемые из PDF: HEATING, COLD_WATER, HOT_WATER, WASTEWATER, WASTE, CLEANING, REPAIR_FUND, ADMINISTRATION, ELEVATOR, OTHER.

LLM не используется для бенчмаркинга, тепловых прогнозов и обнаружения аномалий — это детерминированные TypeScript-функции.

### Калькулятор реновации (детерминированный)

Файл: `src/lib/calculator/`

- `calculateRenovationSavings()` — факторы эффективности по энергоклассу (G→C: экономия ~65%, F→C: ~58%)
- `calculateAltumSubsidy()` — устаревшая функция; в v2 заменена на `src/lib/financing/`
- Входные данные: среднее отопление из последних 3 обработанных отчётов (`ExpenseReport` со статусом `PROCESSED`); fallback = 2.1 €/м² при отсутствии данных

### Readiness Engine (новый v2)

Файл: `src/lib/readiness/`

- `computeReadinessScore(buildingId)` — собирает 8 компонентов из БД и расчётных функций
- `generateNextBestAction(score)` — детерминированная логика, возвращает локализованную строку (LV/RU)
- `computeIntegrityScore(buildingId)` — отдельный блок Integrity Score
- Используется в API route `/api/readiness/:cadastralCode` и для пересчёта при обновлении данных

### Financing Rules Engine (новый v2)

Файл: `src/lib/financing/`

- `rules/scf-2026-2032.ts` — правила пригодности под Sociālā klimata fonds (черновые до выхода MK noteikumi)
- `rules/altum-remonta-aizdevums.ts` — правила ALTUM ремонтного кредита
- `rules/commercial-bank.ts` — правила коммерческих банков (общие)
- `rules/own-fund.ts` — расчёт по собственному фонду
- `rules/mixed.ts` — смешанный сценарий
- `evaluate(scenario, building)` — единая функция оценки пригодности
- `versioning/` — управление версиями правил (RulesEngineVersion в БД)

Когда выходят MK noteikumi — обновляется один файл правил, новая версия в `RulesEngineVersion`, BuildingReadinessScore пересчитывается batch-job'ом.

### Decisions Engine (новый v2)

Файл: `src/lib/decisions/`

- `createCampaign(buildingId, decisionType)` — создание DecisionCampaign с шаблонами LV/RU
- `recordIntention(campaignId, ownerId, decision)` — предварительные намерения (без юридической силы)
- `promoteToFormal(campaignId)` — создание VotingCampaign на основе DecisionCampaign
- `exportToBis(campaignId)` — генерация PDF-пакета для BIS Mājas lieta (или в Phase 4 — API)
- Шаблоны вопросов на 7 типов решений в `src/lib/decisions/templates/`

### Supplier Risk Check (новый v2)

Файл: `src/lib/supplier-risk/`

- `checkConflicts(tenderParticipants[])` — поиск связей через Lursoft + IUB graph
- Источники: Lursoft (правления, владельцы, адреса), IUB open data (тендерная история)
- Возвращает массив risk indicators для UI

### Бенчмаркинг

Файл: `src/lib/benchmarks/`

- Сегментация: series × district × areaRange × category × periodYear × periodMonth
- areaRange: SMALL (< 2 000 м²), MEDIUM (≤ 5 000 м²), LARGE (> 5 000 м²)
- Основная метрика: `amountPerM2` (€/м²)
- Минимум 10 зданий в сегменте для достоверного бенчмарка

### Голосование

- `ownershipShare` фиксируется в момент голосования (immutable snapshot)
- `currentYesShare` пересчитывается после каждого голоса
- Автозавершение при `currentYesShare >= requiredThreshold`
- Unique constraint `(campaignId, apartmentId)` исключает повторное голосование

### База данных (PostgreSQL)

Основное персистентное хранилище. Управляемый PostgreSQL в продакшне.
Локально: Docker-контейнер (`postgres:16-alpine`).

### Объектное хранилище (S3-совместимое)

Хранит бинарные файлы: загруженные PDF, сгенерированные документы (повестки, протоколы).
Доступ из API Routes через `@aws-sdk/client-s3` с `forcePathStyle: true`.
Клиенты получают presigned URL, не прямой доступ.
Провайдер конфигурируется через `S3_ENDPOINT` в `.env` — см. `tech-stack.md`.

---

## Аутентификация

**Провайдер:** NextAuth.js v5 + PrismaAdapter
**Стратегия сессии:** JWT
**Метод входа:** magic link через email (Nodemailer). Паролей нет.

**Два независимых пути:**

| Путь | Механизм | Назначение |
|------|---------|-----------|
| Вход на платформу | email → magic link → NextAuth JWT сессия | Доступ к личному кабинету, дашбордам Valdes/Speciālista |
| Подпись решения | Smart-ID или eParaksts → API route | Юридически значимое решение собственника, подпись сохраняется в `Vote.signature` |

Smart-ID и eParaksts — **не провайдеры входа**. Они используются исключительно для подписания решений собственников. Пользователь входит через magic link, а при принятии решения дополнительно подтверждает личность через Smart-ID или eParaksts.

**Кастомные страницы:** `/auth/signin`, `/auth/verify`

**Smart-ID flow:**
1. Пользователь нажимает «Голосовать» → `POST /api/auth/smartid/init` инициирует сессию
2. Smart-ID отправляет вызов на мобильное приложение пользователя
3. Пользователь подтверждает на телефоне
4. `POST /api/auth/smartid/verify` получает подписанный ответ
5. Подпись сохраняется в записи `Vote` в PostgreSQL

**eParaksts flow:**
- OAuth 2.0 redirect через LVRTC
- `GET /api/auth/eparaksts/callback` получает результат
- Подпись сохраняется в записи `Vote`

---

## i18n

**Библиотека:** next-intl
**Локали:** `lv` (по умолчанию, без префикса URL) и `ru` (с префиксом `/ru/...`)
**Middleware:** перехватывает все пути, кроме `/api/`, `/_next/`, статики

---

## Stub mode (локальная разработка)

При `STUB_MODE=true` в `.env.local` внешние вызовы заменяются заглушками:
- S3 → локальная файловая система
- OpenAI → фиксированные ответы
- Jāņa sēta → фиксированные ответы

Три тестовых здания в stub mode:
- Brīvības 55 — серия 119
- Mārupes 12 — серия 467
- Ķengaraga 1 — серия 103

---

## CI/CD Pipeline

**Инструмент:** GitHub Actions

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  deploy:
    steps:
      - tsc --noEmit              # проверка типов
      - eslint .                  # линтинг
      - prisma migrate deploy     # запуск миграций БД
      - next build                # сборка для продакшна
      - docker build + push       # образ контейнера
      - deploy to server          # SSH или CLI платформы
```

Миграции запускаются до старта нового образа — zero-downtime требует обратно совместимых изменений схемы.

---

## Нефункциональные требования

| Свойство | Требование |
|----------|------------|
| Задержка обработки PDF | ≤10 секунд (один вызов GPT-4o vision, синхронно в MVP) |
| Время ответа API (p95) | ≤300 мс (без учёта LLM-вызовов) |
| Доступность | ≥99,5% |
| Резервное копирование | Ежедневный дамп PostgreSQL, хранение 30 дней |
| Масштабируемость | Горизонтальное масштабирование Next.js; connection pooling Prisma через PgBouncer |
| GDPR | Персональные данные зашифрованы в покое; данные голосования append-only |

---

## Деплой (Docker Compose — MVP)

```yaml
services:
  app:
    build: .
    environment:
      DATABASE_URL: postgresql://...
      OPENAI_API_KEY: ...
      S3_ENDPOINT: ...
      AWS_S3_BUCKET: ...
      NEXTAUTH_SECRET: ...
      NEXTAUTH_URL: ...
    ports:
      - "3000:3000"

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
```

В продакшне: заменить `db` на управляемый PostgreSQL-сервис. Оставить `app` как один контейнер или масштабировать горизонтально за балансировщиком нагрузки.

---

*Стек: TypeScript, Next.js, Prisma, PostgreSQL, Docker*
