.PHONY: \
  dev dev-setup \
  db-up db-down db-rebuild \
  up down restart logs shell \
  migrate migrate-deploy push studio backup \
  build build-scripts \
  check \
  seed seed-series seed-benchmarks seed-blog \
  sync-buildings sync-vzd sync-bvkb sync-transactions \
  cron-weekly cron-monthly \
  deploy help

# ── Shortcuts ─────────────────────────────────────────────────────────────────

DC       = docker compose -f docker-compose.db.yml
DC_PROD  = docker compose
RUN      = $(DC) run --rm scripts npx tsx

# ── Local development ─────────────────────────────────────────────────────────

## First-time setup: DB + schema push + seed + dev server
dev-setup: db-up build-scripts
	@echo "Waiting for DB to be healthy..."
	@$(DC) run --rm scripts sh -c "until pg_isready -h db -U postgres; do sleep 1; done"
	$(MAKE) push
	$(MAKE) seed
	npm run dev

## Start local DB + Next.js dev server on host (hot reload)
dev: db-up
	npm run dev

## Start only the local PostgreSQL container
db-up:
	$(DC) up -d db

## Stop the local PostgreSQL container
db-down:
	$(DC) down

## Rebuild the scripts Docker image (run after Dockerfile.scripts changes)
db-rebuild:
	$(DC) build scripts

# ── Build ─────────────────────────────────────────────────────────────────────

## Run TypeScript type check + ESLint
check:
	npm run type-check && npm run lint

## Build production Docker image (tagged alteko:local)
build:
	docker build -t alteko:local .

## Build the scripts runner image
build-scripts:
	$(DC) build scripts

# ── Database ──────────────────────────────────────────────────────────────────

## Apply schema to local DB without migrations (dev only)
push:
	$(RUN) sh -c "npx prisma generate && npx prisma db push"

## Run prisma migrate deploy inside scripts container (production-safe)
migrate-deploy:
	$(RUN) npx prisma migrate deploy

## Run prisma migrate dev on host (interactive — creates migration files)
migrate:
	npm run db:migrate

## Open Prisma Studio (host)
studio:
	npm run db:studio

## Backup local DB to ./backups/
backup:
	@mkdir -p backups
	$(DC) exec -T db \
	  pg_dump -U postgres alteko \
	  > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "Backup saved to backups/"

# ── Seeds ─────────────────────────────────────────────────────────────────────

## Seed all: stub buildings + building series
seed: seed-buildings seed-series

## Seed stub buildings (development fixtures)
seed-buildings:
	$(RUN) prisma/seed.ts

## Seed building series reference data (103, 119, 467, etc.)
seed-series:
	$(RUN) prisma/seed-series.ts

## Recompute BenchmarkSegment percentiles from existing expense reports
seed-benchmarks:
	$(RUN) scripts/seed-benchmarks.ts

## Seed blog posts from markdown files
seed-blog:
	$(RUN) prisma/seed-blog.ts

# ── Data sync ─────────────────────────────────────────────────────────────────
# All sync scripts run inside the scripts Docker container.
# Env vars (VZD_DATA_URL, BVKB_DATA_URL, VZD_TRANSACTIONS_URL) are read from .env.local.

## Sync Building.ZIP: real cadastralCodes, year, material, floors (~500k buildings)
## Run before sync-vzd and sync-bvkb — sets real cadastralCode, enabling BVKB matching
sync-buildings:
	$(RUN) scripts/sync-buildings.ts

## Sync VAR building addresses from data.gov.lv (daily dataset, ~100k rows)
sync-vzd:
	$(RUN) scripts/sync-vzd.ts

## Sync BVKB energy certificates from data.gov.lv (daily dataset)
sync-bvkb:
	$(RUN) scripts/sync-bvkb.ts

## Sync apartment transaction prices from data.gov.lv (monthly, 2016–present, ~200MB)
sync-transactions:
	$(RUN) scripts/sync-transactions.ts

# ── Cron simulation ───────────────────────────────────────────────────────────
# Mirrors the schedule in .github/workflows/sync-data.yml.
# Run these locally to test the full sync pipeline before it fires in CI.

## Simulate weekly cron (Mon 03:00 UTC): buildings → addresses → energy certs
## Order matters: sync-buildings sets real cadastralCodes before sync-bvkb tries to match them
cron-weekly: db-up
	@echo "==> [cron-weekly] sync-buildings"
	$(MAKE) sync-buildings
	@echo "==> [cron-weekly] sync-vzd"
	$(MAKE) sync-vzd
	@echo "==> [cron-weekly] sync-bvkb"
	$(MAKE) sync-bvkb
	@echo "==> [cron-weekly] done"

## Simulate monthly cron (12th 04:00 UTC): apartment transaction prices
cron-monthly: db-up
	@echo "==> [cron-monthly] sync-transactions"
	$(MAKE) sync-transactions
	@echo "==> [cron-monthly] done"

# ── Production stack ──────────────────────────────────────────────────────────

## Start production stack (app + db) in background
up:
	mkdir -p data/postgres backups
	$(DC_PROD) up -d

## Stop production stack (data preserved — never use down -v)
down:
	$(DC_PROD) down

## Restart only the app container
restart:
	$(DC_PROD) up -d app

## Stream app logs
logs:
	$(DC_PROD) logs -f app

## Open a shell in the running app container
shell:
	$(DC_PROD) exec app sh

## SSH deploy: pull latest image and restart app on VPS
## Usage: make deploy DEPLOY_HOST=user@your-vps-ip
deploy:
	@test -n "$(DEPLOY_HOST)" || (echo "DEPLOY_HOST not set. Usage: make deploy DEPLOY_HOST=user@host" && exit 1)
	ssh $(DEPLOY_HOST) 'cd /opt/alteko && \
	  docker compose pull app && \
	  docker compose up -d app && \
	  docker image prune -f'

# ── Help ──────────────────────────────────────────────────────────────────────

## Show available targets
help:
	@echo ""
	@echo "ALTEKO — make targets:"
	@echo ""
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## /  /'
	@echo ""
