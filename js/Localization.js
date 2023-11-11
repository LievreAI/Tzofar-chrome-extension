var DRILLS_THREAT_ID = 9;
var THREATS_TITLES = {
  0: {
    he: "צבע אדום",
    en: "Red Alert",
    ru: "Цева Адом",
    ar: "اللون الأحمر",
    es: "Rojo Color",
  },
  1: {
    //short: אירוע חומרים מסוכנים
    he: "אירוע חומרים מסוכנים",
    //short: Hazardous Materials
    en: "Hazardous Materials Incident",
    //short: опасных веществ
    ru: "Утечка опасных веществ",
    //short: المواد الخطرة
    ar: "حادثة المواد الخطرة",
    //short: materiales peligrosos
    es: "materiales peligrosos incidente",
  },
  2: {
    //short: חשש לחדירת מחבלים
    he: "חשש לחדירת מחבלים",
    //short: Terorists Infiltration
    en: "Fear of Terrorists infiltration",
    //short: Проникновение террористов
    ru: "Подозрение на проникновение террористов",
    ar: "تسلل مخربين",
    es: "Terroristas infiltración",
  },
  3: {
    he: "רעידת אדמה",
    en: "Earthquake",
    ru: "Землетрясение",
    ar: "هزة أرضية",
    es: "Terremoto",
  },
  4: {
    he: "חשש לצונאמי",
    en: "Fear of a tsunami",
    ru: "Угроза цунами",
    ar: "تحسبا للتسونامي",
    es: "Amenaza de tsunami",
  },
  5: {
    he: "חדירת כלי טיס עוין",
    en: "Hostile aircraft intrusion",
    ru: "Проникновение беспилотного самолета",
    ar: "تسلل طائرة بدون طيار",
    es: "infiltración de aviones no tripulados",
  },
  6: {
    he: "חשש לאירוע רדיולוגי",
    //short: Radiological incident
    en: "Fear of a Radiological incident",
    ru: "Радиоактивная опасность",
    ar: "حدث إشعاعي",
    es: "Radiológico Incidente",
  },
  7: {
    he: "ירי בלתי קונבנציונלי",
    en: "Non-conventional missile",
    ru: "Неконвенциональная ракета",
    ar: "صاروخ غير تقليدي",
    es: "misil no convencional",
  },
  8: {
    he: "התרעה",
    en: "Alert",
    ru: "предупреждение",
    ar: "تحذير",
    es: "advertencia",
  },
  9: {
    he: "תרגיל פיקוד העורף",
    en: "Home Front Command Drill",
    ru: "Учения Службы Тыла",
    ar: "تمرين",
    es: "Ejercicio",
  },
};

var SELECTION_DESC = {
  he: "יוצגו התרעות על אזעקות בכל הארץ.<br><br>ניתן לקבל התרעות עבור יישובים מסויימים בלבד, על ידי חיפוש שמות היישובים בתיבת החיפוש.",
  en: "Alerts will be received for the entire country.<br><br>You can receive alerts only for specific cities, by adding them to the list through the search box above.",
  es: "Se recibirán alertas para todo el país.<br><br>Puede recibir alertas solo para ciudades específicas, agregándolas a la lista a través del cuadro de búsqueda de arriba.",
  ar: "سيتم استلام التنبيهات للبلد بأكمله.<br><br>يمكنك تلقي التنبيهات لمدن معينة فقط ، عن طريق إضافتها إلى القائمة من خلال مربع البحث أعلاه.",
  ru: "Оповещения будут приходить для всей страны.<br><br>Вы можете получать оповещения только для определенных городов, добавив их в список через окно поиска выше.",
};

