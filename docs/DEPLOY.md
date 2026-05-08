# Deploy

Stack: Next.js 15 + PostgreSQL + Payload CMS + Docker → GHCR → Hetzner Cloud + nginx (host).

Auto-deploy: `git tag v* && git push origin v*` → GitHub Actions → Docker build → GHCR → SSH to Hetzner → `docker compose pull + up`.

ALTEKO живёт на том же VPS, что и MezaData. Один сервер хостит несколько проектов. У каждого свой порт на хосте, свой каталог в `/opt/`, свой каталог данных в `/mnt/data/`.

---

## Архитектура deploy

```
git tag v0.1.0 && git push origin v0.1.0
    ↓
GitHub Actions (.github/workflows/deploy.yml)
    ↓  build job: docker buildx → GHCR (ghcr.io/savin-igor/alteko:0.1.0 + sha-XXX + latest)
    ↓  deploy job: SSH to Hetzner
    ↓    cd /opt/alteko
    ↓    write .env from secrets
    ↓    pre-deploy pg_dump + ротация (хранит 10 последних)
    ↓    docker compose pull app
    ↓    docker compose up -d --remove-orphans
    ↓    wait for /api/health 200 (max 90s)
    ↓    docker image prune -f
    ↓
Hetzner VPS  /opt/alteko/
    ├── app (Docker, Next.js + Payload)  — port 3020 на хосте → 3000 в контейнере
    ├── db (Docker, postgres:16-alpine) — данные в /mnt/data/alteko/postgres
    └── nginx (host)                     — reverse proxy, HTTPS via Certbot
```

Container entrypoint (`scripts/docker-entrypoint.sh`) при каждом старте:
1. `npx prisma migrate deploy` — применяет миграции (idempotent)
2. `node server.js` — Next.js standalone server

---

## Сервер

| Параметр | Значение |
|----------|----------|
| Provider | Hetzner Cloud, Helsinki |
| План | CX22 (2 vCPU, 4 GB RAM, 40 GB disk) |
| Volume | 20 GB Hetzner Volume на `/mnt/data` |
| OS | Ubuntu 24.04 |
| IP | `89.167.4.195` |
| SSH alias | `palpalych` |
| Domain | `alteko.lv` (DNS A → 89.167.4.195) |
| Deploy path | `/opt/alteko/` |
| Host port | `127.0.0.1:3020` (loopback only — nginx terminates SSL) |

### Каталоги данных

| Путь | Что лежит |
|------|-----------|
| `/mnt/data/alteko/postgres` | PostgreSQL data (Hetzner Volume — переживает rebuild сервера) |
| `/mnt/data/alteko/uploads` | Payload media (если самохост; иначе S3) |
| `/mnt/data/alteko/backups` | `pg_dump` дампы перед каждым deploy (последние 10, gzip) |

### Port allocation на VPS

| Порт | Проект |
|------|--------|
| 3010 | MezaData |
| 3020 | **ALTEKO** |
| 3030+ | будущие проекты |

### nginx vhost

