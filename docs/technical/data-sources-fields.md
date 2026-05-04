# Источники данных: полная карта полей

Этот документ описывает все поля каждого источника данных, используемого платформой ALTEKO.
Для каждого поля указано: сохраняем в БД / пропускаем / почему.

Обновлено: 2026-05-04

---

## 1. VAR aw_eka.csv — адреса зданий

**Источник:** data.gov.lv — VARIS atvertie dati  
**Формат:** CSV, UTF-8 BOM, запятая-разделитель, RFC 4180  
**Обновление:** еженедельно  
**Скрипт:** `scripts/sync-vzd.ts`  
**Спецификация:** varis_csv_specifikacija_v7

| Индекс | Имя колонки | Описание | Статус |
|--------|-------------|----------|--------|
| 0 | KODS | VAR-код адреса (vzdId в БД) | **Сохраняем** → `Building.vzdId` |
| 1 | TIPS_CD | Тип объекта: 108=ēka / apbūvei paredzēta zemes vienība | Пропускаем (фильтруем по FOR_BUILD) |
| 2 | STATUSS | EKS=существующий, DEL=удалённый, ERR=ошибка | **Фильтр** (только EKS) |
| 3 | APSTIPR | "Y" = подтверждён | Пропускаем |
| 4 | APST_PAK | Уровень подтверждения | Пропускаем |
| 5 | VKUR_CD | Код родительского объекта | Пропускаем |
| 6 | VKUR_TIPS | Тип родительского объекта | Пропускаем |
| 7 | NOSAUKUMS | Текущее наименование | Пропускаем |
| 8 | SORT_NOS | Наименование для сортировки | Пропускаем |
| 9 | ATRIB | Почтовый индекс (pasta indekss), напр. "LV-4211" | **Сохраняем** → `Building.postalCode` |
| 10 | PNOD_CD | Код почтового района | Пропускаем |
| 11 | DAT_SAK | Дата создания записи | Пропускаем |
| 12 | DAT_MOD | Дата последнего изменения | Пропускаем |
| 13 | DAT_BEIG | Дата удаления | Пропускаем |
| 14 | FOR_BUILD | "N"=ēka (здание), "Y"=земельный участок | **Фильтр** (только "N") |
| 15 | PLAN_ADR | "N"=привязан к КИС-кадастру, "Y"=плановый/непривязанный | **Сохраняем** → `Building.isPlanAddress` |
| 16 | STD | Полный адрес (текст) | **Сохраняем** → `Building.address` |
| 17 | KOORD_X | Центроид X, LKS-92 | Пропускаем (используем WGS-84) |
| 18 | KOORD_Y | Центроид Y, LKS-92 | Пропускаем (используем WGS-84) |
| 19 | DD_N | Широта WGS-84 | **Сохраняем** → `Building.lat` |
| 20 | DD_E | Долгота WGS-84 | **Сохраняем** → `Building.lon` |

**Итого:** 5 полей сохраняем, 2 используем как фильтр, 14 пропускаем.

---

## 2. VZD Building.ZIP — данные зданий (BuildingItemData)

**Источник:** data.gov.lv — Kadastra informācijas sistēmas atvertie dati  
**Формат:** ZIP с XML-файлами, CC-BY-4.0  
**Обновление:** еженедельно  
**Скрипт:** `scripts/sync-buildings.ts`

| Поле XML | Описание | Статус |
|----------|----------|--------|
| BuildingCadastreNr | Кадастровый номер здания (14 цифр) | **Сохраняем** → `Building.cadastralCode` |
| VARISCode | VAR-код адреса (minOccurs=0) | **Сохраняем** → `Building.vzdId` (для миграции VAR:xxx → реальный код) |
| BuildingArea | Общая площадь м² | **Сохраняем** → `Building.totalAreaM2` |
| BuildingGroundFloors | Количество наземных этажей | **Сохраняем** → `Building.floorCount` |
| BuildingPregCount | Количество квартир / помещений | **Сохраняем** → `Building.apartmentCount` |
| BuildingExploitYear | Год эксплуатации (xs:gYear) | **Сохраняем** → `Building.constructionYear` |
| BuildingMaterialKind > MaterialKindName | Материал стен (первичный) | **Сохраняем** → `Building.wallMaterial` |
| ConstructionDataList (Sienas...) | Материал стен (резервный) | **Сохраняем** → `Building.wallMaterial` (если primary пуст) |
| Все прочие поля | Техническая детализация | Пропускаем |

---

## 3. VZD Building.ZIP — данные квартир (PremiseGroupItemData)