var STRINGS = {
  /* App */
  appName: {
    he: "צופר - צבע אדום",
    en: "Tzofar - Red Alert",
    es: "Tzofar - color rojo",
    ar: "تسوفار - انذار احمر",
    ru: "Цофар - Цева Адом",
  },

  /* Popup.html */
  recentAlerts: {
    he: "התרעות אחרונות",
    en: "Recent Alerts",
    es: "Últimas alarmas",
    ar: "الانذارات الاخيره",
    ru: "Последние Оповещения",
  },
  sounds: {
    he: "צליל",
    en: "Sounds",
    es: "Sonidos",
    ar: "رنين",
    ru: "Звуки",
  },
  cities: {
    he: "יישובים",
    en: "Cities",
    es: "Ciudades",
    ar: "المدن",
    ru: "Города",
  },
  other: {
    he: "אחר",
    en: "Other",
    es: "Otro",
    ar: "آخر",
    ru: "Другой",
  },
  /* Popup - Select sound */
  selectSoundTitle: {
    he: "בחירת צליל התרעה",
    en: "Select Sound",
    es: "Sonido de alerta",
    ar: "صوت للتنبيه",
    ru: "Звук сигнала",
  },
  selectSoundDesc: {
    he: "בחר את הצליל שיושמע בזמן קבלת התרעה",
    en: "Select a sound for incoming alerts",
    es: "Seleccionar el sonido de la notificación de alarma",
    ar: "حدد صوتًا للتنبيهات الواردة",
    ru: "Выбрать звук  при тревоге",
  },
  /* Popup - Read cities */
  readCities: {
    he: "חיווי קולי (עברית)",
    en: "Voice announcement (English)",
    es: "Leyendo las ciudades (hebreo)",
    ar: "قراءة أسماء المدن (بالعربية)",
    ru: "Прочитайте названия городов (русский)",
  },
  readCitiesDesc: {
    he: "הקראה של שמות היישובים ושם האיום",
    en: "Alerts will read the names of the alerted cities and the threat",
    es: "Las alertas leerán los nombres de las ciudades",
    ar: "ستقرأ التنبيهات أسماء المدن باللغة العربية",
    ru: "Оповещения будут читать названия городов на русском языке",
  },
  /* Popup - Sound names */
  bell: {
    he: "פעמון (ברירת מחדל)",
    en: "Bell (default)",
    es: "Campana (Defecto)",
    ar: "جرس (تقصير)",
    ru: "Белл (по умолчанию)",
  },
  tone: {
    he: "חד",
    en: "Twang",
    es: "Tañido",
    ar: "توانج",
    ru: "звон",
  },
  alarm: {
    he: "אזעקה",
    en: "Alarm",
    es: "Alarma",
    ar: "صفارة إنذار",
    ru: "Сирена",
  },
  redalert: {
    he: "צבע אדום",
    en: "Red Alert",
    es: "Color rojo",
    ar: "اللون الأحمر",
    ru: "Цева Адом",
  },
  redalert2: {
    he: "צבע אדום (קצר)",
    en: "Red Alert (short)",
    es: "Color rojo (corto)",
    ar: "اللون الأحمر (قصير)",
    ru: "Цева Адом (короткий)",
  },
  redalert3: {
    he: "צבע אדום (ארוך)",
    en: "Red Alert (long)",
    es: "Color rojo (largo)",
    ar: "اللون الأحمر (طويل)",
    ru: "Цева Адом (длинный)",
  },
  warning: {
    he: "אזהרה",
    en: "Warning",
    es: "Advertencia",
    ar: "إنذار",
    ru: "Предупреждение",
  },
  message: {
    he: "הודעה",
    en: "Message",
    es: "Mensaje",
    ar: "رسالة",
    ru: "Сообщение",
  },
  secondary: {
    he: "משנה",
    en: "Secondary",
    es: "Secundario",
    ar: "ثانوي",
    ru: "второстепенный",
  },
  alert: {
    he: "התרעה",
    en: "Alert",
    es: "Alerta",
    ar: "يحذر",
    ru: "тревога",
  },
  calm: {
    he: "רגוע",
    en: "Calm",
    es: "Tranquilo",
    ar: "بارد الاعصاب",
    ru: "Спокойный",
  },
  bip: {
    he: "צפצוף",
    en: "Bip",
    es: "Bip",
    ar: "بيب",
    ru: "бип",
  },
  silent: {
    he: "שקט",
    en: "Silent",
    es: "Silencio",
    ar: "صامتة",
    ru: "Тихий",
  },

  /* Popup - Select cities */
  selectCitiesTitle: {
    he: "בחירת יישובי עניין",
    en: "Select cities",
    es: "Seleccionar ciudades",
    ar: "حدد المدن",
    ru: "Выберите города",
  },
  selectCitiesDesc: {
    he: "בחר את היישובים עבורם אתה מעוניין לקבל התרעות",
    en: "Select the cities you want to be alerted to",
    es: "Seleccione las ciudades sobre las que desea recibir una alerta",
    ar: "حدد المدن التي تريد تنبيهك إليها",
    ru: "Выберите города, о которые вы хотите получать оповещения",
  },
  clearSelection: {
    he: "נקה בחירה",
    en: "Clear all",
    es: "Borrar selección",
    ar: "احذف كل شيء",
    ru: "Очистить выделение",
  },
  searchCities: {
    he: "הזן את שם היישוב...",
    en: "Search city name...",
    es: "Encontrar el asentamiento...",
    ar: "البحث عن اسم المنطقة...",
    ru: "Ищите поселение...",
  },

  /* Popup - Other */
  otherTitle: {
    he: "הגדרות נוספות",
    en: "Advanced",
    es: "Opciones",
    ar: "المتقدمة",
    ru: "Расширенные",
  },
  alertsTitle: {
    he: "הגדרת התרעות",
    en: "Advanced Alerts",
    es: "Alertas Avanzadas",
    ar: "تنبيهات متقدمة",
    ru: "Расширенный агент",
  },
  desktopNotifications: {
    he: "השתמש בהתרעות מערכת ההפעלה, במקום חלון קופץ",
    en: "Use desktop notifications instead of a pop-up window",
    es: "Use notificaciones de escritorio",
    ar: "استخدم إشعارات سطح المكتب بدلاً من النافذة المنبثقة",
    ru: "Используйте уведомления на рабочем столе вместо всплывающего окна",
  },
  backgroundHidePopup: {
    he: "מנע מהתרעות לקפוץ במהלך שימוש בתוכנות אחרות",
    en: "Prevent alerts from popping up while using other software",
    es: "Evite que aparezcan alertas mientras usa otro software",
    ar: "منع التنبيهات من الظهور أثناء استخدام برامج أخرى",
    ru: "Предотвращение появления предупреждений при использовании другого программного обеспечения",
  },
  alertsOverSites: {
    he: "הצגה של חלון ההתרעה על גבי אתרים בדפדפן",
    en: "View alerts above the sites in your browser",
    es: "Ver alertas sobre los sitios en su navegador",
    ar: "عرض التنبيهات فوق المواقع في متصفحك",
    ru: "Просмотр предупреждений над сайтами",
  },
  selectLanguageTitle: {
    he: "Language / שפה",
    en: "Language",
    es: "Language / Idioma",
    ar: "Language / لغة",
    ru: "Language / Язык",
  },
  selectThreatsTitle: {
    he: "התרעות על איומים",
    en: "Receive alerts about threats",
    es: "Reciba alertas sobre amenazas",
    ar: "تلقي تنبيهات حول التهديدات",
    ru: "Получайте уведомления об угрозах",
  },
  threats: {
    he: "איומים",
    en: "Threats",
    es: "Amenazas",
    ar: "التهديدات",
    ru: "Угрозы",
  },
  allThreats: {
    he: "כל האיומים",
    en: "All threats",
    es: "todos",
    ar: "كل التهديدات",
    ru: "все угрозы",
  },
  drillsAlerts: {
    he: "קבלת התרעות על תרגילי פיקוד העורף",
    en: "Receive alerts from driils",
    es: "Alertas de simulacros",
    ar: "تلقي تنبيهات من التدريبات",
    ru: "получать оповещения от учений",
  },
  testAlert: {
    he: "בדיקת התרעה",
    en: "Test Alert",
    es: "Prueba",
    ar: "اضغط لفحص الانذار",
    ru: "Проверка",
  },
  drill: {
    he: "תרגיל",
    en: "Drill",
    es: "Ejercicio",
    ar: "تمرين",
    ru: "упражнения",
  },
  aboutTitle: {
    he: "אודות",
    en: "About",
    es: "Acerca",
    ar: "حول",
    ru: "Про",
  },
  moreInfo: {
    he: "מידע נוסף",
    en: "More info",
    es: "más información",
    ar: "مزيد من المعلومات",
    ru: "больше информации",
  },
  now: {
    he: "כעת",
    en: "now",
    es: "ahora",
    ar: "الان",
    ru: "сейчас",
  },
  alertsServerConnectionError: {
    he: "קיימת תקלה בחיבור לשרת ההתרעות, יש לבדוק את חיבור הרשת",
    en: "Error connecting to the alerts server, check your network",
    es: "Error al conectarse al servidor de alertas, verifique su red",
    ar: "خطأ في الاتصال بخادم التنبيهات ، تحقق من شبكتك",
    ru: "Ошибка подключения к серверу оповещений, проверьте свою сеть",
  },
  //threats selection
  threat0: {
    he: "צבע אדום (ירי רקטות וטילים)",
    en: "Red Alert (Rockets)",
    ar: "انذار احمر (اطلاق قذائف وصواريخ)",
    ru: "Цева Адом (Ракетный обстрел)",
    es: "Rojo Color (Fuego de cohetes)",
  },
  threat1: {
    he: THREATS_TITLES[1].he,
    en: THREATS_TITLES[1].en,
    ar: THREATS_TITLES[1].ar,
    ru: THREATS_TITLES[1].ru,
    es: THREATS_TITLES[1].es,
  },
  threat2: {
    he: THREATS_TITLES[2].he,
    en: THREATS_TITLES[2].en,
    ar: THREATS_TITLES[2].ar,
    ru: THREATS_TITLES[2].ru,
    es: THREATS_TITLES[2].es,
  },
  threat3: {
    he: THREATS_TITLES[3].he,
    en: THREATS_TITLES[3].en,
    ar: THREATS_TITLES[3].ar,
    ru: THREATS_TITLES[3].ru,
    es: THREATS_TITLES[3].es,
  },
  threat4: {
    he: THREATS_TITLES[4].he,
    en: THREATS_TITLES[4].en,
    ar: THREATS_TITLES[4].ar,
    ru: THREATS_TITLES[4].ru,
    es: THREATS_TITLES[4].es,
  },
  threat5: {
    he: THREATS_TITLES[5].he,
    en: THREATS_TITLES[5].en,
    ar: THREATS_TITLES[5].ar,
    ru: THREATS_TITLES[5].ru,
    es: THREATS_TITLES[5].es,
  },
  threat6: {
    he: THREATS_TITLES[6].he,
    en: THREATS_TITLES[6].en,
    ar: THREATS_TITLES[6].ar,
    ru: THREATS_TITLES[6].ru,
    es: THREATS_TITLES[6].es,
  },
  threat7: {
    he: THREATS_TITLES[7].he,
    en: THREATS_TITLES[7].en,
    ar: THREATS_TITLES[7].ar,
    ru: THREATS_TITLES[7].ru,
    es: THREATS_TITLES[7].es,
  },
  threat8: {
    he: "איומים אחרים",
    en: "Other threats",
    ar: "تهديدات أخرى",
    ru: "Другие угрозы",
    es: "Otras amenazas",
  },
  /* Alert.html */
  copyButton: {
    he: "העתקת התרעה",
    en: "Copy Alert",
    es: "Alerta de copia",
    ar: "نسخ التنبيه",
    ru: "Копировать",
  },
  openMapButton: {
    he: "פתיחת מפה",
    en: "Open Map",
    es: "Abrir mapa",
    ar: "افتح الخريطة",
    ru: "Открыть карту",
  },
};

