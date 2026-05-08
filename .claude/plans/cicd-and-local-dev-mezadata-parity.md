# CI/CD and Local Dev — MezaData Parity

## Goal

Bring ALTEKO's CI/CD and local-dev setup to parity with the MezaData project so
both deploy to the same Hetzner VPS (89.167.4.195) under `/opt/<project>/` with
data on `/mnt/data/<project>/`. Eliminate port collisions, switch to safer
tag-driven deploys, fix the `data/postgres` bind-mount problem (issue #134),
and add resource limits suitable for the 4 GB RAM shared server.

## Context

MezaData is the reference. It uses:
- Hetzner Cloud CX22 (2 vCPU / 4 GB RAM / 40 GB system + 20 GB Volume).
- `/opt/<project>/` on system disk for compose + .env.
- `/mnt/data/<project>/` on the Hetzner Volume for persistent state.
- Host nginx + Certbot SSL → `localhost:<port>` → app container :3000.
- GHCR for image registry.
- `appleboy/ssh-action` for deploy.
- Tag-driven deploy (`v*`) — push to main runs CI only.
- Per-project Postgres container (data isolation).
- `.env` rewritten on the server from GitHub Secrets each deploy.

ALTEKO already has the skeleton (Dockerfile, docker-compose.yml,
docker-compose.db.yml, ci.yml, deploy.yml, sync-data.yml) but several
divergences create real risks on a shared server.

User decisions (confirmed):
- Host port: `3020:3000`
- Deploy trigger: `git tag v*` only (push:main = CI only)
- DB volume: `/mnt/data/alteko/postgres`
- S3 in prod: deferred (placeholder MinIO/local until decision)
- SMTP in prod: Resend (`RESEND_API_KEY` secret, domain alteko.lv)
- Domain: `alteko.lv`
- Resource limits: app 768 MB, db 512 MB

## Steps

### 1. Production compose (`docker-compose.yml`)

- Image already from GHCR ✓.
- Change port mapping: `3000:3000` → `3020:3000`.
- Replace `./data/postgres` bind mount with `/mnt/data/alteko/postgres:/var/lib/postgresql/data`.
- Add `mem_limit: 768m` on app, `mem_limit: 512m` on db.
- Switch healthcheck to `wget -qO- http://localhost:3000/api/health` (DB-aware).
- Use `env_file: .env` (not `.env.production` — MezaData uses `.env`; consistent
  with the deploy script overwriting `.env`).
- Add `cpus: 1.0` on app to bound the worst case.
- Keep db healthcheck `pg_isready`.
- Add `init: true` for clean signal handling.

### 2. Local dev compose

Rename `docker-compose.db.yml` → keep the name (don't break existing aliases),
but add a comment header making clear that this is the *local dev* file, and
leave the `docker-compose.yml` strictly for production. Document the mapping
in CLAUDE.md and docs/technical/local-development.md.

Local-dev MinIO and Mailhog stay on the same ports (9100/9101/1025/8025) — no
collision with MezaData's local dev (different machine).

### 3. CI workflow (`.github/workflows/ci.yml`)

Mostly already correct. Minor improvements:
- Add `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }`
  to drop in-flight runs when a new commit lands.
- Run on `push: [main]` and `pull_request: [main]` (already does).

### 4. Deploy workflow (`.github/workflows/deploy.yml`) — major rework

Switch trigger:
```yaml
on:
  push:
    tags: ['v*']
  workflow_dispatch:
```

Adopt the MezaData two-job structure:
1. `build` job → docker buildx → push to GHCR with semver + sha + latest tags.
   Outputs `image_full` for the deploy job.
2. `deploy` job → ssh-action with the same secret naming as MezaData
   (`HETZNER_HOST`, `HETZNER_USER`, `HETZNER_SSH_KEY`) — currently ALTEKO has
   `DEPLOY_HOST`/`DEPLOY_USER`/`DEPLOY_SSH_KEY`.

Deploy script:
- `cd /opt/alteko`
- Write `.env` from secrets (atomic, `chmod 600`).
- `docker login ghcr.io` with `GITHUB_TOKEN` for private image pull.
- `mkdir -p /mnt/data/alteko/{postgres,backups}`.
- DB pre-deploy backup with rotation: keep last 10 dumps, gzip.
- `docker compose pull app`.
- `docker compose up -d --no-deps --remove-orphans app`.
- Wait for `/api/health` to return 200 (max 60s).
- On failure: print `docker compose logs app --tail 100` and exit 1 (no
  auto-rollback, but at least visible in CI logs).
- `docker image prune -f`.

### 5. Data sync workflow (`sync-data.yml`)

Already uses scheduled cron + workflow_dispatch. Two issues:
- It connects to `${{ secrets.DATABASE_URL }}` which would need to be
  publicly reachable from GitHub runners. Currently the prod Postgres is
  internal-only — the sync workflow can NOT actually reach it.
- Either expose Postgres on a non-standard port with strong creds, or
  refactor sync jobs to run *on the server* via SSH-triggered command.

For now: keep workflow as-is, mark it `if: false` placeholder OR add
`workflow_dispatch` only and remove the cron until a decision. Do NOT
delete — the sync logic itself is correct.

### 6. GitHub Secrets to define

| Secret | Source |
|---|---|
| `HETZNER_HOST` | Same as MezaData (`89.167.4.195`) |
| `HETZNER_USER` | Same SSH user (`root`) |
| `HETZNER_SSH_KEY` | Same private key — server key already authorised |
| `POSTGRES_PASSWORD` | Strong password for ALTEKO Postgres (different from MezaData) |
| `NEXTAUTH_SECRET` | `openssl rand -hex 32` |
| `OPENAI_API_KEY` | Real OpenAI key |
| `RESEND_API_KEY` | Real Resend key (verify alteko.lv domain there) |
| `JANA_SETA_API_KEY` | When key is granted |
| `S3_*` | Placeholder until S3 decision |

Telling the user to set these via `gh secret set ...` — not committing them.

### 7. Server-side bootstrap (one-off, manual)

Document in `docs/DEPLOY.md` (new file modeled on MezaData's):

```bash
ssh palpalych
mkdir -p /opt/alteko /mnt/data/alteko/{postgres,backups,uploads}
chown -R 70:70 /mnt/data/alteko/postgres   # postgres uid in alpine image
chown -R 1001:1001 /mnt/data/alteko/uploads  # nextjs uid in our image

# Place compose file
scp ./docker-compose.yml palpalych:/opt/alteko/docker-compose.yml

# nginx vhost
sudo tee /etc/nginx/sites-available/alteko.lv <<'EOF'
server {
  listen 80;
  server_name alteko.lv www.alteko.lv;
  location / {
    proxy_pass http://127.0.0.1:3020;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 60s;
  }
}
EOF
sudo ln -s /etc/nginx/sites-available/alteko.lv /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d alteko.lv -d www.alteko.lv
```

### 8. Healthcheck endpoint

Already added in commit 94a8125. Compose healthcheck switches to use it.

### 9. .dockerignore — update

Already added in commit 362bb31. Verify it covers all paths.

### 10. Documentation

New file: `docs/DEPLOY.md` mirroring MezaData's structure but with ALTEKO
specifics: port, paths, domain, secrets, server commands, troubleshooting.

Update `docs/technical/local-development.md` — already updated for build
EACCES. Add note about port 3020 prod vs 3000 dev.

Add note to CLAUDE.md about deploy trigger and port allocation.

## Risks

1. **Server-side state already exists.** If anything is already on `/opt/alteko`
   from a manual previous attempt, the bootstrap may overwrite. Check before
   running.
2. **Port 3020 not in nginx vhost yet.** The reverse proxy must be configured
   before the first deploy or the app will be unreachable from the internet.
   This is a manual step on the server, not in code.
3. **DATABASE_URL hostname.** Inside the docker network, app reaches db via
   service name `db`. The CI uses `localhost`. Both must work — dev keeps
   `localhost:5433`, prod uses `db:5432`. The deploy script writes the prod
   URL from POSTGRES_PASSWORD.
4. **Postgres data dir uid 70.** Hetzner Volume mounted with default fs perms
   may need an explicit chown before first start. Document.
5. **First deploy will run prisma migrate deploy on an empty DB.** Migrations
   exist in `prisma/migrations/`. If they fail, the app crash-loops. Test
   migrations locally first via `make migrate-deploy`.
6. **Resource limits on a running app.** Setting `mem_limit: 768m` may OOM
   Next.js during initial SSR if the app loads large blog content. Watch
   memory after first deploy; raise to 1g if 502s appear.
7. **Sync-data workflow.** Currently broken vs production network. Marked for
   refactor in step 5.
8. **Secret rotation.** `gh secret set` commands need the user to run them —
   I won't have the actual values.

## Verification (after implementation, before push)

- `npm run type-check` → 0
- `npm run lint` → 0
- `docker compose -f docker-compose.yml config` → no errors (validates compose)
- `docker compose -f docker-compose.db.yml config` → no errors
- Inspect generated workflows via `actionlint` if available, otherwise visual
  review.
- Local `make dev` still works.
- New `docs/DEPLOY.md` reads correctly.

## Out of scope (future tasks)

- Real S3 (Hetzner Object Storage onboarding).
- Real Resend domain verification.
- Cron-driven sync-data (refactor to run on server via SSH).
- Auto-rollback on failed health probe.
- Staging environment / multi-env (current plan is prod-only).
- Slack/Telegram notify on deploy.