**Источник:** тот же ZIP, что и BuildingItemData  
**Скрипт:** `scripts/sync-premises.ts`  
**Модель:** `BuildingUnit`

> **Предупреждение:** Имя тега `PremiseGroupItemData` основано на шаблоне XSD-схемы.
> Если скрипт находит 0 записей — запустите с `KEEP_TEMP_FILES=true` и проверьте
> реальный XML, чтобы уточнить имя тега.

| Поле XML | Описание | Статус |
|----------|----------|--------|
| PremiseCadastreNr | Кадастровый номер квартиры (уникальный ключ) | **Сохраняем** → `BuildingUnit.cadastralCode` |
| BuildingCadastreNr | Кадастровый номер родительского здания | **Сохраняем** → `BuildingUnit.buildingCadastralCode` |
| PremiseTotalArea | Полезная площадь м² | **Сохраняем** → `BuildingUnit.areaM2` |
| PremiseFloor | Номер этажа (может быть диапазоном; берём первый) | **Сохраняем** → `BuildingUnit.floor` |
| PremiseRoomsCount | Количество комнат | **Сохраняем** → `BuildingUnit.roomCount` |
| Прочие поля | Дополнительные характеристики | Пропускаем |

---

## 4. BVKB — энергетические сертификаты

**Источник:** data.gov.lv — dataset `bis_ygdi8jmgg-bneuijz7wiwq`  
**Формат:** CSV, UTF-8 BOM, запятая-разделитель, 52 колонки  
**Обновление:** ежедневно  
**Скрипт:** `scripts/sync-bvkb.ts`  
**Примечание:** С февраля 2025 г. функции BVKB переданы EVA, данные продолжают публиковаться на data.gov.lv.

