import type { DecisionType } from '@prisma/client'

export interface DecisionTemplate {
  decisionType: DecisionType
  titleLv: string
  titleRu: string
  questionTextLv: string
  questionTextRu: string
  explanationTextLv: string
  explanationTextRu: string
  legalBasis: string
}

export const DECISION_TEMPLATES: Record<DecisionType, DecisionTemplate> = {
  PREPARATION_DECISION: {
    decisionType: 'PREPARATION_DECISION',
    titleLv: 'Lēmums par mājas sagatavošanas uzsākšanu',
    titleRu: 'Решение о начале подготовки дома',
    questionTextLv:
      'Vai dzīvokļu īpašnieki nobalso PAR mājas sagatavošanas uzsākšanu renovācijas finansējumam — enerģijas audita pasūtīšanu, dokumentu sagatavošanu un pieteikšanos pieejamajām finansēšanas programmām?',
    questionTextRu:
      'Голосуют ли собственники квартир ЗА начало подготовки дома к получению финансирования на реновацию — заказ энергоаудита, подготовку документов и подачу заявки в доступные программы финансирования?',
    explanationTextLv:
      'Šis lēmums uzsāk mājas sagatavošanas procesu. Tas nenozīmē nekādas finansiālas saistības. Pēc pozitīva balsojuma apsaimniekotājs vai biedrība sāks kārtot nepieciešamo dokumentāciju un apzinās finansēšanas iespējas.',
    explanationTextRu:
      'Это решение запускает процесс подготовки дома. Оно не означает никаких финансовых обязательств. После положительного голосования управляющая компания или biedrība начнёт оформлять необходимую документацию и изучать варианты финансирования.',
    legalBasis: 'Dzīvokļa īpašuma likums, 16. pants',
  },
  REPRESENTATIVE_AUTHORIZATION: {
    decisionType: 'REPRESENTATIVE_AUTHORIZATION',
    titleLv: 'Pilnvarotās personas iecelšana',
    titleRu: 'Назначение уполномоченного лица',
    questionTextLv:
      'Vai dzīvokļu īpašnieki pilnvaro [VĀRDS UZVĀRDS], personas kods [PERSONAS KODS], kā mājas pilnvaroto personu renovācijas sagatavošanas jautājumos, tostarp dokumentu parakstīšanai un iestādēm vērsšanās tiesībām?',
    questionTextRu:
      'Уполномочивают ли собственники квартир [ИМЯ ФАМИЛИЯ], личный код [КОД], в качестве уполномоченного представителя дома по вопросам подготовки к реновации, включая право подписи документов и обращения в органы?',
    explanationTextLv:
      'Pilnvarotā persona rīkosies mājas vārdā saziņā ar iestādēm, bankām un citām organizācijām renovācijas sagatavošanas laikā. Pilnvarojumu var atsaukt ar dzīvokļu īpašnieku lēmumu.',
    explanationTextRu:
      'Уполномоченное лицо будет действовать от имени дома при взаимодействии с органами, банками и другими организациями в ходе подготовки к реновации. Полномочия могут быть отозваны решением собственников.',
    legalBasis: 'Dzīvokļa īpašuma likums, 17. pants',
  },
  DATA_COLLECTION_CONSENT: {
    decisionType: 'DATA_COLLECTION_CONSENT',
    titleLv: 'Piekrišana personas datu apstrādei',
    titleRu: 'Согласие на обработку персональных данных',
    questionTextLv:
      'Vai dzīvokļu īpašnieki piekrīt savu personas datu (vārds, dzīvokļa numurs, kontaktinformācija) apstrādei ALTEKO platformā renovācijas sagatavošanas nolūkos saskaņā ar VDAR 6. panta 1. punkta (a) apakšpunktu?',
    questionTextRu:
      'Согласны ли собственники квартир на обработку своих персональных данных (имя, номер квартиры, контактная информация) на платформе ALTEKO в целях подготовки к реновации в соответствии со ст. 6(1)(а) GDPR?',
    explanationTextLv:
      'Dati tiks izmantoti tikai mājas renovācijas sagatavošanas procesā. Datu apstrāde notiek ALTEKO privātuma politikas ietvaros. Piekrišanu var atsaukt jebkurā laikā, rakstot uz info@alteko.lv.',
    explanationTextRu:
      'Данные будут использоваться только в процессе подготовки дома к реновации. Обработка данных осуществляется в соответствии с политикой конфиденциальности ALTEKO. Согласие может быть отозвано в любое время, написав на info@alteko.lv.',
    legalBasis: 'VDAR (GDPR), 6. panta 1. punkts (a)',
  },
  ENERGY_AUDIT_DECISION: {
    decisionType: 'ENERGY_AUDIT_DECISION',
    titleLv: 'Lēmums par ēkas energoaudita pasūtīšanu',
    titleRu: 'Решение о заказе энергоаудита здания',
    questionTextLv:
      'Vai dzīvokļu īpašnieki nobalso PAR ēkas enerģijas audita pasūtīšanu pie sertificēta enerģijas auditora, kura izmaksas tiks sadalītas starp dzīvokļu īpašniekiem proporcionāli to īpašuma daļai?',
    questionTextRu:
      'Голосуют ли собственники квартир ЗА заказ энергоаудита здания у сертифицированного энергоаудитора, расходы на который будут распределены между собственниками пропорционально их доле в праве собственности?',
    explanationTextLv:
      'Energoaudits ir obligāts priekšnoteikums ALTUM finansēšanas programmu pieteikumiem. Auditā tiek noskaidrots ēkas pašreizējais energoklase un aprēķinātas paredzamās renovācijas izmaksas un ietaupījumi.',
    explanationTextRu:
      'Энергоаудит является обязательным условием для подачи заявок в программы финансирования ALTUM. Аудит определяет текущий энергокласс здания и рассчитывает ожидаемые затраты на реновацию и экономию.',
    legalBasis: 'Ēku energoefektivitātes likums, 9. pants',
  },
  PROGRAM_APPLICATION_DECISION: {
    decisionType: 'PROGRAM_APPLICATION_DECISION',
    titleLv: 'Lēmums par pieteikumu renovācijas finansēšanas programmai',
    titleRu: 'Решение о подаче заявки в программу финансирования реновации',
    questionTextLv:
      'Vai dzīvokļu īpašnieki nobalso PAR pieteikuma iesniegšanu renovācijas finansēšanas programmai [PROGRAMMAS NOSAUKUMS], pilnvarojot [VĀRDS UZVĀRDS] iesniegt nepieciešamos dokumentus?',
    questionTextRu:
      'Голосуют ли собственники квартир ЗА подачу заявки в программу финансирования реновации [НАЗВАНИЕ ПРОГРАММЫ], уполномочивая [ИМЯ ФАМИЛИЯ] предоставить необходимые документы?',
    explanationTextLv:
      'Pozitīvs balsojums ļauj iesniegt pieteikumu finansēšanas programmai. Pieteikums pats par sevi nerada nekādas finansiālas saistības — tās rodas tikai tad, ja finansējums tiek apstiprināts un parakstīts līgums.',
    explanationTextRu:
      'Положительное голосование позволяет подать заявку в программу финансирования. Сама заявка не создаёт никаких финансовых обязательств — они возникают только при утверждении финансирования и подписании договора.',
    legalBasis: 'Dzīvokļa īpašuma likums, 19. pants',
  },
  LOAN_DECISION: {
    decisionType: 'LOAN_DECISION',
    titleLv: 'Lēmums par aizdevuma ņemšanu ēkas remontam',
    titleRu: 'Решение о получении кредита на ремонт здания',
    questionTextLv:
      'Vai dzīvokļu īpašnieki nobalso PAR aizdevuma ņemšanu ēkas renovācijai apmērā līdz [SUMMA] EUR ar atmaksas termiņu līdz [GADI] gadiem un procentu likmi [LIKME]% gadā?',
    questionTextRu:
      'Голосуют ли собственники квартир ЗА получение кредита на реновацию здания в размере до [СУММА] EUR со сроком погашения до [ГОДЫ] лет и процентной ставкой [СТАВКА]% годовых?',
    explanationTextLv:
      'Aizdevums tiks noformēts uz māju kā kopumu. Katrs dzīvokļa īpašnieks maksās savu aizdevuma daļu proporcionāli mājas kopīpašuma daļai. Aizdevuma atmaksa var būt iekļauta ikmēneša maksājumā par māju.',
    explanationTextRu:
      'Кредит будет оформлен на дом в целом. Каждый собственник квартиры будет выплачивать свою часть кредита пропорционально доле в общем имуществе дома. Выплата кредита может быть включена в ежемесячный платёж за дом.',
    legalBasis: 'Dzīvokļa īpašuma likums, 19. pants',
  },
  SUPPLIER_SELECTION_DECISION: {
    decisionType: 'SUPPLIER_SELECTION_DECISION',
    titleLv: 'Lēmums par izvēlētā būvuzņēmēja apstiprināšanu',
    titleRu: 'Решение об утверждении выбранного строительного подрядчика',
    questionTextLv:
      'Vai dzīvokļu īpašnieki apstiprina [UZŅĒMUMA NOSAUKUMS], reģistrācijas nr. [REĢNR.], kā ēkas renovācijas darbu izpildītāju par piedāvāto cenu [SUMMA] EUR, kas iegūta konkursa kārtībā?',
    questionTextRu:
      'Утверждают ли собственники квартир [НАЗВАНИЕ КОМПАНИИ], рег. номер [РЕГНР.], в качестве исполнителя работ по реновации здания за предложенную цену [СУММА] EUR, полученную по итогам тендера?',
    explanationTextLv:
      'Uzņēmums tika izvēlēts atklāta konkursa rezultātā. Vismaz 2 neatkarīgi piedāvājumi tika saņemti un novērtēti saskaņā ar ALTUM prasībām. Pilns konkursa protokols ir pieejams apskatei apsaimniekotājā.',
    explanationTextRu:
      'Компания была выбрана по результатам открытого тендера. Не менее 2 независимых предложений были получены и оценены в соответствии с требованиями ALTUM. Полный протокол тендера доступен для ознакомления у управляющего.',
    legalBasis: 'Dzīvokļa īpašuma likums, 19. pants; ALTUM prasības piegādātāju atlasei',
  },
}

export function getTemplate(decisionType: DecisionType): DecisionTemplate {
  return DECISION_TEMPLATES[decisionType]
}
