---
name: VZD open data sources added to data-sources.md
description: Six new VZD/CSP datasets added 2026-05-02; all tagged [НЕ ВЕРИФИЦИРОВАНО] pending field-level verification
type: project
---

Six new datasets added to `docs/reference/data-sources.md` in a new section "Открытые данные о сделках и кадастровых стоимостях", inserted between "Платные провайдеры данных" and "Пользовательские данные":

1. NITIS — VZD real-estate transaction DB (CC-BY-4.0, monthly, 1M+ records from 2012)
2. Darījumi ar telpu grupām — apartment-level transactions (VZD, CC-BY-4.0, monthly, from 2016)
3. PremiseGroup.ZIP — apartment characteristics in same ZIP as Building.ZIP (VZD, weekly, XML)
4. Кадастровые стоимости 2025 — fiscal + universal cadastral values per unit (VZD, annual, Jan 1)
5. Зоны кадастровых стоимостей — spatial value zones as Shapefile (VZD, CC-BY, irregular)
6. Индексы цен CSP — house price index + construction cost index (CSP API, stat.gov.lv)

**Why:** Needed for price benchmarking (audit module) — median €/m² by district/series/year — and for "official vs. market value" comparison feature.

**How to apply:** All six datasets are marked [НЕ ВЕРИФИЦИРОВАНО] — field coverage and data quality must be verified before building ETL pipelines. Priority table updated: NITIS/Darījumi/PremiseGroup = Высокий; Cadastral values/Zoning SHP/CSP API = Средний.

Key entries also added to `docs/reference/key-facts.md` under new section "Данные VZD — открытые наборы (сделки и стоимости)".
