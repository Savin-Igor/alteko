# Диаграммы ALTEKO

Визуализация архитектуры, потоков данных и пользовательских сценариев.
Все диаграммы построены строго по документации — ничего не выдумано.

---

## 1. Архитектура системы

Один Docker-контейнер с Next.js обслуживает и frontend, и backend. Отдельного сервера нет.

```mermaid
graph TB
    Client([Браузер пользователя])

    subgraph App["Next.js приложение (один контейнер)"]
        Pages["Страницы SSR\n/dashboard /audit\n/renovation /voting"]
        API["API Routes\n/api/audit /api/benchmarks\n/api/renovation /api/voting\n/api/address"]
        Lib["Библиотеки\nprisma.ts · llm.ts · s3.ts\ncalculator/ · benchmarks/"]
    end

    subgraph Data["Хранилище"]
        PG[(PostgreSQL\nPrisma ORM)]
        S3[S3\nPDF / документы]
    end

    subgraph External["Внешние сервисы"]
        GPT[GPT-4o API\nпарсинг PDF]
        Jana[Jāņa sēta API\nгеокодинг]
        LVM[LVM GeoServer\nкадастр WFS]
        SmartID[Smart-ID / eParaksts\nголосование]
    end

    Client --> Pages
    Client --> API
    API --> Lib
    Lib --> PG
    Lib --> S3
    Lib --> GPT
    API --> Jana
    API --> LVM
    API --> SmartID
```

---

## 2. Поток обработки PDF-счёта

От загрузки файла до результата в двух форматах: превью (мгновенно) и полный отчёт (после email).
Без OCR: PDF передаётся в GPT-4o vision напрямую через base64.

```mermaid
flowchart LR
    Upload([PDF загружен]) --> S3[Сохранить в S3\nExpenseReport PENDING]
    S3 --> Presign["Presigned URL\nPOST /api/audit/parse"]
    Presign --> B64["base64-кодирование\ndata:application/pdf;base64,..."]
    B64 --> LLM["GPT-4o vision\nодин вызов — structured JSON"]
    LLM --> Items["ExpenseItem[]\nHEATING, COLD_WATER ...\nстатус PROCESSED"]
    Items --> DB[(PostgreSQL)]
    DB --> Bench["Бенчмаркинг\nсерия × район × площадь"]
    Bench --> Anomaly["Обнаружение аномалий\nP75 · YoY · счётчики"]

    Anomaly --> Preview["Превью\n% отклонения — без email"]
    Preview --> Gate{Email\nвведён?}
    Gate -->|нет| Form[Форма захвата email]
    Form --> Gate
    Gate -->|да| Full["Полный отчёт\nна email + личный кабинет"]
```

---

## 3. Путь пользователя (User Flow)

Три эмоциональных этапа с email-гейтом между превью и полным отчётом.

```mermaid
flowchart TD
    Start([Пользователь]) --> Address[Вводит адрес дома]
    Address --> Card[Карточка дома\nсерия · год · класс · площадь]
    Card --> Upload[Загружает PDF-счёт]
    Upload --> Preview["Превью\n«Вы переплачиваете на 40%»"]
    Preview --> EmailGate{Email?}
    EmailGate -->|нет| EnterEmail[Вводит email]
    EnterEmail --> EmailGate
    EmailGate -->|да| Full[Полный отчёт\nпо всем категориям]

    Full --> Angry{"Есть\nаномалия?"}
    Angry -->|нет| Monitor[Мониторинг\nследующие счета приходят автоматически]
    Angry -->|да| CTA["«Сколько сэкономит\nреновация?»"]

    CTA --> Savings[Прогноз экономии\n€/мес. · Altum · окупаемость]
    Savings --> Decide{Готов\nдействовать?}
    Decide -->|нет| Monitor
    Decide -->|да| Docs[Генерация документов]
    Docs --> Vote[Электронное голосование\nSmart-ID / eParaksts]
    Vote --> Threshold{≥50%\nсогласия?}
    Threshold -->|нет| Vote
    Threshold -->|да| Protocol[Протокол голосования]
    Protocol --> Tender[Тендер подрядчиков]
    Tender --> Deal([Сделка закрыта\nALTEKO: 1–2%])
```

