## Goal
Execute all actionable GitHub issues before public launch of alteko.lv.

## Context
Issues #122, #129, #139, #152, #153, #154 are open. Most are infrastructure/operational readiness.
Working in worktree feat/issues-batch-may2026.

## Steps

### Step 1: Docker/Infrastructure (#152 + #154 item 1)
- [ ] docker-compose.yml: Add HOSTNAME=0.0.0.0 to app service env
- [ ] docker-compose.yml: Add minio service (internal port 127.0.0.1:3021:9000)
- [ ] docker-compose.yml: Add minio-init one-shot job (mc mb buckets)
- [ ] deploy.yml: Add S3_* defaults pointing to minio:9000 in .env generation
- [ ] .env.example: Update production S3 comments to reflect MinIO-on-VPS approach
- [ ] docs/technical/adr/0001-s3-provider.md: Status → Superseded by ADR-0002
- [ ] docs/technical/adr/0002-s3-provider-revised.md: Create ADR
- [ ] docs/DEPLOY.md: Add MinIO provisioning section

### Step 2: Security headers (#154 item 7)
- [ ] next.config.mjs: Add headers() with X-Frame-Options, X-Content-Type-Options,
      Referrer-Policy, Permissions-Policy

### Step 3: Rate limiting (#154 item 8)
- [ ] src/lib/rate-limit.ts: Simple in-memory token bucket (no external deps)
- [ ] Apply to /api/audit/*, /api/buildings/*, /api/address/* routes via middleware

### Step 4: Cookie consent (#154 item 5)
- [ ] src/components/cookie-consent.tsx: Lightweight banner component
- [ ] src/app/layout.tsx (or [locale]/layout): Add CookieConsent component

### Step 5: Sync cron (#154 item 4)
- [ ] .github/workflows/sync-data.yml: Add cron schedule + SSH-based execution
      (appleboy/ssh-action to run docker compose exec app npx tsx scripts/...)

### Step 6: E2E smoke test (#154 item 12)
- [ ] .github/workflows/deploy.yml: Add smoke-test step after health probe
      (curl checks for key public pages)

### Step 7: Code quality (#154 item 11)
- [ ] package.json: Add engines: { node: ">=22 <23", npm: ">=10 <12" }

### Step 8: Sentry (#154 item 6)
- [ ] npm install @sentry/nextjs
- [ ] Create sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts
- [ ] Create instrumentation.ts with Sentry.init (no-op if SENTRY_DSN is not set)
- [ ] Add SENTRY_DSN to .env.example + deploy.yml

## Risks
- MinIO on VPS: +~256 MB RAM. VPS has 4 GB, total ~2-2.5 GB after all services. Acceptable.
- Sentry: new package. Keep graceful: disabled if SENTRY_DSN is absent.
- Rate limiting: in-memory, lost on restart. Acceptable for single-container deploy.
- Cookie consent: must not block page load (async). No analytics injected yet.

## Not in scope (human action required)
- #122 SIA registration
- #153 real API keys (OPENAI, Resend)
- #139 Resend domain verify + DKIM/DMARC DNS
- #154 item 3 off-site DB backup (Backblaze B2 setup)
- #154 items 9,10 GSC + DKIM