| Индекс | Latvian название | Описание | Статус |
|--------|-----------------|----------|--------|
| 0 | Dokumenta_numurs | Номер документа сертификата | Пропускаем (не уникален в Building) |
| 1 | Apzimejums | Обозначение | Пропускаем |
| 2 | Statuss | "Ir spēkā" (действующий) / "Zaudējis spēku" (утратил силу) | **Фильтр** (только "Ir spēkā") |
| 3 | Izdosanas_datums | Дата выдачи сертификата (YYYY-MM-DD) | **Сохраняем** → `Building.bvkbCertDate` |
| 4 | Deriguma_termins | Срок действия | Пропускаем |
| 5 | Klients | Заказчик | Пропускаем |
| 6 | Pakalpojuma_sniedzejs | Исполнитель (компания) | Пропускаем |
| 7 | Sertifikators | Сертификатор | Пропускаем |
| 8 | Objekta_nosaukums | Наименование объекта | Пропускаем |
| 9 | Objekta_adrese | Адрес объекта | Пропускаем (используем Building.address из VAR) |
| 10 | Novads | Край / район | Пропускаем |
| 11 | Objektu_identificejosie_kadastra_apzimejumi | Кадастровый код (или несколько через ";") | **Ключ** поиска → `Building.cadastralCode` |
| 12 | Objektu_skaits | Количество объектов | Пропускаем |
| 13 | Ekas_veids | Тип здания | Пропускаем |
| 14 | Parbuves_gads | Год реновации (целое, nullable) | **Сохраняем** → `Building.renovationYear` |
| 15 | Buvniecibas_gads | Год постройки | Пропускаем (используем Building.ZIP) |
| 16 | Stavu_skaits | Количество этажей | Пропускаем (используем Building.ZIP) |
| 17 | Apkurinata_platiba | Отапливаемая площадь м² | Пропускаем |
| 18 | Dzivoklu_skaits | Количество квартир | Пропускаем (используем Building.ZIP) |
| 19 | Apkures_veids | Тип отопления | Пропускаем |
| 20 | Energija_apkurei_kwh_m_2_gada | Тепловая энергия на отопление кВт·ч/м²/год | **Сохраняем** → `Building.heatingEnergyKwhM2` |
| 21 | Energija_udenssildisanai_kwh_m_2_gada | Энергия на ГВС кВт·ч/м²/год | Пропускаем |
| 22 | Energija_ventilacijai_kwh_m_2_gada | Энергия на вентиляцию кВт·ч/м²/год | Пропускаем |
| 23 | Energija_kondicionesanai_kwh_m_2_gada | Энергия на кондиционирование кВт·ч/м²/год | Пропускаем |
| 24 | Energija_apgaismojumam_kwh_m_2_gada | Энергия на освещение кВт·ч/м²/год | Пропускаем |
| 25 | Ekas_energoefektivitates_klase | Класс энергоэффективности A–G | **Сохраняем** → `Building.energyClass` |
| 26 | Ekas_energoefektivitates_skaitliska_vertiba | Числовое значение класса | Пропускаем |
| 27 | Primara_kopeja_energija | Суммарная первичная энергия кВт·ч/м²/год | **Сохраняем** → `Building.primaryEnergyKwhM2` |
| 28 | Primara_no_atjaunojamajiem_avotiem | Первичная энергия из ВИЭ кВт·ч/м²/год | Пропускаем |
| 29 | Kopeja_primara_energija_apkurei | Первичная на отопление кВт·ч/м²/год | Пропускаем |
| 30 | Kopeja_primara_energija_udenssildisanai | Первичная на ГВС кВт·ч/м²/год | Пропускаем |
| 31 | Kopeja_primara_energija_ventilacijai | Первичная на вентиляцию кВт·ч/м²/год | Пропускаем |
| 32 | Kopeja_primara_energija_kondicionesanai | Первичная на кондиционирование кВт·ч/м²/год | Пропускаем |
| 33 | Kopeja_primara_energija_apgaismojumam | Первичная на освещение кВт·ч/м²/год | Пропускаем |
| 34 | Oglekla_dioksida_emisijas_novertejums_kg_co_2_m_2 | Выбросы CO₂ кг/м²/год | **Сохраняем** → `Building.co2KgM2` |
| 35 | Rekomendetie_pasak_investiciju_atmaksasanas_periods | Рекомендуемый период окупаемости инвестиций | Пропускаем |
| 36 | Pilnveide_klase | Класс после улучшения | Пропускаем |
| 37 | Pilnveide_skaitliska_vertiba | Числовое значение класса после улучшения | Пропускаем |
| 38 | Pilnveide_primara_kopeja_energija | Первичная энергия после улучшения | Пропускаем |
| 39 | Pilnveide_oglekla_dioksida_emisijas | CO₂ после улучшения | Пропускаем |
| 40 | Pilnveide_energija_apkurei | Тепловая после улучшения | Пропускаем |
| 41 | Rekomendacija_1 | Рекомендация 1 (текст) | Пропускаем |
| 42 | Rekomendacija_2 | Рекомендация 2 (текст) | Пропускаем |
| 43 | Rekomendacija_3 | Рекомендация 3 (текст) | Пропускаем |
| 44 | Rekomendacija_4 | Рекомендация 4 (текст) | Пропускаем |
| 45 | Rekomendacija_5 | Рекомендация 5 (текст) | Пропускаем |
| 46 | Rekomendacija_6 | Рекомендация 6 (текст) | Пропускаем |
| 47 | Ekas_platiba_ikgadejas_apkures_pasaku_ietekmes | Площадь под сезонными мерами | Пропускаем |
| 48 | Datu_avots | Источник данных | Пропускаем |
| 49 | Energoauditora_vards_uzvards | Имя энергоаудитора | Пропускаем |
| 50 | Energoauditora_sertifikata_numurs | Номер сертификата аудитора | Пропускаем |
| 51 | Bvkb_datu_izlades_datums | Дата выгрузки данных BVKB | Пропускаем |

**Итого:** 6 полей сохраняем, 1 ключ поиска, 1 фильтр, 44 пропускаем.

---

## 5. tg_darjumi — сделки с квартирами

**Источник:** data.gov.lv — Darījumi ar telpu grupām  
**Формат:** CSV, UTF-8 BOM, запятая-разделитель, 37 колонок  
**Обновление:** еженедельно  
**Скрипт:** `scripts/sync-transactions.ts`  
**Модель:** `ApartmentTransaction`

