# Глоссарий новой концепции (LV / RU / EN)

Этот глоссарий — **единственный источник правды** для названий новых концепций после разворота от «маркетплейс реновации» к «платформе готовности дома». Все остальные документы и UI-строки должны использовать только эти формулировки.

**Правила:**
- **LV** — основной язык продукта (дефолт без префикса URL)
- **RU** — второй язык (префикс `/ru/...`)
- **EN** — ключи для кода: имена Prisma-моделей, enum'ов, API routes, типов. В UI не показывается.

---

## Главные продуктовые понятия

| EN (код) | LV (UI основной) | RU (UI вторичный) | Примечание |
|----------|------------------|-------------------|-----------|
| Building Readiness Platform | **Mājas gatavības platforma** | **Платформа готовности дома** | Главное позиционирование ALTEKO |
| Building Readiness Score | **Mājas gatavības novērtējums** | **Оценка готовности дома** | Центральная сущность; сводный индекс |
| Next Best Action | **Nākamais solis** | **Следующий шаг** | Главное поле readiness score, что делать дальше |
| Funding Window | **Finansējuma logs** | **Окно финансирования** | Период, когда программа принимает заявки |
| Financing Scenarios | **Finansējuma scenāriji** | **Сценарии финансирования** | 5 вариантов: SCF, remonta aizdevums, банк, свой фонд, смешанный |
| Readiness Report | **Gatavības atskaite** | **Отчёт о готовности** | Платный продукт #1 |
| Board Workspace | **Valdes darba telpa** | **Рабочая среда правления** | Платный продукт #2 |
| Project Preparation Package | **Projekta sagatavošanas pakete** | **Пакет подготовки проекта** | Платный продукт #3 |
| Professional Portfolio | **Speciālista portfelis** | **Портфель специалиста** | Платный продукт #4 |

---

## Режимы продукта (4 mode'а)

| EN (код) | LV (UI) | RU (UI) | Кому |
|----------|---------|---------|------|
| Public mode | **Publiskais režīms** | **Публичный режим** | Любой посетитель |
| Resident mode | **Iedzīvotāja režīms** | **Режим жильца** | Владелец квартиры |
| Board mode | **Valdes režīms** | **Режим правления** | biedrība, mājas vecākais |
| Professional mode | **Speciālista režīms** | **Режим специалиста** | apsaimniekotājs, ESCO, проектный менеджер |

---

## Подсчёты готовности (компоненты Building Readiness Score)

| EN (код) | LV (UI) | RU (UI) |
|----------|---------|---------|
| Energy score | Energoefektivitātes vērtējums | Оценка энергоэффективности |
| Funding eligibility score | Finansējuma piemērotības vērtējums | Оценка пригодности к финансированию |
| Document readiness score | Dokumentu gatavības vērtējums | Оценка готовности документов |
| Owner decision readiness score | Īpašnieku lēmumu gatavība | Готовность решений собственников |
| Financial feasibility score | Finansiālā dzīvotspēja | Финансовая осуществимость |
| Supplier selection status | Piegādātāju atlases statuss | Статус выбора поставщиков |
| Legal confidence status | Juridiskās ticamības statuss | Статус юридической уверенности |
| Data confidence status | Datu ticamības statuss | Статус достоверности данных |
| Procurement transparency score | Iepirkuma caurredzamības vērtējums | Оценка прозрачности закупки |
| Supplier conflict risk | Piegādātāju interešu konflikta risks | Риск конфликта интересов поставщиков |

---

## Статусы (enum'ы)

### `FundingWindowStatus`
| EN | LV (UI) | RU (UI) |
|----|---------|---------|
| `CLOSED` | Slēgts | Закрыто |
| `EXPECTED` | Gaidāms | Ожидается |
| `OPEN` | Atvērts | Открыто |
| `UNKNOWN` | Nezināms | Неизвестно |

### `DataConfidence`
| EN | LV (UI) | RU (UI) |
|----|---------|---------|
| `PUBLIC_DATA` | Publiskie dati | Публичные данные |
| `USER_UPLOADED` | Lietotāja iesniegts | Загружено пользователем |
| `BOARD_VERIFIED` | Apstiprināts ar valdi | Подтверждено правлением |
| `PROFESSIONAL_VERIFIED` | Apstiprināts speciālistā | Подтверждено специалистом |

