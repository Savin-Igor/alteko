# Модель данных

Определена в `prisma/schema.prisma`. Prisma — единственный источник правды. Все изменения вносятся через `prisma migrate dev` локально и `prisma migrate deploy` в CI.

> **v2 (Readiness Platform):** Базовая схема ниже сохранена в коде. В разделе [«v2 additions»](#v2-additions-модели-readiness-platform) описаны новые сущности (Readiness, Financing, Decisions) — они **запланированы, но ещё не в migrations**. Добавление — отдельная итерация после rewrite доков. Хардкод 1.5% commission в `RenovationProject.commissionAmount` подлежит удалению.

---

## Схема (текущая, v1 в production)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ────────────────────────────────────────────────────

enum EnergyClass {
  A
  B
  C
  D
  E
  F
  G
}

enum ExpenseCategory {
  HEATING
  COLD_WATER
  HOT_WATER
  WASTEWATER
  WASTE
  CLEANING
  REPAIR_FUND
  ADMINISTRATION
  ELEVATOR
  OTHER
}

enum UserRole {
  OWNER
  ASSOCIATION_ADMIN
  CONTRACTOR
  PLATFORM_ADMIN
}

enum Language {
  LV
  RU
}

enum ReportStatus {
  PENDING
  PROCESSING
  PROCESSED
  FAILED
}

enum VoteDecision {
  YES
  NO
  ABSTAIN
}

enum AuthMethod {
  SMART_ID
  EPARAKSTS
}

enum CampaignStatus {
  DRAFT
  ACTIVE
  COMPLETED
  CANCELLED
}

enum ProjectStatus {
  INITIATED
  VOTING
  CONTRACTED
  IN_PROGRESS
  COMPLETED
}

// ─── MODELS ───────────────────────────────────────────────────

model User {
  id                String    @id @default(uuid())
  email             String    @unique
  phone             String?
  fullName          String
  role              UserRole  @default(OWNER)
  smartIdCode       String?   // зашифровано — персональный код для Smart-ID
  preferredLanguage Language  @default(LV)
  createdAt         DateTime  @default(now())

  apartments        Apartment[]
  votes             Vote[]
  uploadedReports   ExpenseReport[]
}

model Building {
  id               String       @id @default(uuid())
  address          String
  cadastralCode    String       @unique  // kadastra apzīmējums (14 символов)
  vzdId            String?      @unique  // код адреса ARVIS (VARISCode)
  series           String?      // 103, 119, 467 и т.д. — производное, nullable
  constructionYear Int?
  totalAreaM2      Decimal?
  apartmentCount   Int?
  floorCount       Int?         // этажей над землёй (из Building.ZIP)
  wallMaterial     String?      // материал стен (из Building.ZIP, код VZD)
  energyClass      EnergyClass?
  district         String?
  lat              Decimal?
  lon              Decimal?
  vzdUpdatedAt         DateTime?
  bvkbUpdatedAt        DateTime?
  postalCode           String?   // из VAR ATRIB[9]; напр. "LV-1050"
  isPlanAddress        Boolean?  // из VAR PLAN_ADR[15]; true=плановый адрес, false=реальное здание
  heatingEnergyKwhM2   Decimal?  // из BVKB[20]: потребление тепла кВт·ч/м²/год (до реновации)
  renovationYear       Int?      // из BVKB[14]: год реновации (null = не реновировано)
  bvkbCertDate         DateTime? // из BVKB[3]: дата выдачи энергосертификата
  primaryEnergyKwhM2   Decimal?  // из BVKB[27]: суммарная первичная энергия кВт·ч/м²/год
  co2KgM2              Decimal?  // из BVKB[34]: выброс CO2 кг/м²/год
  createdAt            DateTime  @default(now())

  apartments       Apartment[]
  reports          ExpenseReport[]
  campaigns        VotingCampaign[]
  projects         RenovationProject[]

  @@index([district])
  @@index([series])
  @@index([energyClass])
}

model Apartment {
  id              String   @id @default(uuid())
  buildingId      String
  apartmentNumber String
  areaM2          Decimal
  ownerId         String?  // null если собственник не зарегистрирован на платформе
  ownershipShare  Decimal  // доля от общей площади дома — вес голоса
  zemesgramataRef String?  // ссылка на земельный реестр

  building        Building @relation(fields: [buildingId], references: [id])
  owner           User?    @relation(fields: [ownerId], references: [id])
  votes           Vote[]

  @@unique([buildingId, apartmentNumber])
}

model ExpenseReport {
  id          String       @id @default(uuid())
  buildingId  String
  periodYear  Int
  periodMonth Int
  rawFileKey  String       // ключ объекта S3 для оригинального PDF
  parsedData  Json?        // сырой вывод LLM — только для аудита
  status      ReportStatus @default(PENDING)
  uploadedBy  String
  processedAt DateTime?
  createdAt   DateTime     @default(now())

  building    Building      @relation(fields: [buildingId], references: [id])
  uploader    User          @relation(fields: [uploadedBy], references: [id])
  items       ExpenseItem[]

  @@unique([buildingId, periodYear, periodMonth])
  @@index([buildingId])
}

model ExpenseItem {
  id             String          @id @default(uuid())
  reportId       String
  category       ExpenseCategory
  rawLabel       String          // оригинальный текст из PDF — для аудита
  amountTotal    Decimal         // итого по дому (€)
  amountPerM2    Decimal         // нормализовано на м²
  amountPerApt   Decimal         // нормализовано на квартиру
  unit           String?         // исходная единица измерения (€, м³ и т.д.)

  report         ExpenseReport   @relation(fields: [reportId], references: [id])

  @@index([reportId])
  @@index([category])
}

model BenchmarkSegment {
  id            String          @id @default(uuid())
  series        String
  district      String
  areaRange     String          // SMALL (<2000м²), MEDIUM (2000-5000м²), LARGE (>5000м²)
  category      ExpenseCategory
  periodYear    Int
  periodMonth   Int
  buildingCount Int
  p25           Decimal
  p50           Decimal         // медиана
  p75           Decimal
  computedAt    DateTime        @default(now())

  @@unique([series, district, areaRange, category, periodYear, periodMonth])
}

model VotingCampaign {
  id                String         @id @default(uuid())
  buildingId        String
  title             String
  description       String?
  status            CampaignStatus @default(DRAFT)
  requiredThreshold Decimal        @default(0.50) // минимальная доля «за»
  currentYesShare   Decimal        @default(0)    // вычисляется, обновляется при каждом голосе
  deadline          DateTime?
  protocolKey       String?        // ключ S3 для сгенерированного PDF протокола
  createdAt         DateTime       @default(now())

  building          Building       @relation(fields: [buildingId], references: [id])
  votes             Vote[]
  projects          RenovationProject[]

  @@index([buildingId])
}

model Vote {
  id             String         @id @default(uuid())
  campaignId     String
  apartmentId    String
  ownerId        String
  decision       VoteDecision
  ownershipShare Decimal        // снимок на момент голосования — неизменяем
  signature      String         // цифровая подпись Smart-ID или eParaksts
  signedAt       DateTime
  authMethod     AuthMethod

  campaign       VotingCampaign @relation(fields: [campaignId], references: [id])
  apartment      Apartment      @relation(fields: [apartmentId], references: [id])
  owner          User           @relation(fields: [ownerId], references: [id])

  @@unique([campaignId, apartmentId])  // один голос на квартиру за кампанию
  @@index([campaignId])
}

model Contractor {
  id                   String    @id @default(uuid())
  userId               String    @unique
  companyName          String
  registrationNumber   String    @unique
  luroftVerified       Boolean   @default(false)
  specializations      String[]
  geographicCoverage   String[]
  rating               Decimal?
  ratingCount          Int       @default(0)
  active               Boolean   @default(true)
  createdAt            DateTime  @default(now())

  projects             RenovationProject[]
}

model RenovationProject {
  id                  String        @id @default(uuid())
  buildingId          String
  status              ProjectStatus @default(INITIATED)
  campaignId          String?
  contractorId        String?
  contractValue       Decimal?      // итоговая сумма контракта (€)
  commissionAmount    Decimal?      // комиссия ALTEKO (€)
  altumApplicationRef String?
  createdAt           DateTime      @default(now())

  building            Building       @relation(fields: [buildingId], references: [id])
  campaign            VotingCampaign? @relation(fields: [campaignId], references: [id])
  contractor          Contractor?    @relation(fields: [contractorId], references: [id])
}
```

---

## Ключевые ограничения

**Голоса неизменяемы:** После создания записи `Vote` её нельзя обновлять. Соблюдается на уровне приложения (нет эндпоинтов обновления голосов). Ограничение `@@unique([campaignId, apartmentId])` предотвращает двойное голосование.

**`parsedData` — только для аудита:** Сырой JSON-вывод LLM хранится в `ExpenseReport.parsedData` (тип `Json`) для отслеживаемости. Каноническое представление — строки `ExpenseItem`. Не использовать `parsedData` для вычислений.

**`ownershipShare` в Vote — снимок:** Данные Zemesgrāmata могут меняться. Доля, записанная в момент голосования, сохраняется и используется во всех последующих вычислениях по этому голосу.

**`smartIdCode` — чувствительные данные:** Шифруется на уровне приложения перед сохранением. Никогда не логируется.

---

## Модели синхронизации открытых данных

Добавлены в `schema.prisma`, заполняются через скрипты в `scripts/`. Не связаны с пользовательскими данными напрямую.

```prisma
// Сделки с квартирами — из tg_darjumi CSV (data.gov.lv, ежемесячно)
model ApartmentTransaction {
  deaId           Int      @unique   // VZD ID сделки
  propertyCadNr   String             // кадастровый номер квартиры
  buildingCadNr   String?            // кадастровый номер здания → Building.cadastralCode
  address         String             // полный адрес с номером квартиры
  city            String?
  district        String?
  transactionDate DateTime
  priceEur        Decimal
  buildingAreaM2  Decimal?
  buildingYear    Int?
  wallMaterial    String?            // "2303 - Dzelzsbetona paneļi" и т.д.
  depreciation    String?            // V1–V4
  apartmentCadNr  String?
  floorMin        Int?
  floorMax        Int?
  apartmentAreaM2 Decimal?
  buildingUseCode String?            // из tg_darjumi BUI_USE_CODE[20]; 1122 = многоквартирный дом
}

// Кадастровые стоимости — из data.gov.lv, ежегодно
model CadastralValue {
  cadastralNr       String
  objectType        String
  fiscalValueEur    Decimal?   // фискальная стоимость (база 2012–13)
  universalValueEur Decimal?   // универсальная стоимость (база июль 2022, макс. 80% рынка)
  validFrom         DateTime
}

// Индексы цен — CSP API, квартальные / месячные
model PriceIndex {
  indexType     String   // HOUSE_PRICE | CONSTRUCTION_COST
  region        String?
  periodYear    Int
  periodQuarter Int?
  periodMonth   Int?
  value         Decimal
}

// Тарифы ЖКХ — ручной ввод по решениям SPRK
model UtilityTariff {
  providerName String
  city         String
  tariffType   String   // HEATING | COLD_WATER | WASTEWATER
  pricePerUnit Decimal
  unit         String   // EUR/MWh | EUR/m3
  validFrom    DateTime
  validTo      DateTime?
}

// Серии зданий — статический справочник (seed-series.ts)
model BuildingSeries {
  code            String   @id   // 103, 119, 467, Khrushchevka...
  wallMaterialKey String         // совпадение с кодом в MaterialKind из tg_darjumi
  floorsMin       Int?
  floorsMax       Int?
  yearFrom        Int
  yearTo          Int
  typicalAreaM2   Decimal?
  description     String?
}

// Данные на уровне квартир из VZD Building.ZIP (элементы PremiseGroupItemData)
// Связь с Building через buildingCadastralCode — без FK (тот же паттерн, что ApartmentTransaction)
// Источник: https://data.gov.lv/dati/dataset/kadastra-informacijas-sistemas-atvertie-dati
// Синхронизация: sync-premises.ts (еженедельно)
model BuildingUnit {
  id                    String   @id @default(uuid())
  cadastralCode         String   @unique  // кадастровый номер квартиры/помещения
  buildingCadastralCode String            // кадастровый номер здания → Building.cadastralCode
  areaM2                Decimal?          // площадь квартиры м²
  floor                 Int?              // этаж
  roomCount             Int?              // количество комнат
  syncedAt              DateTime @default(now())

  @@index([buildingCadastralCode])
}
```

---

## Связи

```
Building ──< Apartment ──< Vote >── VotingCampaign >── Building
Building ──< ExpenseReport ──< ExpenseItem
Building ──< RenovationProject >── Contractor
Building ──< ApartmentTransaction  (через buildingCadNr = cadastralCode)
Building ──< BuildingUnit          (через buildingCadastralCode = cadastralCode)
BenchmarkSegment  (производное — агрегация ExpenseItem, без FK)
ApartmentTransaction, CadastralValue, PriceIndex, UtilityTariff, BuildingSeries, BuildingUnit
  — открытые данные, без FK на пользовательские модели
```

---

## Соглашения об именовании

- Имена моделей: PascalCase (соглашение Prisma)
- Имена полей: camelCase
- Все ID: UUID (`@default(uuid())`)
- Временные метки: `createdAt` у всех моделей, `updatedAt` у изменяемых записей

---

## v2 additions: модели Readiness Platform

> **Статус:** запланировано в этой итерации rewrite доков. Реализация в коде — следующая итерация. Будут добавлены новые миграции и расширения существующих моделей.

### Новые enum'ы

```prisma
// Статус окна финансирования
enum FundingWindowStatus {
  CLOSED      // программа закрыта для новых заявок (ALTUM 2021-2027)
  EXPECTED    // ожидается (SCF 2026-2032 — MK noteikumi Q4 2026)
  OPEN        // принимает заявки (ALTUM remonta aizdevums, банк)
  UNKNOWN     // правила неизвестны
}

// Достоверность данных по карточке дома
enum DataConfidence {
  PUBLIC_DATA            // только публичные источники (VZD, BVKB)
  USER_UPLOADED          // загружено пользователем (счета, CSV)
  BOARD_VERIFIED         // подтверждено правлением
  PROFESSIONAL_VERIFIED  // подтверждено специалистом
}

// Юридическая уверенность в документе/решении
enum LegalConfidence {
  DRAFT          // черновик, без юр. проверки
  NEEDS_REVIEW   // требует юр. консультации
  VALIDATED      // юр. проверено
}

// Заменяет ProjectStatus в новой логике
enum BuildingProjectStatus {
  NOT_READY                // нет данных, документов, решений
  READY_FOR_LOAN           // готов к ALTUM remonta aizdevums или банку
  READY_FOR_FUTURE_GRANT   // готов к будущему окну SCF
  IN_APPLICATION           // заявка подана
  APPROVED                 // одобрено
  IN_CONSTRUCTION          // в стройке
  COMPLETED                // завершено
}

// Семь типов решений собственников
enum DecisionType {
  PREPARATION_DECISION         // решение о начале подготовки
  REPRESENTATIVE_AUTHORIZATION // назначение уполномоченного лица
  DATA_COLLECTION_CONSENT      // согласие на обработку данных (GDPR)
  ENERGY_AUDIT_DECISION        // решение об энергоаудите
  PROGRAM_APPLICATION_DECISION // решение об участии в программе
  LOAN_DECISION                // решение о кредите
  SUPPLIER_SELECTION_DECISION  // решение о выборе поставщика
}

// Финансовые сценарии
enum FinancingScenarioType {
  SCF_2026_2032             // Sociālā klimata fonds
  ALTUM_REMONTA_AIZDEVUMS   // ALTUM ремонтный кредит
  COMMERCIAL_BANK           // коммерческий банк
  OWN_FUND                  // свой ремонтный фонд
  MIXED                     // смешанный
}

// Предварительная пригодность к сценарию
enum FinancingEligibility {
  ELIGIBLE
  LIKELY_ELIGIBLE
  UNLIKELY
  NOT_ELIGIBLE
  UNKNOWN
}

// Подписки в Tender Room
enum ContractorSubscriptionTier {
  NONE        // не подписан
  BASIC       // EUR 50/мес.
  PLUS        // EUR 200/мес.
}
```

### Новые модели

```prisma
// Сводный показатель готовности дома — центральная сущность v2
model BuildingReadinessScore {
  id                            String              @id @default(uuid())
  buildingId                    String              @unique
  // 8 компонентов
  energyScore                   Int?                // 0-100, на основе BVKB
  fundingEligibilityScore       Int?                // 0-100, агрегация по сценариям
  documentReadinessScore        Int?                // 0-100, % выполненных пунктов
  ownerDecisionReadinessScore   Int?                // 0-100, % принятых обязательных решений
  financialFeasibilityScore     Int?                // 0-100
  supplierSelectionStatus       String?             // enum в виде string для гибкости
  legalConfidenceStatus         LegalConfidence     @default(DRAFT)
  dataConfidenceStatus          DataConfidence      @default(PUBLIC_DATA)
  // Главное поле
  nextBestAction                String              // локализованная строка (LV основная)
  nextBestActionRu              String?             // RU перевод (опционально)
  // Integrity Score блок
  procurementTransparencyScore  Int?                // 0-100
  supplierConflictRisk          Int?                // 0-100
  decisionQuality               Int?                // 0-100
  ownerUnderstandingScore       Int?                // 0-100
  documentCompleteness          Int?                // 0-100
  priceBenchmarkDeviation       Decimal?            // % отклонения от бенчмарков
  // Технические поля
  rulesEngineVersion            String              // версия правил, по которой считалось
  computedAt                    DateTime            @default(now())
  expiresAt                     DateTime?           // когда нужно пересчитать

  building                      Building            @relation(fields: [buildingId], references: [id])

  @@index([buildingId])
}

// Один из 5 финансовых сценариев для дома
model FinancingScenario {
  id              String                 @id @default(uuid())
  buildingId      String
  scenarioType    FinancingScenarioType
  windowStatus    FundingWindowStatus
  eligibility     FinancingEligibility
  confidence      String                 // low | medium | high
  // Расчёты
  estimatedCostEur          Decimal?
  estimatedSubsidyPercent   Decimal?
  estimatedSubsidyEur       Decimal?
  monthlyPaymentPerApartment Decimal?
  paybackYears              Decimal?
  // Объяснение для UI
  reasoningLv     String                 // объяснение пригодности (LV)
  reasoningRu     String?
  // Метаданные
  rulesEngineVersion String
  computedAt      DateTime               @default(now())

  building        Building               @relation(fields: [buildingId], references: [id])

  @@unique([buildingId, scenarioType])
  @@index([buildingId])
  @@index([scenarioType])
}

// Кампания решений собственников — расширение/замена VotingCampaign
// В Phase 1 реализовано через расширение VotingCampaign (см. ниже).
// В Phase 2+ — отдельная модель DecisionCampaign с поддержкой подготовительной фазы.
model DecisionCampaign {
  id                  String          @id @default(uuid())
  buildingId          String
  decisionType        DecisionType
  title               String
  questionTextLv      String          // вопрос для собственников на LV
  questionTextRu      String?
  explanationTextLv   String          // объяснение простым языком
  explanationTextRu   String?
  // Подготовительная фаза (предварительные намерения)
  intentionsCollected Boolean         @default(false)
  intentionsYesCount  Int             @default(0)
  intentionsNoCount   Int             @default(0)
  intentionsAbstainCount Int          @default(0)
  // Финальная фаза (через VotingCampaign или экспорт в BIS)
  formalCampaignId    String?         @unique  // ссылка на VotingCampaign для официального голоса
  bisExportedAt       DateTime?       // когда экспортировано в BIS Mājas lieta
  bisExportRef        String?         // ссылка/идентификатор в BIS
  // Юридическая чистота
  legalConfidence     LegalConfidence @default(DRAFT)
  // Метаданные
  status              CampaignStatus  @default(DRAFT)
  deadline            DateTime?
  createdAt           DateTime        @default(now())

  building            Building        @relation(fields: [buildingId], references: [id])
  formalCampaign      VotingCampaign? @relation(fields: [formalCampaignId], references: [id])

  @@index([buildingId])
  @@index([decisionType])
}

// Заказ платного Gatavības atskaite (€300-900 разово)
model ReadinessReportOrder {
  id                  String              @id @default(uuid())
  buildingId          String
  orderedByEmail      String              // email заказчика
  orderedByUserId     String?             // если зарегистрирован
  amountEur           Decimal             // зафиксированная сумма
  currency            String              @default("EUR")
  paymentProviderRef  String?             // Stripe payment_intent ID
  paymentStatus       String              @default("pending") // pending | succeeded | failed | refunded
  reportFileKey       String?             // S3 ключ к сгенерированному PDF
  emailSentAt         DateTime?
  language            Language            @default(LV)
  createdAt           DateTime            @default(now())
  paidAt              DateTime?

  building            Building            @relation(fields: [buildingId], references: [id])

  @@index([buildingId])
  @@index([orderedByEmail])
}

// Версионирование rules engine (правила пригодности)
model RulesEngineVersion {
  version         String      @id   // например, "scf-2026-v0.1"
  scenarioType    FinancingScenarioType
  rulesJson       Json        // правила в JSON-формате
  effectiveFrom   DateTime
  effectiveUntil  DateTime?
  description     String?
  createdAt       DateTime    @default(now())
  createdByUserId String?

  @@index([scenarioType, effectiveFrom])
}
```

### Расширения существующих моделей

```prisma
// User — добавить новые роли
enum UserRole {
  OWNER
  BOARD_MEMBER         // новое: член правления biedrība
  PROFESSIONAL         // новое: apsaimniekotājs / ESCO / projektu vadītājs
  ASSOCIATION_ADMIN    // оставлено для совместимости (= BOARD_MEMBER)
  CONTRACTOR
  PLATFORM_ADMIN
}

// Building — добавить ссылку на readiness
model Building {
  // ... существующие поля
  readinessScore   BuildingReadinessScore?
  scenarios        FinancingScenario[]
  decisionCampaigns DecisionCampaign[]
  readinessOrders  ReadinessReportOrder[]
}

// VotingCampaign — добавить связь с DecisionCampaign
model VotingCampaign {
  // ... существующие поля
  decisionCampaign DecisionCampaign?
}

// Contractor — добавить subscription tier
model Contractor {
  // ... существующие поля
  subscriptionTier      ContractorSubscriptionTier @default(NONE)
  subscriptionStartedAt DateTime?
  subscriptionExpiresAt DateTime?
}

// RenovationProject — переименовать commissionAmount → ОТМЕНЯЕТСЯ
// 1.5% commission хардкод в api/tenders/bid и api/tenders/select
// будет удалён в отдельной итерации после rewrite доков.
```

### Связи (с v2)

```
Building ──< BuildingReadinessScore (1:1)
Building ──< FinancingScenario (1:N — по одному на сценарий)
Building ──< DecisionCampaign (1:N)
Building ──< ReadinessReportOrder (1:N)
DecisionCampaign ──< VotingCampaign (1:0..1 — формальная фаза)
RulesEngineVersion (без FK — справочник)
```

### Migration plan (для следующей итерации)

1. Добавить новые enum'ы (FundingWindowStatus, DataConfidence, LegalConfidence, BuildingProjectStatus, DecisionType, FinancingScenarioType, FinancingEligibility, ContractorSubscriptionTier)
2. Добавить новые модели (BuildingReadinessScore, FinancingScenario, DecisionCampaign, ReadinessReportOrder, RulesEngineVersion)
3. Расширить существующие enum'ы (UserRole)
4. Добавить relations на Building / VotingCampaign / Contractor
5. Удалить `RenovationProject.commissionAmount` (с миграцией для существующих записей)
6. Запустить `prisma migrate dev` локально, потом `prisma migrate deploy` в CI

---

*Связанные документы: [docs/product/module-readiness.md](../product/module-readiness.md), [docs/product/module-renovation.md](../product/module-renovation.md), [docs/product/module-tender-room.md](../product/module-tender-room.md), [docs/reference/readiness-glossary.md](../reference/readiness-glossary.md)*
