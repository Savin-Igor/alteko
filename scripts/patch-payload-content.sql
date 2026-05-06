-- Patch Payload blog post content: apply fact-check corrections
-- Run: docker exec alteko-db-1 psql -U postgres -d alteko -f /scripts/patch-payload-content.sql
-- All changes: replacing unverified stats with labeled/corrected versions

BEGIN;

-- ─── ID 97: norma-tepla RU ────────────────────────────────────────────────────

-- ITP savings: add "(отраслевая оценка)"
UPDATE payload.blog_posts_locales
SET content = replace(
  content::text,
  ' ИТП экономит 15–25% по сравнению с централизованным регулированием.',
  ' ИТП экономит 15–25% по сравнению с централизованным регулированием (отраслевая оценка).'
)::jsonb
WHERE id = 97;

-- Subsidy: "до 49%" → "до 50% (стандартно 40%, до 50% для отдельных условий)"
UPDATE payload.blog_posts_locales
SET content = replace(
  content::text,
  'Государство покрывает до 49% затрат.',
  'Государство покрывает до 50% затрат (стандартно 40%, до 50% для отдельных условий — altum.lv).'
)::jsonb
WHERE id = 97;

-- ─── ID 93: zhizn-do-posle RU ─────────────────────────────────────────────────

-- Section header: "−60%" → "~62%"
UPDATE payload.blog_posts_locales
SET content = replace(
  content::text,
  'Данные по 624 домам: −60% на отоплении',
  'Данные по 624 домам: в среднем ~62% экономии тепла'
)::jsonb
WHERE id = 93;

-- Source date fix
UPDATE payload.blog_posts_locales
SET content = replace(
  content::text,
  'fi-compass.eu — ALTUM: Energy Efficiency for Apartment Buildings (декабрь 2024)',
  'fi-compass.eu — ALTUM: Energy Efficiency for Apartment Buildings (ноябрь 2024)'
)::jsonb
WHERE id = 93;

-- CO₂ figure: 24 000 → 24 403
UPDATE payload.blog_posts_locales
SET content = replace(
  content::text,
  '24 000 тонн CO₂',
  '24 403 тонны CO₂'
)::jsonb
WHERE id = 93;

-- Average reduction in body text
UPDATE payload.blog_posts_locales
SET content = replace(
  content::text,
  'снижение теплопотребления в среднем на 60%',
  'снижение теплопотребления в среднем на ~62%'
)::jsonb
WHERE id = 93;

UPDATE payload.blog_posts_locales
SET content = replace(
  content::text,
  'снижение теплопотребления на 50–60%',
  'снижение теплопотребления на ~62% в среднем'
)::jsonb
WHERE id = 93;

-- ─── ID 99: altum-subsidiya RU ────────────────────────────────────────────────

-- Body: "до 49% затрат" → corrected
UPDATE payload.blog_posts_locales
SET content = replace(
  content::text,
  'субсидирует до 49% затрат на реновацию. Это не кредит — деньги не нужно возвращать.',
  'субсидирует до 50% затрат на реновацию (стандартно 40%, до 50% для отдельных условий — altum.lv). Это не кредит — деньги не нужно возвращать.'
)::jsonb
WHERE id = 99;

-- ─── ID 58: seriya-119 RU ─────────────────────────────────────────────────────

-- "до 15% тепла" → qualitative
UPDATE payload.blog_posts_locales
SET content = replace(
  content::text,
  'Через них уходит до 15% тепла.',
  'Через них уходит значительная часть тепла.'
)::jsonb
WHERE id = 58;

-- ─── ID 87: kak-stroilis RU ───────────────────────────────────────────────────

-- 12 working days: add historical attribution
UPDATE payload.blog_posts_locales
SET content = replace(
  content::text,
  'за 12 рабочих дней при трёхсменной работе. Это не легенда — это была реальная технологическая система.',
  'за 12 рабочих дней при трёхсменной работе (по архивным данным того периода). Это была реальная технологическая система.'
)::jsonb
WHERE id = 87;

-- ─── ID 91: pochemu-9-etazhey RU ──────────────────────────────────────────────

-- Fire ladder: add attribution
UPDATE payload.blog_posts_locales
SET content = replace(
  content::text,
  'Стандартная советская выдвижная пожарная лестница могла дотянуться до высоты примерно 28 метров — это ровно 9-й этаж ста',
  'По советским нормам пожарной безопасности того времени, стандартная выдвижная пожарная лестница достигала примерно 28 метров — это ровно 9-й этаж ста'
)::jsonb
WHERE id = 91;

-- ─── ID 102: zimnyaya RU ──────────────────────────────────────────────────────

-- Panel joints: remove "до 15%"
UPDATE payload.blog_posts_locales
SET content = replace(
  content::text,
  '— микротрещины, через которые уходит до 15% общих теплопотерь. Промерзают первыми.',
  '— со временем теряют герметичность и становятся существенным источником теплопотерь. Промерзают первыми.'
)::jsonb
WHERE id = 102;

-- Also fix R-value claims if present
UPDATE payload.blog_posts_locales
SET content = replace(
  content::text,
  'Теплосопротивление R ≈ 0.7 м²·К/Вт против норматива R ≥ 2.0.',
  'Значительно хуже утеплены, чем требуют современные нормы.'
)::jsonb
WHERE id = 102;

COMMIT;

-- Verify key changes
SELECT id,
  CASE WHEN content::text LIKE '%отраслевая оценка%' THEN '✓' ELSE '✗' END as itp_labeled,
  CASE WHEN content::text LIKE '%50% для отдельных%' THEN '✓' ELSE '✗' END as subsidy_fixed
FROM payload.blog_posts_locales WHERE id IN (97, 99);

SELECT id,
  CASE WHEN content::text LIKE '%62% экономии%' THEN '✓' ELSE '✗' END as reduction_fixed,
  CASE WHEN content::text LIKE '%24 403%' THEN '✓' ELSE '✗' END as co2_fixed
FROM payload.blog_posts_locales WHERE id = 93;
