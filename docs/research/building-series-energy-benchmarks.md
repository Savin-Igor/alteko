# Building Series Energy Consumption Benchmarks

Soviet-era apartment buildings in Latvia. Data for benchmark comparisons in the audit module.

---

## Heating Consumption by Series (kWh/m²/year)

| Series | Floors | Era | Before renovation | After renovation | Source | Year |
|--------|--------|-----|-------------------|------------------|--------|------|
| 316 / 318 (Khrushchevka) | 5 | 1958–1965 | 132.5 | 54.0 | [1] | 2023 |
| 103 | 9 | 1965–1980 | 128.6 | 53.1 | [1] | 2023 |
| 602 | 6–9 | 1975–1990 | 117.0 | 50.1 | [1] | 2023 |
| 467 | 9 | 1973–1988 | 113.1 | 52.0 | [1] | 2023 |
| 104 | 5–9 | 1960–1975 | 107.6 | 50.5 | [1] | 2023 |
| National average (Latvia, all multi-family) | — | 1955–1990 | 104.4 | — | [2] | 2017 |
| ALTUM portfolio average (627 buildings) | — | — | 128.4 | 54.0 | [1] | 2023 |

**Notes:**
- ALTUM portfolio data is skewed toward less efficient buildings (those that applied for renovation grants)
- 75% of ALTUM buildings had 100–160 kWh/m²/year before renovation [3]
- 90% reached 40–70 kWh/m²/year after renovation [3]
- Series 119: **no heating data found** — structural safety only (declared safe, lifespan 70 years) [16]

---

## Hot Water Consumption

| Metric | Value | Source | Year |
|--------|-------|--------|------|
| National average DHW (Latvia, all multi-family) | 73.3 kWh/m²/year | [2] | 2017 |
| DHW share of total household consumption | 19% | [8] | 2023 |
| Space heating share | 65% | [8] | 2023 |

---

## Wall U-Values by Series (W/m²K)

| Series | Wall type | U-value | Windows |
|--------|-----------|---------|---------|
| 103 | Aerated concrete | 0.89 | 2.56 |
| 103 | Brick | 1.27 | 2.56 |
| 318 | Brick | 1.25–1.32 | 2.56 |
| 464 / 467 | Expanded clay | 1.48 | 2.56 |
| 602 | Expanded clay | 1.48 | 2.56 |
| Current Latvian code | — | ~0.42 | — |

Current code is ~3.5× better than Soviet-era construction. This is the root cause of high heating costs.

---

## Heating Cost Ranking by Series (Riga, EUR/m²/month)

| Series | EUR/m²/month | Rank |
|--------|-------------|------|
| 316 / 318 (Khrushchevka) | 1.869 | 1 — worst |
| Pre-war buildings | 1.728 | 2 |
| 602 | 1.579 | 3 |
| 103 | 1.417 | 4 |
| 464 (Lithuanian) | 1.348 | 5 |
| New construction (2009–2022) | 0.515 | 6 — best |

Source: tvnet.lv analysis of Selectum Home data [7]

---

## Energy Performance Classes (Latvia, Residential)

| Class | Heating threshold (kWh/m²/year) |
|-------|---------------------------------|
| A (NZEB) | ≤ 30 |
| B | ≤ 40–60 |
| C | ≤ 50–60 |
| E | Average unrenovated Soviet building |
| G | Worst: measured avg 262 kWh/m²/year |

Source: EPBD Latvia [9]

---

## Design Norms by Decade (Latvia)

| Era | Heating norm (kWh/m²/year) |
|-----|----------------------------|
| Soviet 1980s | 150–200 |
| 1992 (post-Soviet code) | 100–130 |
| 2003 | 70–90 |
| 2021 | 40–60 |

Source: ODYSSEE-MURE [8]

---

## Key Facts for ALTEKO

- **Average saving after ALTUM renovation: ~60%** (from ~128 to ~54 kWh/m²/year) [1]
- **3 dominant series in Latvia: 103 + 316 + 467** — total 16.8M m² floor area [1]
- **Total apartment buildings in Latvia: ~39,500** — ~34,000–36,000 are class F [14]
- **Latvia spends ~550–600M EUR/year on heating** [14]
- **Standard renovation projects ordered** for series 316 and 602 in 2024 [15]
- Series 104 and 119 declared structurally safe in January 2025 [16]

---

## Gaps — Data Not Found

| Series | Status |
|--------|--------|
| 119 | No energy data. Structural safety only (2025). |
| 334 | Not found in any source. |
| LM | Not found. Likely local Latvian designation. |
| M-464 | Not found separately. Likely Minsk variant, not present in Latvia. |
| Series-specific DHW | No series-specific data. National average only (73.3 kWh/m²/year). |

