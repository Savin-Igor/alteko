export interface Settlement {
  lv: string   // official Latvian name — used for Nominatim queries
  ru: string   // Russian name — displayed when locale=ru
}

// All Latvian cities, towns, and major urban settlements.
// Sorted: republican cities first, then alphabetically.
export const LATVIA_SETTLEMENTS: Settlement[] = [
  // Republican cities
  { lv: 'Rīga',       ru: 'Рига' },
  { lv: 'Daugavpils', ru: 'Даугавпилс' },
  { lv: 'Jelgava',    ru: 'Елгава' },
  { lv: 'Jēkabpils',  ru: 'Екабпилс' },
  { lv: 'Jūrmala',    ru: 'Юрмала' },
  { lv: 'Liepāja',    ru: 'Лиепая' },
  { lv: 'Rēzekne',    ru: 'Резекне' },
  { lv: 'Valmiera',   ru: 'Валмиера' },
  { lv: 'Ventspils',  ru: 'Вентспилс' },

  // Rīga metropolitan area
  { lv: 'Salaspils',   ru: 'Саласпилс' },
  { lv: 'Mārupe',      ru: 'Маруpe' },
  { lv: 'Olaine',      ru: 'Олайне' },
  { lv: 'Ādaži',       ru: 'Адажи' },
  { lv: 'Ķekava',      ru: 'Кекава' },
  { lv: 'Ogre',        ru: 'Огре' },
  { lv: 'Ikšķile',     ru: 'Икшкиле' },
  { lv: 'Saulkrasti',  ru: 'Саулкрасти' },
  { lv: 'Sigulda',     ru: 'Сигулда' },
  { lv: 'Carnikava',   ru: 'Царникава' },
  { lv: 'Ropaži',      ru: 'Ропажи' },
  { lv: 'Stopiņi',     ru: 'Стопини' },
  { lv: 'Vangaži',     ru: 'Вангажи' },
  { lv: 'Baldone',     ru: 'Балдоне' },

  // Vidzeme
  { lv: 'Cēsis',       ru: 'Цесис' },
  { lv: 'Limbaži',     ru: 'Лимбажи' },
  { lv: 'Smiltene',    ru: 'Смилтене' },
  { lv: 'Alūksne',     ru: 'Алуксне' },
  { lv: 'Gulbene',     ru: 'Гулбене' },
  { lv: 'Madona',      ru: 'Мадона' },
  { lv: 'Aizkraukle',  ru: 'Айzkраукле' },
  { lv: 'Pļaviņas',    ru: 'Плявиняс' },
  { lv: 'Koknese',     ru: 'Кокнесе' },
  { lv: 'Skrīveri',    ru: 'Скривери' },
  { lv: 'Viesīte',     ru: 'Виесите' },
  { lv: 'Valka',       ru: 'Валка' },
  { lv: 'Strenči',     ru: 'Стренчи' },

  // Zemgale
  { lv: 'Bauska',      ru: 'Бауска' },
  { lv: 'Dobele',      ru: 'Добеле' },
  { lv: 'Tukums',      ru: 'Тукумс' },
  { lv: 'Auce',        ru: 'Ауце' },
  { lv: 'Kandava',     ru: 'Кандава' },
  { lv: 'Sabile',      ru: 'Сабиле' },

  // Kurzeme
  { lv: 'Talsi',       ru: 'Талси' },
  { lv: 'Saldus',      ru: 'Салдус' },
  { lv: 'Kuldīga',     ru: 'Кулдига' },
  { lv: 'Aizpute',     ru: 'Айзпуте' },
  { lv: 'Pāvilosta',   ru: 'Павилоста' },
  { lv: 'Grobiņa',     ru: 'Гробиня' },
  { lv: 'Durbe',       ru: 'Дурбе' },
  { lv: 'Priekule',    ru: 'Приекуле' },
  { lv: 'Skrunda',     ru: 'Скрунда' },
  { lv: 'Engure',      ru: 'Энгуре' },

  // Latgale
  { lv: 'Preiļi',      ru: 'Прейли' },
  { lv: 'Ludza',       ru: 'Лудза' },
  { lv: 'Krāslava',    ru: 'Краслава' },
  { lv: 'Balvi',       ru: 'Балви' },
  { lv: 'Viļāni',      ru: 'Вилани' },
  { lv: 'Varakļāni',   ru: 'Варакляни' },
  { lv: 'Dagda',       ru: 'Дагда' },
  { lv: 'Viļaka',      ru: 'Вилака' },
  { lv: 'Kārsava',     ru: 'Карсава' },
  { lv: 'Zilupe',      ru: 'Зилупе' },
  { lv: 'Krustpils',   ru: 'Крустпилс' },
]

export function filterSettlements(input: string): Settlement[] {
  if (!input.trim()) return []
  const q = input.toLowerCase()
  return LATVIA_SETTLEMENTS.filter(
    (s) => s.lv.toLowerCase().includes(q) || s.ru.toLowerCase().includes(q),
  ).slice(0, 8)
}
