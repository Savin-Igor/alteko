.PHONY: dev db-up db-down up down restart logs shell \
        migrate migrate-deploy studio \
        build check sync-vzd sync-bvkb deploy help

# ── Local development ─────────────────────────────────────────────────────────

## Start local DB in Docker + Next.js dev server on host (hot reload)
dev: db-up
	npm run dev

## Start only the local PostgreSQL container
db-up:
	docker compose -f docker-compose.db.yml up -d
	@echo "DB ready at localhost:5432"

## Stop the local PostgreSQL container
db-down:
	docker compose -f docker-compose.db.yml down

# ── Production (run on VPS or locally with production config) ─────────────────

## Start production stack (app + db) in background
up:
	mkdir -p data/postgres backups
	docker compose up -d

## Stop production stack (data is preserved — never use down -v)
down:
	docker compose down

## Restart only the app container (after pulling new image)
restart:
	docker compose up -d app

## Stream app logs
logs:
	docker compose logs -f app

## Open a shell in the running app container
shell:
	docker compose exec app sh

# ── Database ──────────────────────────────────────────────────────────────────

## Run prisma migrate dev (local, creates migration files)
migrate:
	npm run db:migrate

## Run prisma migrate deploy (production-safe, applies pending migrations)
migrate-deploy:
	npm run db:deploy

## Open Prisma Studio
studio:
	npm run db:studio

## Backup local DB to ./backups/
backup:
	@mkdir -p backups
	docker compose -f docker-compose.db.yml exec -T db \
	  pg_dump -U postgres alteko \
	  > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "Backup saved to backups/"

# ── Build ─────────────────────────────────────────────────────────────────────

## Run TypeScript type check + ESLint
check:
	npm run type-check && npm run lint

## Build production Docker image locally (tagged alteko:local)
build:
	docker build -t alteko:local .

# ── Data sync ─────────────────────────────────────────────────────────────────

## Sync VZD building data (requires VZD_DATA_URL in env)
sync-vzd:
	npm run sync:vzd

## Sync BVKB energy certificates (requires BVKB_DATA_URL in env)
sync-bvkb:
	npm run sync:bvkb

## Recompute all BenchmarkSegment percentiles from existing reports
seed-benchmarks:
	npm run seed:benchmarks

# ── Deploy ────────────────────────────────────────────────────────────────────

## SSH deploy: pull latest image and restart app on VPS
## Usage: make deploy DEPLOY_HOST=user@your-vps-ip
deploy:
	@test -n "$(DEPLOY_HOST)" || (echo "DEPLOY_HOST is not set. Usage: make deploy DEPLOY_HOST=user@host" && exit 1)
	ssh $(DEPLOY_HOST) 'cd /opt/alteko && \
	  docker compose pull app && \
	  docker compose up -d app && \
	  docker image prune -f'

# ── Help ──────────────────────────────────────────────────────────────────────

## Show this help
help:
	@echo ""
	@echo "ALTEKO — available make targets:"
	@echo ""
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## /  /'
	@echo ""