STRINGS.aboutText = {
  he: `מערכת "${STRINGS.appName.he}" מתריעה על אזעקות ברחבי הארץ באמצעים שונים. המערכת נבנתה על ידי איתי גולי וחושן קדוש`,
  en: `"${STRINGS.appName.en}" alerts about sirens in Israel via multiple platforms. The system was built by Itai Guli and Hoshen Kadosh`,
  es: `"${STRINGS.appName.es}" alertas sobre sirenas en Israel a través de múltiples plataformas. El sistema fue construido por Itai Guli y Hoshen Kadosh`,
  ar: `"${STRINGS.appName.ar}" تنبيهات حول صفارات الإنذار في إسرائيل من خلال منصات متعددة. تم بناء النظام من قبل إيتاي جولي وهوشن كادوش`,
  ru: `"${STRINGS.appName.ru}" оповещения о сиренах в Израиле через несколько платформ. Систему построили Итай Гули и Хошен Кадош.`,
};
STRINGS.sentVia = {
  he: `באמצעות תוסף "${STRINGS.appName.he}" לכרום.`,
  en: `Using "${STRINGS.appName.en}" for Chrome.`,
  es: `Usando "${STRINGS.appName.es}" para Chrome.`,
  ar: `استخدام "${STRINGS.appName.ar}" للكروم.`,
  ru: `Использование "${STRINGS.appName.ru}" для Chrome.`,
};

