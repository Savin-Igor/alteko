## Goal

Provide a high-quality, idiomatic Latvian translation of the entire landing page (`src/app/[locale]/page.tsx`) and restore Latvian as the default locale.

## Context

- All copy on the landing is currently hardcoded in Russian
- `defaultLocale` was temporarily set to `'ru'` to fix the inconsistency
- User requirement: Latvian must be the default and high-quality
- Target audience: elderly residents of Soviet-era apartment blocks in Latvia, bilingual (LV/RU)

## Steps

1. **Refactor page.tsx to use translations**
   - Move all hardcoded RU strings into `messages/ru.json` under `home.*` namespace
   - Replace text in JSX with `useTranslations('home')` calls
   - Same for FAQ array, sample rows, stats, steps, blog previews

2. **Translate every string into Latvian**
   - Use established Latvian terminology:
     - управляющая компания → namu apsaimniekotājs / pārvaldnieks
     - норма (расход) → tipiskais patēriņš / norma
     - серия дома → mājas sērija
     - реновация → renovācija
     - кадастровый реестр → kadastra reģistrs
     - энергосертификат → energoefektivitātes sertifikāts
     - конфиденциальность → konfidencialitāte
     - председатель правления → valdes priekšsēdētājs
     - дашборд → vadības panelis
     - окупаемость → atmaksāšanās laiks
   - Natural phrasing, not word-for-word
   - Correct diacritics on every word
   - Number/date formats: Latvian (€140 mēnesī, 30 sekundes)

3. **Revert defaultLocale to 'lv'**
   - `src/i18n/routing.ts`: locales: ['lv', 'ru'], defaultLocale: 'lv'

4. **Verify with Playwright**
   - `/` shows Latvian (default)
   - `/ru` shows Russian
   - Language toggle works
   - All sections present in both languages

## Risks

- LV has 7 cases, gender, complex declensions — must be checked carefully
- Some terms (Altum, Smart-ID, Kadastrs, biedrība) are kept untranslated
- Numbers and stats stay the same — only labels translate

## Out of scope

- Other pages (renovation, blog, contractors) — landing only
- Component placeholder strings already handled (AddressSearch is locale-aware)
