# Локальная разработка

## Быстрый старт

**Первый раз (один раз на машине):**
```bash
cp .env.example .env.local   # заполнить переменные
make dev-setup               # DB + schema + seed + dev server
```

**Каждый раз после этого:**
```bash
make dev                     # DB + schema sync + dev server
```

---

## Что делает каждая команда

### `make dev-setup` — первоначальная настройка

Запускать один раз при клонировании репозитория.

1. Поднимает контейнер PostgreSQL (`docker-compose.db.yml`)
2. Пересобирает Docker-образ `scripts` (нужен для seed/sync)
3. Ждёт готовности БД (`pg_isready`)
4. Применяет схему Prisma к БД (`prisma db push`)
5. Загружает тестовые данные (`seed-buildings` + `seed-series`)
6. Запускает `npm run dev`

### `make dev` — ежедневный запуск

```
DB уже существует? → просто запустить
Были изменения в schema.prisma? → применить автоматически
```

1. Поднимает контейнер PostgreSQL (если не запущен)
2. Синхронизирует схему Prisma с БД (`prisma db push`)
3. Запускает `npm run dev`

`prisma db push` идемпотентен: если схема не изменилась — ничего не делает.

---

## Переменные окружения

```bash
cp .env.example .env.local
```

Минимально необходимые для локальной разработки:

| Переменная | Значение для локального dev |
|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5433/alteko` |
| `NEXTAUTH_SECRET` | любая строка ≥ 32 символов |
| `NEXTAUTH_URL` | `http://localhost:3000` |
| `OPENAI_API_KEY` | нужен только для тестирования парсинга PDF |

Остальные переменные (`S3_*`, `JANA_SETA_*`, внешние API) нужны только при разработке конкретных модулей.

> **Порт БД:** Docker пробрасывает PostgreSQL на `localhost:5433` (не 5432 — чтобы не конфликтовать с локальным Postgres).

---

## Схема БД: когда и как обновлять

### Изменил `prisma/schema.prisma`

```bash
make push        # применить изменения к локальной БД
```

`push` не создаёт файл миграции — только синхронизирует схему. Достаточно для локальной разработки.

### Нужен файл миграции (для продакшна)

```bash
make migrate     # prisma migrate dev — запускается в контейнере, создаёт файл в prisma/migrations/
```

Команда интерактивная — попросит имя миграции. Файлы миграций коммитятся. В CI/CD применяются через `prisma migrate deploy`.

---

## Тестовые данные

Команды seed запускаются внутри Docker-контейнера `scripts`.

| Команда | Что делает |
|---|---|
| `make seed` | seed-buildings + seed-series (оба) |
| `make seed-buildings` | заглушки зданий для разработки |
| `make seed-series` | справочник серий (103, 119, 467 и др.) |
| `make seed-benchmarks` | пересчитать перцентили из существующих отчётов |
| `make seed-blog` | загрузить статьи блога из markdown-файлов |

Seed-данные — только для разработки. В продакшне данные приходят из синхронизации `data.gov.lv`.

---

## Синхронизация данных

Для разработки модулей, которые зависят от реальных данных:

```bash
make sync-buildings      # кадастровые данные (~500k зданий, ~30 мин)
make sync-vzd            # адреса из реестра VZD
make sync-bvkb           # энергосертификаты BVKB
make sync-transactions   # сделки с квартирами (~200 МБ)
```

> Требуют заполненных `VZD_*` и `BVKB_DATA_URL` в `.env.local`. Запускают долгие HTTP-загрузки — не нужны для большинства задач разработки.

---

## Полезные команды

```bash
make studio          # Prisma Studio — GUI для просмотра БД (localhost:5555)
make backup          # дамп БД в ./backups/
make check           # TypeScript type-check + ESLint
make db-down         # остановить контейнер PostgreSQL
make db-rebuild      # пересобрать Docker-образ scripts (после изменений Dockerfile.scripts)
```

---

## Структура Docker

| Контейнер | Файл | Назначение |
|---|---|---|
| `alteko-db-1` | `docker-compose.db.yml` | PostgreSQL для локальной разработки |
| `alteko-scripts` | `docker-compose.db.yml` | one-off runner для seed/sync скриптов |
| `app` + `db` | `docker-compose.yml` | продакшн-стек (не для локальной разработки) |

Next.js dev server запускается **на хосте** (`npm run dev`), не в контейнере — это даёт горячую перезагрузку.

---

## `make dev` vs `make up` — разница

| Команда | Для чего |
|---|---|
| `make dev` | Локальная разработка с hot reload. Next.js на хосте, только DB в Docker |
| `make up` | Продакшн-стек: и приложение, и DB — в Docker. Без hot reload |

Для разработки всегда `make dev`. `make up` — только для проверки продакшн-сборки локально.

---

## Типичные проблемы

**`pg_isready: not found`** — образ `scripts` устарел. Запустить:
```bash
make db-rebuild
```

**`DATABASE_URL` не указывает на контейнер** — скрипты внутри Docker подключаются через `db:5432` (service name), хост подключается через `localhost:5433`. В `.env.local` нужно `localhost:5433`.

**Изменения в `schema.prisma` не применились** — запустить `make push` или перезапустить через `make dev` (push запускается автоматически).

**`npm run build` падает с `EACCES: permission denied, scandir 'data/postgres'`** — Next.js 15 при `output: 'standalone'` запускает file-tracing, который рекурсивно читает корень проекта. Каталог `data/postgres` принадлежит контейнеру Postgres (uid 70, mode 0700) и недоступен хост-пользователю.

Варианты решения (любой подходит):

1. **Остановить контейнер перед сборкой:**
   ```bash
   docker compose -f docker-compose.db.yml down
   npm run build
   docker compose -f docker-compose.db.yml up -d
   ```
2. **Сделать каталог проходимым (нужен sudo):**
   ```bash
   sudo chmod a+rX data/postgres
   ```
   Это не открывает чтение содержимого, но даёт scandir вернуть листинг (он останется пустым для не-владельца).
3. **Перенести данные за пределы проекта (рекомендуется для CI):**
   измените том в `docker-compose.db.yml` на абсолютный путь, например `/var/lib/alteko-postgres:/var/lib/postgresql/data`, и пересоздайте контейнер с миграцией данных.

Production-сборка через Docker не затронута — `.dockerignore` исключает `data/`, `backups/`, `tmp/` из build context.