---

## 4. Взаимодействие модулей

Как четыре модуля связаны между собой и что передают друг другу.

```mermaid
graph LR
    subgraph Audit["Аудит расходов"]
        A1[Загрузка PDF]
        A2["GPT-4o vision\n(без OCR)"]
        A3[Бенчмаркинг]
        A4[Email-гейт]
        A1 --> A2 --> A3 --> A4
    end

    subgraph Renovation["Реновация"]
        R1[ИИ-прогноз экономии]
        R2[Калькулятор Altum]
        R3[Генератор документов]
    end

    subgraph Voting["Голосование"]
        V1[Список собственников]
        V2[Smart-ID / eParaksts]
        V3[Протокол]
        V1 --> V2 --> V3
    end

    subgraph Marketplace["Маркетплейс"]
        M1[Профили подрядчиков]
        M2[Тендер]
        M3[Комиссия 1–2%]
        M1 --> M2 --> M3
    end

    A4 -->|"email + данные дома"| R1
    R1 --> R2 --> R3
    R3 -->|"готовые документы"| V1
    V3 -->|"протокол ≥50%"| M2
```

---

## 5. Поиск адреса и связь с кадастром

Цепочка из четырёх шагов от строки ввода до данных здания.

```mermaid
sequenceDiagram
    participant U as Пользователь
    participant FE as Next.js (frontend)
    participant API as API Route
    participant Jana as Jāņa sēta API v3
    participant LVM as LVM GeoServer WFS
    participant DB as PostgreSQL

    U->>FE: вводит "Brīvības 55"
    FE->>API: GET /api/address/search?q=...
    API->>Jana: /v3/{key}/search?layers=adrese&cs=wgs84
    Jana-->>API: [{name, lat, lon}, ...]
    API-->>FE: [{id, address, lat, lon}, ...]
    FE-->>U: выпадающий список

    U->>FE: выбирает адрес (lat/lon известны)
    FE->>API: GET /api/address/resolve?lat=...&lon=...&address=...
    API->>LVM: WFS BBOX(lat,lon) typeName=publicwfs:kkbuilding
    LVM-->>API: code (kadastra apzīmējums)
    API->>DB: findUnique(cadastralCode)
    DB-->>API: серия, год, площадь, энергокласс
    API-->>FE: карточка здания
    FE-->>U: здание на карте + кнопки действий
```

---

## 6. Цепочка ценности

Как данные превращаются в выручку.

```mermaid
flowchart LR
    D[📄 ДАННЫЕ\nPDF от жителей]
    I[💡 ИНСАЙТ\nБенчмарк + аномалия]
    E[📧 EMAIL\nЗахват лида]
    N[🔥 НАМЕРЕНИЕ\nПрогноз реновации]
    A[✅ ДЕЙСТВИЕ\nГолосование 50%+]
    T[🤝 СДЕЛКА\nКонтракт подрядчика]
    R[💰 ВЫРУЧКА\nКомиссия 1–2%]

    D --> I --> E --> N --> A --> T --> R
```

---

## 7. Поток аутентификации

Два независимых пути: вход на платформу и подпись голоса.

