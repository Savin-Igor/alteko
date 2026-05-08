# Plan — Valdes režīms dashboard (#124)

## Goal

Turn the existing thin `/dashboard` page (just lists buildings + heating trend) into a proper Valdes (Board) workspace that shows everything a board member needs to drive readiness work — Readiness Score, document checklist, decision campaigns, financing snapshot, owner-list staleness, and the canonical "next best action" CTA.

This is the AC closer for #124 and the foundation for the €30–100/mo Valdes subscription product.

## Context

- `/dashboard/page.tsx` already exists, gated for `ASSOCIATION_ADMIN` and `PLATFORM_ADMIN` (issue #124 says it must also accept `BOARD_MEMBER`).
- Schema is fully ready — `BuildingReadinessScore`, `BuildingDocument` (+ `BuildingDocumentType` enum with 8 types), `DecisionCampaign`, `FinancingScenario`, plus the `ownerListUpdatedAt`/`ownerListCount` fields on `Building`.
- `GET /api/decisions/[buildingId]` (campaigns by building) and `GET /api/decisions/templates` already exist.
- `src/lib/s3.ts` has `uploadFile`, `buildDocumentKey`, presigned download — wired against the same S3 env that already powers PDF audit upload.
- `auth()` from `@/auth` already returns the session and roles.

## Steps

### 1. Building selection model

The dashboard needs to know "what is my building". There is no dedicated membership model, so resolve via:

1. `Apartment.ownerId == user.id` → buildings the user owns an apartment in.
2. As a fallback: buildings the user has uploaded reports for (current behaviour).

Pick the most recently active one as the active building. If the user has more than one, render a small dropdown switcher at the top — selected building goes through `?building=<cadastralCode>`.

If neither relation yields a building, redirect to `/` with a friendly empty-state message (rare — board members should have apartments).

### 2. Auth update

`src/app/[locale]/dashboard/page.tsx` — extend the role check to allow `BOARD_MEMBER` alongside `ASSOCIATION_ADMIN` and `PLATFORM_ADMIN`. Keep `OWNER` and `PROFESSIONAL` redirected away (PROFESSIONAL gets its own dashboard later, #129).

### 3. Page layout

Replace the current building-list view with a single-building dashboard composed of these sections in order:

```
[ NextBestActionBanner ]      ← prominent CTA at the top
[ ReadinessOverview     ]      ← score + 8 component cards
[ DocumentChecklist     ]      ← 8 BuildingDocumentType rows
[ CampaignList          ]      ← DecisionCampaign rows + "new" CTA
[ FinancingMini         ]      ← 5 scenarios, status badges, link to /financing
[ OwnerListStatus       ]      ← staleness banner + "upload CSV"
```

Keep the existing tab nav (My buildings / Projects / Voting) but make "My buildings" the new dashboard.

### 4. New components (`src/components/dashboard/`)

- `BuildingSwitcher.tsx` — header dropdown when user has >1 building.
- `NextBestActionBanner.tsx` — reads `readinessScore.nextBestAction` (LV) / `nextBestActionRu` (RU).
- `ReadinessOverview.tsx` — composite score + grid of 8 component scores with color status.
- `DocumentChecklist.tsx` — 8 rows; each row shows `BuildingDocumentType`, status (uploaded / missing / expired), expiry, "Upload" button → `<DocumentUploadModal />`.
- `DocumentUploadModal.tsx` — multipart form: file (PDF/JPG/PNG, ≤25 MB), optional expiry date. Posts to new endpoint.
- `CampaignList.tsx` — campaigns grouped by status (DRAFT, ACTIVE, COMPLETED). Empty state with templates dropdown linking to creation flow.
- `FinancingMini.tsx` — compact 5-row table with `windowStatus` badge + monthly payment estimate. Links to `/financing` for full breakdown.
- `OwnerListStatus.tsx` — last-updated date + count + staleness warning if `ownerListUpdatedAt < now - 6 months` or null. CTA hits `/api/voting/owners-upload` (existing).

### 5. New API endpoint

`POST /api/buildings/[cadastralCode]/documents` — multipart form, `BuildingDocumentType` + file + optional expiry date. Auth: BOARD_MEMBER / ASSOCIATION_ADMIN / PLATFORM_ADMIN. Stores file in S3 via existing `uploadFile()` + `buildDocumentKey()`, upserts into `BuildingDocument` (unique `[buildingId, documentType]` already enforced).

`GET /api/buildings/[cadastralCode]/documents` — list current documents per building (board roles only). Returns presigned download URLs for already-uploaded files.

### 6. Translations

Extend `src/messages/lv.json` and `ru.json` under the existing `dashboard` namespace:

```
dashboard.valdes.title
dashboard.valdes.nextBestActionLabel
dashboard.valdes.readinessTitle
dashboard.valdes.documentTypes.{ENERGY_CERTIFICATE...} (8 keys)
dashboard.valdes.documentStatus.{uploaded,missing,expired}
dashboard.valdes.campaigns.{title,emptyState,newCampaign}
dashboard.valdes.financing.title
dashboard.valdes.ownerList.{title,stale,upToDate,uploadCta}
```

### 7. Tests

- Unit test for the building-resolution helper (`getActiveBuilding(userId, requestedCadastralCode?)`).
- API test for `/api/buildings/[cadastralCode]/documents` POST — auth, file size, content-type, S3 mock.
- Snapshot/prop tests for each new component using existing test setup.

## Risks

- **No formal board membership model.** The owner-of-apartment heuristic doesn't cover board members who don't own an apartment in this building. Document this limitation; future fix is a `BuildingMember` model.
- **S3 in production is still on placeholder secrets** (#139). Document upload feature will be visually present but break at runtime until S3 secrets are real. Show a graceful error in that case.
- **Existing `/dashboard` is a multi-building list.** Removing it loses the trend chart that exists today; users with multiple buildings need the switcher to compensate. Mitigation: switcher visible if `buildings.length > 1`.
- **`BuildingDocument` upserts on `(buildingId, documentType)`** — replacing an old upload deletes the old S3 key. Need to delete old key on upsert to avoid orphans.

## Out of scope (this issue)

- Full project / tender / voting campaign management UI — they have their own pages already.
- Building member/role formalization — separate schema PR.
- Document expiry-cron / reminders — schedule task, separate issue.
- File preview UI inside the dashboard — link to presigned download is enough for v1.