---

## Notes on the "gorod.lv 140 kWh for series 467" claim

The verified ALTUM portfolio average for series 467 is **113.1 kWh/m²/year**. Individual buildings fall in the 100–160 range, so 140 kWh is plausible for a specific building but unconfirmed from that source. [ОЦЕНКА]

---

## Sources

1. Academia.edu — "Energy efficient renovation of multi-apartment buildings: management, economic and engineering aspects" (2023)
   https://www.academia.edu/123387238/Energy_efficient_renovation_of_multi_apartment_buildings_management_economic_and_engineering_aspects

2. Academia.edu — "Renovation need for apartment buildings in Latvia" (2017) — National averages: 104.40 kWh/m² heating, 73.30 kWh/m² hot water; U-values by series
   https://www.academia.edu/118932500/Renovation_need_for_apartment_buildings_in_Latvia

3. Institute of Numerical Modelling, University of Latvia — ALTUM Statistics (2023)
   https://modinst.lu.lv/en/statistics-of-the-altum-energy-efficiency-program/

4. MDPI Buildings — "Evaluating Reduction in Thermal Energy Consumption across Renovated Buildings in Latvia and Lithuania" (2023) — Group A: 142–159 → 73–103 kWh/m²/year; Group B: up to 187.55 → 79.61; avg reduction 50.59%
   https://www.mdpi.com/2075-5309/13/8/1916

5. Latvia Ministry of Economics — Top 10 most energy-efficient renovated buildings (2023) — Pre-renovation 119–181 kWh/m²/year, post-renovation 23–53 kWh/m²/year
   https://www.em.gov.lv/en/article/insulation-multi-apartment-buildings-top-10-most-energy-efficient-buildings-latvia

6. fi-compass.eu — "Energy efficiency programmes for multi-apartment buildings in Latvia" — 624 buildings 2014–2020, avg 60% savings
   https://www.fi-compass.eu/stories/energy-efficiency-programmes-multi-apartment-buildings-latvia

7. tvnet.lv — Heating cost ranking by building series (~2020–2021)
   https://rus.tvnet.lv/7625413/podschitano-zhilcy-kakih-mnogokvartirnyh-domov-platyat-za-otoplenie-bolshe-vseh

8. ODYSSEE-MURE — Latvia Energy Efficiency Profile (2023)
   https://www.odyssee-mure.eu/publications/efficiency-trends-policies-profiles/latvia.html

9. EPBD in Latvia — PassREg Solutions Open Source (2020)
   https://passregsos.passiv.de/wiki/EPBD_in_Latvia.html

10. LABEEF Factsheet (Ecofys/adelphi, 2018) — Average multifamily stock 160–180 kWh/m²/year; 63% panel houses
    https://www.euki.de/wp-content/uploads/2018/12/Fact-Sheet-LABEEF-Latvian-Energy-Efficiency-Facility-LV.pdf

11. AlgorithmWatch / Tartu Smart Homes Estonia (2020) — Khrushchevka baseline 270 kWh/m²/year; retrofit target 90 kWh/m²/year
    https://automatingsociety.algorithmwatch.org/report2020/estonia/estonia-story/

12. ABOK — "Heat consumption norms, residential buildings" — Russian climate reference: 5–9-floor pre-2000 ~0.21 Gcal/m²/year = 244 kWh/m²/year
    https://www.abok.ru/for_spec/articles.php?nid=5160

13. ABOK — "Specific heat consumption for multi-story buildings by floor count"
    https://www.abok.ru/for_spec/articles.php?nid=2782

14. Inbox.lv — "Every Third Apartment Building in Latvia Is Not Worth Repairing" — 39,500 total; 34,000–36,000 class F; 550–600M EUR/year on heating
    https://news.inbox.lv/14zmpmg-are-you-warm-young-lady-every-third-apartment-building-in-latvia-is-not-worth-repairing

15. Latvia Ministry of Economics — Plans for standard renovation projects for series 316 and 602 (2024)
    https://www.em.gov.lv/en/article/plans-develop-standard-projects-renovation-and-energy-efficiency-improvement-316-and-602-series-multi-apartment-buildings

16. LSM.lv — Series 104 and 119 declared structurally safe (January 2025)
    https://rus.lsm.lv/statja/novosti/obschestvo/16.01.2025-doma-104-i-i-119-i-serii-priznany-bezopasnymi-issledovanie.a583945/

---

*Collected: 2026-05-02. Agent search: 15+ sources, 77 queries.*
