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
│   │  АУДИТ                     БЕНЧМАРКИ                    │   │
│   │  POST /api/audit/upload     GET  /api/benchmarks/compare │   │
│   │  POST /api/audit/parse      GET  /api/benchmark/price    │   │
│   │  POST /api/audit/email-gate                              │   │
│   │                                                          │   │
│   │  РЕНОВАЦИЯ                 АДРЕС                        │   │
│   │  GET  /api/renovation/calculate   GET /api/address/search│   │
│   │  POST /api/renovation/documents   GET /api/address/resolve│   │
│   │  GET  /api/renovation/campaign-status                    │   │
│   │                                                          │   │
│   │  ГОЛОСОВАНИЕ               АУТЕНТИФИКАЦИЯ               │   │
│   │  POST /api/voting/create    POST /api/auth/smartid/init  │   │
│   │  POST /api/voting/vote      POST /api/auth/smartid/verify│   │
│   │  GET  /api/voting/status    GET  /api/auth/eparaksts/callback │
│   │  POST /api/voting/owners-upload                          │   │
│   │  POST /api/voting/protocol                               │   │
│   │                                                          │   │
│   │  МАРКЕТПЛЕЙС               ЗДАНИЯ                       │   │
│   │  POST /api/contractors/verify  GET /api/buildings/share-token │
│   │  POST /api/contractors/profile                           │   │
│   │  POST /api/tenders/bid                                   │   │
│   │  POST /api/tenders/select                                │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  LIB (общая серверная логика)                           │   │
│   │  prisma.ts · llm.ts · s3.ts · calculator/ · benchmarks/ │   │
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
| `audit/` | upload, parse, email-gate | PDF → S3 → GPT-4o vision → ExpenseItem[] → привязка к пользователю |
| `benchmarks/` | compare, price | Сравнение с BenchmarkSegment по series × district × areaRange |
| `renovation/` | calculate, documents, campaign-status | Детерминированный калькулятор + генерация документов |
| `voting/` | create, vote, status, owners-upload, protocol | Полный цикл голосования от создания кампании до протокола |
| `address/` | search, resolve | Jāņa sēta → LVM GeoServer WFS → Building в БД |
| `auth/` | smartid/init, smartid/verify, eparaksts/callback | Подписание голосов (не вход на платформу) |
| `contractors/` | verify, profile | Верификация через Lursoft + ведение профиля |
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
- `calculateAltumSubsidy()` — субсидия до 49%, взнос владельцев ≥51%, стоимость €130–300/м²
- Входные данные: среднее отопление из последних 3 обработанных отчётов (`ExpenseReport` со статусом `PROCESSED`); fallback = 2.1 €/м² при отсутствии данных

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
| Вход на платформу | email → magic link → NextAuth JWT сессия | Доступ к личному кабинету, аудиту, реновации |
| Подпись голоса | Smart-ID или eParaksts → API route | Юридически значимое голосование, подпись сохраняется в `Vote.signature` |

Smart-ID и eParaksts — **не провайдеры входа**. Они используются исключительно для подписания голосов. Пользователь входит через magic link, а при голосовании дополнительно подтверждает личность через Smart-ID или eParaksts.

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
