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

```mermaid
flowchart LR
    Upload([PDF загружен]) --> OCR[OCR\nизвлечение текста]
    OCR --> LLM[GPT-4o\nкатегоризация строк]
    LLM --> Norm[Нормализация\n€/м² · €/квартира]
    Norm --> DB[(PostgreSQL\nExpenseItem)]
    DB --> Bench[Бенчмаркинг\nсерия × район × площадь]
    Bench --> Anomaly[Обнаружение аномалий\nP75 · YoY · счётчики]

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
        A2[OCR + LLM]
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
    participant Jana as Jāņa sēta API
    participant LVM as LVM GeoServer WFS
    participant DB as PostgreSQL

    U->>FE: вводит "Brīvības 55"
    FE->>API: GET /api/address/search?q=...
    API->>Jana: autocomplete запрос
    Jana-->>API: 5–8 вариантов адреса
    API-->>FE: список подсказок
    FE-->>U: выпадающий список

    U->>FE: выбирает адрес
    FE->>API: GET /api/address/resolve?vzd_id=...
    API->>Jana: geocode → lat/lon + vzd_id
    Jana-->>API: координаты
    API->>LVM: WFS BBOX → cadastralCode
    LVM-->>API: kadastra apzīmējums
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

*Все диаграммы основаны на: architecture.md, module-audit.md, module-renovation.md, address-search.md, monetization.md, concept.md*