| Индекс | Имя (из спецификации) | Описание | Статус |
|--------|----------------------|----------|--------|
| 0 | DeaId | ID сделки (уникальный) | **Сохраняем** → `ApartmentTransaction.deaId` |
| 1 | ObjType | Тип: Dz=квартира, Dz-G=гараж и т.д. | **Фильтр** + **Сохраняем** → `objType` |
| 2 | ProCadNr | Кадастровый номер объекта (квартира) | **Сохраняем** → `propertyCadNr` |
| 3 | Std | Полный адрес (с номером квартиры) | **Сохраняем** → `address` |
| 4 | ArDistrict | Район (novads) | **Сохраняем** → `district` |
| 5 | ArCity | Город | **Сохраняем** → `city` |
| 6 | ArParish | Волость (pagasts) | Пропускаем |
| 7 | DeaDate | Дата сделки YYYY-MM-DD | **Сохраняем** → `transactionDate` |
| 8 | DeaAmount | Сумма сделки EUR | **Сохраняем** → `priceEur` |
| 9 | DeaType | Тип сделки | Пропускаем |
| 10 | DeaNote | Примечание | Пропускаем |
| 11 | BuiCount_Total | Всего зданий | Пропускаем |
| 12 | BuiCount_Res | Жилых зданий | Пропускаем |
| 13 | BuiCount_NonRes | Нежилых зданий | Пропускаем |
| 14 | BuiCount_Other | Прочих зданий | Пропускаем |
| 15 | BuiCount | Зданий в сделке | Пропускаем |
| 16 | BuiCadNr | Кадастровый номер здания (→ Building.cadastralCode) | **Сохраняем** → `buildingCadNr` |
| 17 | BuiAddress | Адрес здания | Пропускаем |
| 18 | BuiDistrict | Район здания | Пропускаем |
| 19 | BuiCity | Город здания | Пропускаем |
| 20 | BuiUtCode | Код использования здания (1122=многоквартирный) | **Сохраняем** → `buildingUseCode` |
| 21 | BuiEnergyClass | Класс энергоэффективности | Пропускаем (используем BVKB) |
| 22 | BuiEnergyCons | Потребление энергии | Пропускаем (используем BVKB) |
| 23 | BuiTotalArea | Общая площадь здания м² | **Сохраняем** → `buildingAreaM2` |
| 24 | BuiResArea | Жилая площадь здания | Пропускаем |
| 25 | MaterialKind | Материал стен | **Сохраняем** → `wallMaterial` |
| 26 | BuiExploitYear | Год постройки здания | **Сохраняем** → `buildingYear` |
| 27 | Deprecation | Уровень износа (V1–V4) | **Сохраняем** → `depreciation` |
| 28 | PregCount | Кол-во помещений в сделке | Пропускаем |
| 29 | PregType | Тип помещения | Пропускаем |
| 30 | PregCadNr | Кадастровый номер квартиры | **Сохраняем** → `apartmentCadNr` |
| 31 | PregAddress | Адрес квартиры | Пропускаем (дублирует Std) |
| 32 | PregArea | Площадь помещения (общая) | Пропускаем |
| 33 | PregResArea | Жилая площадь помещения | Пропускаем |
| 34 | PregFloorMin | Минимальный этаж | **Сохраняем** → `floorMin` |
| 35 | PregFloorMax | Максимальный этаж | **Сохраняем** → `floorMax` |
| 36 | PregTotalArea | Полезная площадь квартиры м² | **Сохраняем** → `apartmentAreaM2` |

**Итого:** 14 полей сохраняем, 1 фильтр, 22 пропускаем.

---

## 6. LVM GeoServer WFS

**Источник:** geoserver.lvm.lv — WFS сервис кадастра  
**Формат:** GeoJSON по запросу  
**Обновление:** по запросу (при поиске адреса пользователем)  
**Скрипт:** `/api/address/resolve` (Next.js API Route)

| Поле | Описание | Статус |
|------|----------|--------|
| cadastre_number | Реальный 14-значный кадастровый номер | **Сохраняем** — мигрирует VAR:xxx → реальный код |
| geometry | Контур участка / полигон | Пропускаем |
| address | Адрес из кадастра | Пропускаем (используем VAR STD) |
| Прочие поля | Метаданные WFS | Пропускаем |

---

## 7. Jāņa sēta API

**Источник:** api.kartes.lv / jana.lv  
**Формат:** JSON по запросу  
**Обновление:** по запросу (автодополнение адреса в UI)  
**Скрипт:** `/api/address/search` (Next.js API Route)

| Поле | Описание | Статус |
|------|----------|--------|
| displayName | Полная строка адреса | **Используем** в UI (не сохраняем в БД) |
| addressCode | VAR KODS (vzdId) | **Используем** для связи с Building |
| coordinates | lat/lon WGS-84 | Пропускаем (берём из VAR) |
| Прочие поля | Метаданные геокодирования | Пропускаем |

---

## 8. Не реализовано

Следующие источники определены в схеме (модели существуют) но синхронизация не запущена:

| Источник | Модель | Причина |
|----------|--------|---------|
| VZD CadastralValue (data.gov.lv) | `CadastralValue` | Низкий приоритет; нужен только для оценки стоимости реновации |
| CSP PriceIndex (stat.gov.lv API) | `PriceIndex` | Низкий приоритет; квартальные данные CSP |
| Open-Meteo / климатические данные | — | Не предусмотрено в текущей архитектуре |
| SPRK тарифы | `UtilityTariff` | Ручное обновление; частота изменений низкая |
| Zemesgrāmata (земельная книга) | — | API отсутствует; используется ручной CSV от правления дома |