### `LegalConfidence`
| EN | LV (UI) | RU (UI) |
|----|---------|---------|
| `DRAFT` | Melnraksts | Черновик |
| `NEEDS_REVIEW` | Nepieciešama pārbaude | Требует проверки |
| `VALIDATED` | Validēts | Подтверждено |

### `BuildingProjectStatus` (заменяет старый `ProjectStatus`)
| EN | LV (UI) | RU (UI) |
|----|---------|---------|
| `NOT_READY` | Vēl nav gatavs | Ещё не готов |
| `READY_FOR_LOAN` | Gatavs ALTUM remonta aizdevumam | Готов к ремонтному кредиту |
| `READY_FOR_FUTURE_GRANT` | Gatavs nākamajam finansējuma logam | Готов к следующему окну финансирования |
| `IN_APPLICATION` | Iesniegts pieteikums | Заявка подана |
| `APPROVED` | Apstiprināts | Одобрено |
| `IN_CONSTRUCTION` | Būvniecībā | В стройке |
| `COMPLETED` | Pabeigts | Завершено |

### `DecisionType` (заменяет «vote» как универсальный термин)
| EN | LV (UI) | RU (UI) | Юридический смысл |
|----|---------|---------|-------------------|
| `PREPARATION_DECISION` | Lēmums par sagatavošanas uzsākšanu | Решение о начале подготовки | Не финальное, но юридически значимое |
| `REPRESENTATIVE_AUTHORIZATION` | Pilnvarotās personas iecelšana | Назначение уполномоченного лица | biedrība / apsaimniekotājs / проектный менеджер |
| `DATA_COLLECTION_CONSENT` | Datu apstrādes piekrišana | Согласие на обработку данных | GDPR-совместимый consent |
| `ENERGY_AUDIT_DECISION` | Lēmums par energoauditu | Решение об энергоаудите | Заказ сертификата |
| `PROGRAM_APPLICATION_DECISION` | Lēmums par dalību programmā | Решение об участии в программе | Финальное, после открытия окна |
| `LOAN_DECISION` | Lēmums par aizdevumu | Решение о кредите | Принятие долговой нагрузки |
| `SUPPLIER_SELECTION_DECISION` | Lēmums par piegādātāja izvēli | Решение о выборе поставщика | Утверждение результата тендера |

---

## Переименованные модули

| Старое название | Новое название (LV) | Новое название (RU) | EN ключ |
|-----------------|---------------------|---------------------|---------|
| Marketplace / Маркетплейс подрядчиков | **Piegādātāju atlases telpa** | **Комната выбора поставщиков** | `tender-room` |
| E-voting / Электронное голосование | **Lēmumu kampaņa** | **Кампания решений** | `decision-campaign` |
| ALTUM subsidy calculator | **Finansējuma scenāriju kalkulators** | **Калькулятор финансовых сценариев** | `financing-scenarios` |
| Renovation lead | **Mājas gatavības lieta** | **Дело о готовности дома** | `readiness-case` |
| AI forecast | **Provizoriskais novērtējums** | **Предварительная оценка** | `preliminary-estimate` |
| Audit module | **Izdevumu izpratnes modulis** | **Модуль понимания расходов** | `expense-insight` |

> Аудит остаётся в коде как `audit/`, но в UI-копирайте теперь — «Izdevumu izpratne» / «Понимание расходов» с ролью **trust artifact для собрания**, а не «выявление переплат как воронка к комиссии».

---

## Финансовые программы и термины (не переводим — фиксированные)

