.PHONY: \
  dev dev-setup dev-fresh \
  db-up db-down db-rebuild db-nuke \
  up down restart logs shell \
  migrate migrate-deploy push studio backup \
  build build-scripts \
  check clean clean-tmp \
  seed seed-buildings seed-series assign-series seed-benchmarks seed-blog \
  sync-buildings sync-vzd sync-bvkb sync-transactions \
  cron-weekly cron-monthly \
  release deploy help

DC       = docker compose -f docker-compose.db.yml
DC_PROD  = docker compose
RUN      = $(DC) run --rm scripts npx tsx   # for .ts scripts
EXEC     = $(DC) run --rm scripts            # for shell/prisma commands

##@ Development

dev: db-up ## Daily dev: DB + schema sync + Next.js dev server
	$(MAKE) push
	npm run dev

dev-setup: db-up build-scripts ## First-time setup: DB + schema + seed + dev server
	@echo "Waiting for DB to be healthy..."
	@$(DC) run --rm scripts sh -c "until pg_isready -h db -U postgres; do sleep 1; done"
	$(MAKE) push
	$(MAKE) seed
	npm run dev

dev-fresh: clean db-up ## Wipe .next cache, sync schema, start dev server
	$(MAKE) push
	npm run dev

clean: ## Remove Next.js build cache (.next/)
	rm -rf .next

clean-tmp: ## Remove temp files kept by KEEP_TEMP_FILES=true (./tmp/)
	rm -rf tmp/

##@ Database

db-up: ## Start local PostgreSQL container
	$(DC) up -d db

db-down: ## Stop local PostgreSQL container
	$(DC) down

db-rebuild: ## Rebuild scripts Docker image (after Dockerfile.scripts changes)
	$(DC) build scripts

db-nuke: ## Drop containers + delete local Postgres/MinIO named volumes (DESTRUCTIVE)
	$(DC) down -v
	@echo "Volumes alteko_postgres_data and alteko_minio_data removed."
	@echo "Run 'make dev-setup' to recreate the schema and seed."

push: ## Apply schema to local DB without migrations (dev only)
	$(EXEC) sh -c "npx prisma generate && npx prisma db push"

migrate: ## Run prisma migrate dev in container (interactive, creates migration files)
	$(EXEC) npx prisma migrate dev

migrate-deploy: ## Run prisma migrate deploy in container (production-safe)
	$(EXEC) npx prisma migrate deploy

studio: ## Open Prisma Studio
	npm run db:studio

backup: ## Backup local DB to ./backups/
	@mkdir -p backups
	$(DC) exec -T db \
	  pg_dump -U postgres alteko \
	  > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "Backup saved to backups/"

##@ Build

build: ## Build production Docker image (tagged alteko:local)
	docker build -t alteko:local .

build-scripts: ## Build the scripts runner Docker image
	$(DC) build scripts

check: ## Run TypeScript type check + ESLint
	npm run type-check && npm run lint

##@ Seeds

seed: seed-buildings seed-series ## Seed all: stub buildings + building series

seed-buildings: ## Seed stub buildings (development fixtures)
	$(RUN) prisma/seed.ts

seed-series: ## Seed building series reference data (103, 119, 467, etc.)
	$(RUN) prisma/seed-series.ts

assign-series: ## Assign Building.series using year + wallMaterial + floorCount heuristic
	$(RUN) scripts/assign-series.ts

seed-benchmarks: ## Recompute BenchmarkSegment percentiles from existing expense reports
	$(RUN) scripts/seed-benchmarks.ts

seed-blog: ## Seed blog posts from markdown files
	$(RUN) prisma/seed-blog.ts

##@ Data Sync

sync-buildings: ## Sync Building.ZIP: cadastralCodes, year, material, floors (~500k buildings)
	$(RUN) scripts/sync-buildings.ts

sync-vzd: ## Sync VZD building addresses from data.gov.lv (daily, ~100k rows)
	$(RUN) scripts/sync-vzd.ts

sync-bvkb: ## Sync BVKB energy certificates from data.gov.lv (daily)
	$(RUN) scripts/sync-bvkb.ts

sync-transactions: ## Sync apartment transaction prices from data.gov.lv (monthly, ~200MB)
	$(RUN) scripts/sync-transactions.ts

##@ Cron Simulation

cron-weekly: db-up ## Simulate weekly cron (Mon 03:00 UTC): buildings → vzd → bvkb
	@echo "==> sync-buildings"
	$(MAKE) sync-buildings
	@echo "==> sync-vzd"
	$(MAKE) sync-vzd
	@echo "==> sync-bvkb"
	$(MAKE) sync-bvkb

cron-monthly: db-up ## Simulate monthly cron (12th 04:00 UTC): transaction prices
	@echo "==> sync-transactions"
	$(MAKE) sync-transactions

##@ Production

up: ## Start production stack (app + db) in background
	mkdir -p data/postgres backups
	$(DC_PROD) up -d

down: ## Stop production stack (data preserved)
	$(DC_PROD) down

restart: ## Restart only the app container
	$(DC_PROD) up -d app

logs: ## Stream app logs
	$(DC_PROD) logs -f app

shell: ## Open a shell in the running app container
	$(DC_PROD) exec app sh

release: ## Cut a tag-driven release: make release v=0.1.0 (triggers GitHub Actions deploy)
	@test -n "$(v)" || (echo "Usage: make release v=0.1.0" && exit 1)
	@echo "$(v)" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9.]+)?$$' \
	  || (echo "v must be semver like 0.1.0 or 0.1.0-rc.1" && exit 1)
	@echo "Tagging v$(v)..."
	git tag -a v$(v) -m "Release v$(v)"
	@echo "Pushing tag — GitHub Actions deploy.yml will fire."
	git push origin v$(v)

deploy: ## Manual SSH deploy of latest image (skips CI). Use only for hotfix.  [DEPLOY_HOST=user@host]
	@test -n "$(DEPLOY_HOST)" || (echo "DEPLOY_HOST not set. Usage: make deploy DEPLOY_HOST=user@host" && exit 1)
	ssh $(DEPLOY_HOST) 'cd /opt/alteko && \
	  docker compose pull app && \
	  docker compose up -d --no-deps app && \
	  docker image prune -f'

##@ Help

help: ## Show available targets
	@awk ' \
	  BEGIN { FS = ":.*##"; printf "\n\033[1mALTEKO — make targets\033[0m\n" } \
	  /^##@/ { printf "\n\033[1;33m%s\033[0m\n", substr($$0, 5) } \
	  /^[a-zA-Z0-9_-]+:.*?##/ { printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2 } \
	  END { printf "\n" } \
	' $(MAKEFILE_LIST)
