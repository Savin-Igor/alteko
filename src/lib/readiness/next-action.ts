/**
 * nextBestAction logic for Building Readiness Score.
 *
 * Returns a single localized string (LV primary, RU optional) that tells
 * the building what to do next. This is the most visible output of the
 * Readiness Engine — shown as one CTA line in the UI.
 *
 * Rules are ordered by priority: data completeness → energy → documents
 * → decisions → financing window.
 */

import { DataConfidence, DecisionType } from '@prisma/client'

export interface NextActionInput {
  dataConfidenceStatus: DataConfidence
  energyScore: number | null
  documentReadinessScore: number | null
  ownerDecisionReadinessScore: number | null
  passedDecisionTypes: DecisionType[]
  scfWindowStatus: 'CLOSED' | 'EXPECTED' | 'OPEN' | 'UNKNOWN'
  altumLoanEligible: boolean
  supplierSelectionStatus: string
}

export interface NextActionResult {
  lv: string
  ru: string
}

export function computeNextBestAction(input: NextActionInput): NextActionResult {
  const {
    dataConfidenceStatus,
    energyScore,
    documentReadinessScore,
    ownerDecisionReadinessScore,
    passedDecisionTypes,
    scfWindowStatus,
    altumLoanEligible,
    supplierSelectionStatus,
  } = input

  // Priority 1: no user data at all — suggest ordering a Readiness Report
  if (dataConfidenceStatus === DataConfidence.PUBLIC_DATA) {
    return {
      lv: 'Pasūtiet Gatavības atskaiti, lai iegūtu pilnu mājas analīzi',
      ru: 'Закажите Отчёт о готовности для полного анализа дома',
    }
  }

  // Priority 2: critical energy data missing
  if (energyScore === null) {
    return {
      lv: 'Nepieciešams aktuāls energosertifikāts — sazinieties ar BVKB',
      ru: 'Необходим актуальный энергосертификат — обратитесь в BVKB',
    }
  }

  // Priority 3: very low energy score — critical losses
  if (energyScore < 25) {
    return {
      lv: 'Enerģijas zudumos ir ļoti augsti — apsvēriet SCF atbalsta paketi',
      ru: 'Очень высокие энергопотери — рассмотрите пакет поддержки SCF',
    }
  }

  // Priority 4: documents incomplete
  if (documentReadinessScore !== null && documentReadinessScore < 50) {
    return {
      lv: 'Sagatavojiet trūkstošos dokumentus (skatiet dokumentu kontrolsarakstu)',
      ru: 'Подготовьте недостающие документы (см. чек-лист документов)',
    }
  }

  // Priority 5: preparation decision missing
  if (!passedDecisionTypes.includes(DecisionType.PREPARATION_DECISION)) {
    return {
      lv: 'Uzsāciet īpašnieku lēmumu kampaņu par sagatavošanās uzsākšanu',
      ru: 'Запустите кампанию решений собственников о начале подготовки',
    }
  }

  // Priority 6: representative authorization missing
  if (!passedDecisionTypes.includes(DecisionType.REPRESENTATIVE_AUTHORIZATION)) {
    return {
      lv: 'Nepieciešams pilnvaroto personu iecelšanas lēmums',
      ru: 'Необходимо решение о назначении уполномоченного лица',
    }
  }

  // Priority 7: data collection consent missing
  if (!passedDecisionTypes.includes(DecisionType.DATA_COLLECTION_CONSENT)) {
    return {
      lv: 'Iegūstiet īpašnieku piekrišanu datu apstrādei (VDAR)',
      ru: 'Получите согласие собственников на обработку данных (GDPR)',
    }
  }

  // Priority 8: all mandatory decisions passed — check financing window
  if (ownerDecisionReadinessScore !== null && ownerDecisionReadinessScore >= 100) {
    if (scfWindowStatus === 'OPEN') {
      return {
        lv: 'Māja ir gatava — iesniedziet pieteikumu caur mans.altum.lv',
        ru: 'Дом готов — подайте заявку через mans.altum.lv',
      }
    }

    if (scfWindowStatus === 'EXPECTED') {
      return {
        lv: 'Māja ir gatava. Gaidām SCF finansējuma logu (paredzams 2027. gada 2. ceturksnī)',
        ru: 'Дом готов. Ждём открытия окна SCF (ожидается Q2 2027)',
      }
    }

    if (altumLoanEligible) {
      return {
        lv: 'Apsveriet ALTUM remonta aizdevumu kā pieejamu alternatīvu (3,9%, līdz 2031. gadam)',
        ru: 'Рассмотрите ALTUM remonta aizdevums как доступную альтернативу (3,9%, до 2031)',
      }
    }
  }

  // Priority 9: supplier selection
  if (supplierSelectionStatus === 'NOT_STARTED' || supplierSelectionStatus === 'INITIATED') {
    return {
      lv: 'Atveriet Piegādātāju atlases telpu, lai uzsāktu piegādātāja izvēli',
      ru: 'Откройте Тендерную комнату для начала выбора поставщика',
    }
  }

  // Default fallback
  return {
    lv: 'Turpiniet mājas sagatavošanu — pārbaudiet Gatavības atskaiti',
    ru: 'Продолжайте подготовку дома — проверьте Отчёт о готовности',
  }
}