| Термин | Значение |
|--------|----------|
| **Altum** | Государственная финансовая институция Латвии |
| **mans.altum.lv** | Личный кабинет ALTUM для подачи заявок |
| **ALTUM remonta aizdevums** | Ремонтный кредит ALTUM (€10k+, 3.9%, до 30.06.2031) |
| **Sociālā klimata fonds (SCF)** | Social Climate Fund — общеевропейский фонд 2026-2032 |
| **Latvijas SCF plāns** | Latvijas Sociālā klimata fonda plāns 2026-2032 (MK rīkojums Nr.393, 2.07.2025) |
| **ETS2** | Новая система торговли выбросами для зданий и транспорта |
| **EIKIS** | Energoefektivitātes pakalpojumu komplektu informācijas sistēma — реестр уязвимых домохозяйств |
| **KPVIS** | Kohēzijas politikas fondu vadības informācijas sistēma |
| **KEM** | Klimata un enerģētikas ministrija (координирует SCF) |
| **EM** | Ekonomikas ministrija (отвечает за МКД-блок SCF) |
| **BIS** | Būvniecības informācijas sistēma |
| **BIS Mājas lieta** | Электронное «дело дома» в BIS — опросы, собрания, протоколы |
| **BVKB** | Būvniecības valsts kontroles birojs |
| **VZD** | Valsts zemes dienests |
| **Kadastrs / Zemesgrāmata** | Кадастр и Земельная книга |
| **MK noteikumi** | Правила Кабинета министров |

---

## Латвийские роли и субъекты

| LV | RU (пояснение) |
|----|----------------|
| **dzīvokļu īpašnieku kopība** | Сообщество собственников квартир (юридический субъект, существует автоматически) |
| **dzīvokļu īpašnieku biedrība** | Товарищество собственников квартир (зарегистрированное biedrība) |
| **mājas vecākais** | Старший по дому (избран собственниками) |
| **apsaimniekotājs** | Управляющий (юридическое лицо или ИП, обслуживает дом) |
| **pilnvarotā persona** | Уполномоченное лицо (та сторона, что подаёт заявку в ALTUM) |
| **ESCO** | Energy Service Company — компания энергосервиса |
| **projektu vadītājs** | Проектный менеджер |

---

## Формулировки, которые **запрещены** в UI и тексте

| Запрещено | Почему | Заменить на |
|-----------|--------|------------|
| «Подадим вашу заявку в ALTUM» | ALTUM 2021-2027 закрыта для новых заявок | «Подготовим дом к следующему окну финансирования» |
| «Получите субсидию» | Субсидия — не гарантия, зависит от правил MK и одобрения | «Предварительная оценка пригодности к субсидии» |
| «Реновация окупится» | Категоричное обещание | «Расчётный срок окупаемости — Х лет, при заданных условиях» |
| «Подрядчик уже готов» | Маркетплейс — не магазин подрядчиков | «Доступен прозрачный процесс выбора поставщика» |
| «Мы организуем e-voting» | BIS уже это умеет | «Подготовим решения собственников для подачи в BIS» |
| «1.5% комиссия с подрядчика» | Конфликт интересов | Удалить из публичных текстов |
| «Marketplace» | Английский в UI | **Piegādātāju atlases telpa** / **Комната выбора поставщиков** |

---

## Формулировки честности (CTA и тон)

| LV (UI) | RU (UI) | Где применять |
|---------|---------|---------------|
| Provizorisks novērtējums | Предварительная оценка | Все расчёты до проверки специалистом |
| Nepieciešams precizēt | Требует уточнения | Поля с low data confidence |
| Šobrīd jauni pieteikumi netiek pieņemti | Новые заявки сейчас не принимаются | Программы со статусом `CLOSED` |
| Māju var sagatavot iepriekš | Дом можно подготовить заранее | Главный CTA Phase 1 |
| Nākamais solis | Следующий шаг | Все экраны с next_best_action |
| Datu ticamība: zema / vidēja / augsta | Достоверность данных: низкая / средняя / высокая | Бенчмарки, расчёты, прогнозы |

---

## Примечания

1. Этот глоссарий **обновляется первым**, остальные документы — только потом.
2. Если в новом документе появляется термин, отсутствующий здесь — сначала добавляем сюда, потом используем.
3. Старые `knowledge/1.md`–`4.md` сохраняются как исторические заметки и **не должны диктовать** терминологию.
4. Источник идеи разворота: `v2.md` в корне репо (4 раунда диалога с независимым экспертом).
