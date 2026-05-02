# Модель данных

Определена в `prisma/schema.prisma`. Prisma — единственный источник правды. Все изменения вносятся через `prisma migrate dev` локально и `prisma migrate deploy` в CI.

---

## Схема

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
  vzdUpdatedAt     DateTime?
  bvkbUpdatedAt    DateTime?
  createdAt        DateTime     @default(now())

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
```

---

## Связи

```
Building ──< Apartment ──< Vote >── VotingCampaign >── Building
Building ──< ExpenseReport ──< ExpenseItem
Building ──< RenovationProject >── Contractor
Building ──< ApartmentTransaction  (через buildingCadNr = cadastralCode)
BenchmarkSegment  (производное — агрегация ExpenseItem, без FK)
ApartmentTransaction, CadastralValue, PriceIndex, UtilityTariff, BuildingSeries
  — открытые данные, без FK на пользовательские модели
```

---

## Соглашения об именовании

- Имена моделей: PascalCase (соглашение Prisma)
- Имена полей: camelCase
- Все ID: UUID (`@default(uuid())`)
- Временные метки: `createdAt` у всех моделей, `updatedAt` у изменяемых записей