```mermaid
flowchart TD
    subgraph Login["Вход на платформу"]
        L1[Пользователь вводит email]
        L2["NextAuth: генерирует magic link\nNodemailer отправляет письмо"]
        L3["Пользователь переходит по ссылке\n/auth/verify"]
        L4["NextAuth: создаёт JWT сессию\nPrismaAdapter: upsert User"]
        L1 --> L2 --> L3 --> L4
    end

    subgraph VoteSign["Подпись голоса"]
        V1["Пользователь нажимает Голосовать\n(сессия уже есть)"]
        V2{Метод\nподписи?}

        subgraph SmartID["Smart-ID"]
            S1["POST /api/auth/smartid/init\nинициирует сессию"]
            S2["Вызов на телефон пользователя"]
            S3["POST /api/auth/smartid/verify\nполучает подписанный ответ"]
            S1 --> S2 --> S3
        end

        subgraph EParaksts["eParaksts"]
            E1["OAuth redirect на LVRTC"]
            E2["GET /api/auth/eparaksts/callback\nполучает подпись"]
            E1 --> E2
        end

        V1 --> V2
        V2 -->|"Smart-ID"| S1
        V2 -->|"eParaksts"| E1
        S3 --> DB2["Vote.signature\nсохраняется в PostgreSQL"]
        E2 --> DB2
    end
```

---

## 8. Поток голосования

От создания кампании до тендера.

```mermaid
flowchart TD
    Admin["ASSOCIATION_ADMIN\nили PLATFORM_ADMIN"]
    Admin --> Create["POST /api/voting/create\nсоздаёт VotingCampaign"]
    Create --> Upload["POST /api/voting/owners-upload\nCSV от правления товарищества\n(Zemesgrāmata API нет)"]
    Upload --> Activate["Кампания активна\nсобственники уведомлены"]

    Activate --> Resident["Житель заходит на платформу\n(magic link сессия)"]
    Resident --> Sign["Подписывает голос\nSmart-ID или eParaksts"]
    Sign --> Vote["POST /api/voting/vote\nownershipShare фиксируется\ncurrentYesShare пересчитывается"]
    Vote --> Check{"currentYesShare\n>= requiredThreshold?"}
    Check -->|нет| Resident
    Check -->|да| Auto["Автозавершение кампании"]
    Auto --> Protocol["POST /api/voting/protocol\nгенерирует протокол\nзагружает в S3"]
    Protocol --> Tender["Тендер подрядчиков\nPOST /api/tenders/bid"]
    Tender --> Select["Выбор победителя\nPOST /api/tenders/select\nкомиссия 1.5%"]
```

---

## 9. Синхронизация данных

Три источника внешних данных, порядок выполнения скриптов важен.

```mermaid
flowchart TD
    subgraph Weekly["Еженедельно"]
        VZD["VZD Building.ZIP\ndata.gov.lv, CC BY"]
        SyncB["scripts/sync-buildings.ts\nустанавливает cadastralCode\nгод, материал, этажи, площадь"]
        VZD --> SyncB
        SyncB --> DB1[(Building в PostgreSQL)]
    end

    subgraph Daily["Ежедневно"]
        BVKB["BVKB энергосертификаты\ndata.gov.lv, CC0"]
        VADRS["VZD адреса\ndata.gov.lv"]
        SyncE["scripts/sync-bvkb.ts\nприсваивает energyClass A-G\nсвязывает через cadastralCode"]
        SyncA["scripts/sync-vzd.ts\nобновляет адресные данные"]
        BVKB --> SyncE
        VADRS --> SyncA
        SyncE --> DB1
        SyncA --> DB1
    end

    subgraph Monthly["Ежемесячно (независимо)"]
        TXN["VZD сделки с квартирами\nDarijumi ar telpu grupam"]
        SyncT["scripts/sync-transactions.ts\nуппертирует ApartmentTransaction"]
        TXN --> SyncT
        SyncT --> DB2[(ApartmentTransaction\nв PostgreSQL)]
    end

    DB1 --> Note["sync-buildings запускается первым:\ncadastalCode нужен\nдля sync-bvkb и sync-vzd"]
```

---

*Все диаграммы основаны на: architecture.md, module-audit.md, module-renovation.md, address-search.md, monetization.md, concept.md, integrations.md*