window.addEventListener("load", async (event) => {
  const siteLanguage = await Preferences.getSelectedLanguage();
  document.querySelectorAll("*").forEach((e) => {
    Array.from(e.childNodes)
      .filter((child) => child.nodeType == Node.TEXT_NODE && /{(.*)}/.test(child.textContent))
      .forEach(
        (textNode) => (textNode.textContent = replaceStrings(textNode.textContent, siteLanguage))
      );

    Array.from(e.attributes)
      .filter((attr) => /{(.*)}/.test(attr.value))
      .map((attr) => (attr.value = replaceStrings(attr.value, siteLanguage)));
  });
  document.title = replaceStrings(document.title, siteLanguage);
  fixLTR(siteLanguage);
});

function fixLTR(siteLanguage) {
  if (siteLanguage == "HE" || siteLanguage == "AR") return;
  const style = document.createElement("style");
  style.textContent = `
    html, body {
      direction: ltr !important;
    }

    #selection input {
      margin-right: unset;
      margin-left: 5px;
      background-position: right center;
    }

    #selection .item {
      margin-left: unset;
      margin-right: 4px;
    }

    .history_item .date {
      text-align: left !important;
    }

    #map::before {
      background-image: linear-gradient(to left, rgba(169, 162, 162, 0), #cd363487, #cd3634db, #cd3634);
    }

    #Sounds input:not(#readCities) {
      margin-left: 40% !important;
    }

    input {
      margin-right: 5px !important;
    }

    #logo {
      right: 10px;
      left: unset !important;
    }

    #Home #alertDetails {
      margin-right: 0 !important;
      margin-left: -20px !important;
    }

    #close {
      left: 15px !important;
      right: unset !important;
      rotate: 180deg;
    }

    #openInBrowser {
      right: 15px !important;
      left: unset !important;
    }
  `;
  document.head.append(style);
}

function replaceStrings(htmlText, siteLanguage) {
  return htmlText.replaceAll(/\{(.*?)\}/g, (all, stringName) => {
    var localizationString;
    try {
      localizationString =
        STRINGS[stringName][siteLanguage?.toLowerCase()] || STRINGS[stringName]["he"];
    } catch (error) {}
    return localizationString != null ? localizationString : all;
  });
}