Конфиг на сервере: `/etc/nginx/sites-available/alteko.lv` (см. issue #137 за полным snippet).
- 80/443 → Certbot/Let's Encrypt SSL
- `proxy_pass http://127.0.0.1:3020`

Чтобы добавить ещё проект: новый vhost с другим портом, новый Certbot cert, `/opt/<project>/docker-compose.yml`.

---

## GitHub Secrets

`Settings → Secrets and variables → Actions → Secrets`. Полный список и команды для установки — в issue #138.

| Secret | Что это |
|--------|---------|
| `HETZNER_HOST` | `89.167.4.195` |
| `HETZNER_USER` | `root` |
| `HETZNER_SSH_KEY` | приватный SSH-ключ для deploy (тот же, что для MezaData) |
| `POSTGRES_PASSWORD` | сильный пароль для production Postgres (≠ MezaData) |
| `NEXTAUTH_SECRET` | `openssl rand -hex 32` |
| `PAYLOAD_SECRET` | `openssl rand -hex 32`. Если не задан — fallback на NEXTAUTH_SECRET (не рекомендуется в продакшене) |
| `OPENAI_API_KEY` | ключ OpenAI |
| `RESEND_API_KEY` | ключ Resend (домен alteko.lv должен быть verified — см. issue #139) |
| `ADMIN_EMAIL` | куда падают уведомления о новых заявках |
| `JANA_SETA_API_URL`, `JANA_SETA_API_KEY` | геокодер |
| `LVM_GEOSERVER_URL` | WFS endpoint LVM |
| `S3_ENDPOINT` | Hetzner Object Storage endpoint, например `https://fsn1.your-objectstorage.com` (Falkenstein) или `https://hel1.your-objectstorage.com` (Helsinki). См. ADR `docs/technical/adr/0001-s3-provider.md` |
| `S3_REGION` | `fsn1` или `hel1` |
| `S3_BUCKET` | имя bucket, по умолчанию `alteko-uploads`. Для документов и медиа используются отдельные bucket'ы (см. ADR) |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | ключи Hetzner Object Storage |

`DATABASE_URL` **не** secret — он собирается в deploy-скрипте:
```
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/alteko
```

`.env` на сервере перезаписывается каждый deploy. Никогда не редактируй вручную.

---

## Локальная разработка

```bash
make dev
```

См. `docs/technical/local-development.md` для полного цикла. Локальный порт — `3000` (отличается от prod `3020`), DB на `localhost:5433`.

---

## Cut a release

```bash
make release v=0.1.0
# или вручную:
git tag v0.1.0
git push origin v0.1.0
```

Любой тег вида `v*` стартует deploy. Прогресс — в Actions tab.

Версионирование: semver. Patch для багфиксов (`v0.1.1`), minor для фич (`v0.2.0`), major для breaking (`v1.0.0`).

---

## Server management

```bash
ssh palpalych
cd /opt/alteko

# Статус контейнеров
docker compose ps

# Логи app
docker compose logs app --tail 50 -f

# Перезапуск только app
docker compose restart app

# Применить новую compose.yml без deploy (если изменили конфиг руками)
docker compose up -d

# Войти в shell контейнера
docker compose exec app sh

# nginx
systemctl status nginx
systemctl reload nginx
```

---

## CLI / sync команды на сервере

Скрипты синхронизации лежат в `scripts/` и запускаются внутри app-контейнера:

```bash
ssh palpalych
cd /opt/alteko

# Sync VZD адресов
docker compose exec app npx tsx scripts/sync-vzd.ts

# Sync BVKB энергосертификатов
docker compose exec app npx tsx scripts/sync-bvkb.ts

# Sync apartment transactions (тяжёлый, ~200MB)
docker compose exec app npx tsx scripts/sync-transactions.ts
```

> **TODO:** scheduled cron на эти команды пока нет. Workflow `sync-data.yml` отключён от расписания (prod DB недоступна с GitHub runners). Восстановить через SSH-action на сервер. См. примечание в `.github/workflows/sync-data.yml`.

---

## Manual hotfix (skip CI)

Если нужно срочно подсунуть уже собранный образ из GHCR без полного pipeline:

```bash
make deploy DEPLOY_HOST=root@89.167.4.195
```

Pull `latest` и перезапуск только app. **Не делает backup, не ждёт healthcheck** — используй только если знаешь, что делаешь.

---

## Troubleshooting

### App не отвечает / 502 Bad Gateway

```bash
ssh palpalych
cd /opt/alteko
docker compose ps
docker compose logs app --tail 100
```

Типичные причины:
- Entrypoint всё ещё гоняет `prisma migrate deploy` (на свежей БД ~10s, на больших миграциях дольше)
- Неправильный `.env` (e.g. `DATABASE_URL` не совпадает с paролем БД)
- mem_limit 768m выжат → OOM kill. Проверь:
  ```bash
  docker compose logs app | grep -i 'killed\|out of memory'
  ```
  Если OOM — поднять `mem_limit` в `docker-compose.yml` до `1g` и `docker compose up -d --no-deps app`.

### Healthcheck failing

```bash
docker compose exec app wget -qO- http://localhost:3000/api/health
```

Должен вернуть `{"status":"ok","db":"ok",...}`. Если `db:degraded` — проблема с подключением к Postgres (проверь `DATABASE_URL` в `.env` и `docker compose logs db`).

### Schema drift / failed migration

```bash
# Прогнать миграции вручную
docker compose exec app npx prisma migrate deploy

# В крайнем случае — push без миграции (только staging/dev!)
docker compose exec app npx prisma db push --accept-data-loss
```

### Disk full

```bash
df -h
du -sh /mnt/data/alteko/*
docker image prune -a -f
```

Бэкапы накапливаются в `/mnt/data/alteko/backups/`. Deploy-скрипт хранит последние 10, остальные удаляет — но если что-то пошло не так, можно почистить вручную:
```bash
ls -1t /mnt/data/alteko/backups/backup-*.sql.gz | tail -n +11 | xargs rm -f
```

### SSL certificate

Управляется Certbot, авто-renew через systemd timer.
```bash
sudo certbot renew --dry-run
sudo systemctl status certbot.timer
```

### Откат на предыдущую версию

```bash
ssh palpalych
cd /opt/alteko
# Подсмотри предыдущий тег
docker images ghcr.io/savin-igor/alteko --format '{{.Tag}}' | head -5
# Откат — отредактируй .env вручную, выставь IMAGE_TAG=<previous-version>, потом:
docker compose pull app
docker compose up -d --no-deps app
```

Лучшая практика: повторно запушить тег предыдущей версии — `git tag -d v0.1.1 && git push origin :v0.1.1` НЕ нужно; просто запушь старый тег ещё раз через `git push origin v0.1.0 --force` (Actions перепустит pipeline).

---

## Связанные issues

- #137 — server bootstrap (один раз на сервере)
- #138 — GitHub Secrets setup
- #139 — S3 / Resend / DNS provisioning
- #134 — `npm run build` локально и data/postgres EACCES
