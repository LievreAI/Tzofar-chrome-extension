function Mutex() {
  let current = Promise.resolve();
  this.lock = () => {
    let _resolve;
    const p = new Promise((resolve) => {
      _resolve = () => resolve();
    });
    // Caller gets a promise that resolves when the current outstanding
    // lock resolves
    const rv = current.then(() => _resolve);
    // Don't allow the next request until the new promise is done
    current = p;
    // Return the new promise
    return rv;
  };
}

class Preferences {
  static async getSelectedSound() {
    return new Promise((resolve, reject) =>
      chrome.storage.sync.get({ selectedSound: "bell" }, (value) => resolve(value.selectedSound))
    );
  }
  static saveSelectedSound(soundID, callback = () => {}) {
    chrome.storage.sync.set({ selectedSound: soundID }, callback);
  }

  static async getSelectedReadCities() {
    return new Promise((resolve, reject) =>
      chrome.storage.sync.get({ readCities: false }, (value) => resolve(value.readCities))
    );
  }
  static saveSelectedReadCities(value, callback = () => {}) {
    chrome.storage.sync.set({ readCities: value }, callback);
  }

  static async getSelectedCities() {
    return new Promise((resolve, reject) =>
      chrome.storage.sync.get({ selectedCities: "[]" }, (value) =>
        resolve(JSON.parse(value.selectedCities))
      )
    );
  }
  static saveSelectedCities(selectionCitiesIDs, callback = () => {}) {
    chrome.storage.sync.set({ selectedCities: JSON.stringify(selectionCitiesIDs) }, callback);
  }

  static async getSelectedThreats() {
    return new Promise((resolve, reject) =>
      chrome.storage.sync.get({ selectedThreats: "[]" }, (value) =>
        resolve(JSON.parse(value.selectedThreats))
      )
    );
  }
  static setSelectedThreats(value, callback = () => {}) {
    chrome.storage.sync.set({ selectedThreats: JSON.stringify(value) }, callback);
  }

  static async getSelectedDrillsAlerts() {
    return new Promise((resolve, reject) =>
      chrome.storage.sync.get({ drillsAlerts: true }, (value) => resolve(value.drillsAlerts))
    );
  }
  static saveDrillsAlerts(value, callback = () => {}) {
    chrome.storage.sync.set({ drillsAlerts: value }, callback);
  }

  static async getSelectedDesktop() {
    return new Promise((resolve, reject) =>
      chrome.storage.sync.get({ desktopNotifications: false }, (value) =>
        resolve(value.desktopNotifications)
      )
    );
  }
  static saveSelectedDesktop(value, callback = () => {}) {
    chrome.storage.sync.set({ desktopNotifications: value }, callback);
  }

  static async getSelectedBackgroundHidePopup() {
    return new Promise((resolve, reject) =>
      chrome.storage.sync.get({ backgroundHidePopup: false }, (value) =>
        resolve(value.backgroundHidePopup)
      )
    );
  }
  static saveSelectedBackgroundHidePopup(value, callback = () => {}) {
    chrome.storage.sync.set({ backgroundHidePopup: value }, callback);
  }

  static async getSelectedAlertsOverSites() {
    return false;
    ////
    return new Promise((resolve, reject) =>
      chrome.storage.sync.get({ alertsOverSites: false }, (value) => resolve(value.alertsOverSites))
    );
  }
  static saveSelectedAlertsOverSites(value, callback = () => {}) {
    chrome.storage.sync.set({ alertsOverSites: value }, callback);
  }

  static async getCitiesVersion() {
    return new Promise((resolve, reject) =>
      chrome.storage.sync.get({ citiesVersion: 5 }, (value) => resolve(value.citiesVersion))
    );
  }

  static async setCitiesVersion(value) {
    return new Promise(async (resolve, reject) => {
      const currentVersion = await Preferences.getCitiesVersion().catch(reject);
      if (value > currentVersion) chrome.storage.sync.set({ citiesVersion: value }, resolve);
      else resolve();
    });
  }

  static async getPolygonsVersion() {
    return new Promise((resolve, reject) =>
      chrome.storage.sync.get({ polygonsVersion: 3 }, (value) => resolve(value.polygonsVersion))
    );
  }
  static async setPolygonsVersion(value) {
    return new Promise(async (resolve, reject) => {
      const currentVersion = await Preferences.getPolygonsVersion().catch(reject);
      if (value > currentVersion) chrome.storage.sync.set({ polygonsVersion: value }, resolve);
      else resolve();
    });
  }

  static mutex = new Mutex();
  static audio;
  static readingQueue = [];
  static lastTimeAlert = 0;
  static lastReadTitleData = { key: 0, lastRead: 0 };
  static isPlaying = false;
  static async playSound(ids, threat, isDrill) {
    Preferences.readingQueue = Preferences.readingQueue.concat({ ids, threat, isDrill });
    const relese = await Preferences.mutex.lock();
    if (!Preferences.isPlaying) await this.startPlaying();
    relese();
  }

  static waitForAudioEnded = (audio) => {
    return new Promise((resolve, reject) => {
      audio.addEventListener("ended", () => resolve());
    });
  };

  static async startPlaying() {
    const soundID = await this.getSelectedSound();
    const soundType =
      soundID == "bell" || soundID == "tone" || soundID == "redalert3" ? "mp3" : "wav";
    const shouldPlaySound = soundID && soundID != "silent";
    const shouldReadCities = await this.getSelectedReadCities();

    if (!shouldPlaySound) Preferences.audio?.pause();

    if (!shouldReadCities) Preferences.readingQueue = [];

    if (
      (!shouldReadCities && shouldPlaySound) ||
      (shouldReadCities && shouldPlaySound && !Preferences.readingQueue.length)
    ) {
      Preferences.audio?.pause();
      Preferences.audio = new Audio(`../sounds/${soundID}.${soundType}`);
      Preferences.lastTimeAlert = Date.now();
      return Preferences.audio.play();
    }
    if ((Preferences.audio && !Preferences.audio.paused) || !Preferences.readingQueue.length)
      return;

    let readCities = false;
    if (Date.now() - Preferences.lastTimeAlert > 30_000 && shouldPlaySound) {
      Preferences.audio = new Audio(`../sounds/${soundID}.${soundType}`);
    } else {
      Preferences.isPlaying = true;

      const siteLanguage = await Preferences.getSelectedLanguage();
      const { ids, threat, isDrill } = Preferences.readingQueue[0];

      const shouldReadTitle =
        Date.now() - Preferences.lastReadTitleData.lastRead > 60_000 ||
        Preferences.lastReadTitleData.key != threat.toString() + isDrill.toString();
      Preferences.lastReadTitleData.key = threat.toString() + isDrill.toString();

      const readLanguage = siteLanguage == "ES" ? "HE" : siteLanguage;

      if (shouldReadTitle) {
        const files = [];
        if (isDrill) files.push(`sounds/reading_prefixes/${readLanguage.toLowerCase()}/drill.mp3`);
        files.push(`sounds/reading_prefixes/${readLanguage.toLowerCase()}/threat${threat}.mp3`);

        for (const file of files) {
          const audio = new Audio(file);
          audio.play();

          await this.waitForAudioEnded(audio);
        }
      }

      //test - load file localy
      if (ids.length == 1 && ids[0] == 3000)
        Preferences.audio = new Audio(
          `sounds/reading_prefixes/${readLanguage.toLowerCase()}/3000.mp3`
        );
      else
        Preferences.audio = new Audio(
          `https://api.tzevaadom.co.il/reading?ids=${ids.join(",")}&lang=${readLanguage}`
        );
      readCities = true;

      Preferences.audio.playbackRate = 1.25;
      Preferences.readingQueue.shift();
    }
    Preferences.lastTimeAlert = Date.now();

    let endedOrErrored = false;
    const handleErrorOrEnded = (e) => {
      if (endedOrErrored) return;
      endedOrErrored = true;
      Preferences.lastTimeAlert = Date.now();
      if (readCities) Preferences.lastReadTitleData.lastRead = Date.now();
      Preferences.isPlaying = false;
      if (e.type == "error") Preferences.audio = null;
      if (Preferences.readingQueue.length) Preferences.startPlaying();
    };

    Preferences.audio.play();
    Preferences.isPlaying = true;
    Preferences.audio.addEventListener("ended", handleErrorOrEnded);
    Preferences.audio.addEventListener("error", handleErrorOrEnded);
  }

  // Google Maps KEY
  static async getGoogleMapsKEY() {
    return new Promise((resolve, reject) =>
      chrome.storage.sync.get(
        { googleMapsKEY: "AIzaSyDgclrR8QqACLDYcgLjsLd1RIZV9-V8Bpc" },
        (value) => resolve(value.googleMapsKEY)
      )
    );
  }
  static async updateGoogleMapsKEY() {
    try {
      const data = await fetch("https://www.tzevaadom.co.il/static/chrome/data.json")
        .then(async (r) => JSON.parse(await r.text()))
        .catch(() => null);
      const googleMapsKEY = data?.googleMapsKEY || "";
      if (googleMapsKEY.length > 0) chrome.storage.sync.set({ googleMapsKEY: googleMapsKEY });
    } catch (error) {}
  }

  static getDateString(date, shortYear = false) {
    const date_ = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = shortYear ? date.getYear().toString().substr(1, 2) : date.getFullYear();
    return date_ + "/" + month + "/" + year;
  }
  static getTimeString(date, minutesOnly = false) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return hours + ":" + minutes + (minutesOnly ? "" : ":" + seconds);
  }

  static getDateTimeString(date, minutesOnly = false) {
    return Preferences.getDateString(date) + " " + Preferences.getTimeString(date, minutesOnly);
  }

  static getRelativeTimeString(date1, date2 = new Date()) {
    const units = {
      year: 24 * 60 * 60 * 1000 * 365,
      month: (24 * 60 * 60 * 1000 * 365) / 12,
      week: 24 * 60 * 60 * 1000 * 7,
      day: 24 * 60 * 60 * 1000,
      hour: 60 * 60 * 1000,
      minute: 60 * 1000,
      second: 1000,
    };

    const rtf = new Intl.RelativeTimeFormat(City.siteLanguage?.toLowerCase() || "he", {
      numeric: "auto",
    });
    const passed = date2 - date1;
    if (passed <= 60_000) return STRINGS["now"][(City.siteLanguage ?? "he").toLowerCase()];
    if (passed > 24 * 60 * 60 * 1000) {
      date1.setHours(0, 0, 0, 0);
    }

    const elapsed = date1 - date2;

    // "Math.abs" accounts for both "past" & "future" scenarios
    for (var u in units)
      if (Math.abs(elapsed) > units[u] || u == "second")
        return rtf.format(Math.round(elapsed / units[u]), u);
  }

  static sortCitiesValuesByThreatDrillKey(cities) {
    /* 
            Sort cities array by Threats|isDrill
            example: {"0|false":["Rehovot", "Ness ziona"], "5|true":["Holon"]}
    */
    var sortedList = {};
    cities.forEach((city) => {
      var threatIDStr = city.getThreatDrillKey();
      const value = city.value;
      if (!sortedList.hasOwnProperty(threatIDStr)) sortedList[threatIDStr] = [value];
      else sortedList[threatIDStr].push(value);
    });
    return sortedList;
  }

  static sortCitiesByThreatDrillKey(cities) {
    /* 
            Sort cities array by Threats and Areas.
            example: {"0|false":{"Shfela":["Rehovot", "Ness ziona"]}, "5|true":{"Dan":["Holon"]}}
        */
    var sortedList = {};
    cities.forEach((city) => {
      // Get localization names
      var cityName = city.getLocalizationCityName();
      var areaName = new Area(city.areaID, cityName).getLocalizationAreaName();
      var threatIDStr = city.getThreatDrillKey();

      // Add city name to his area
      if (!sortedList.hasOwnProperty(threatIDStr)) sortedList[threatIDStr] = {};
      if (!sortedList[threatIDStr].hasOwnProperty(areaName)) sortedList[threatIDStr][areaName] = [];
      sortedList[threatIDStr][areaName].push(cityName);
    });
    return sortedList;
  }

  static generateAlertMessage(alertCities, siteLanguage) {
    const dates = {};
    var list = {};
    alertCities.forEach((city) => (list[city.getThreatDrillKey()] = {}));
    alertCities.forEach((city) => {
      list[city.getThreatDrillKey()][city.timestamp.toString()] = [].concat(
        list[city.getThreatDrillKey()][city.timestamp.toString()] || [],
        city
      );
      const dateStr = Preferences.getDateString(new Date(city.timestamp * 1000));
      dates[dateStr] = dateStr;
    });

    var alertText = "";
    Object.keys(list).forEach((threatDrillKey) => {
      const [threat, isDrill] = City.decodeThreatDrillKey(threatDrillKey);

      alertText +=
        City.getLocalizationThreatDrillTitle(threat, isDrill) +
        ` (${Object.values(dates).join(" - ")}):\n\n`;

      Object.keys(list[threatDrillKey]).forEach((timestamp) => {
        alertText += Preferences.getTimeString(new Date(Number(timestamp) * 1000)) + ":\n";
        const areasList = Preferences.sortCitiesByThreatDrillKey(list[threatDrillKey][timestamp])[
          threatDrillKey
        ];
        alertText += Object.keys(areasList)
          .map((areaName) => `• ${areaName}: ${areasList[areaName].join(", ")}`)
          .join("\n");
        alertText += "\n\n";
      });
      alertText += "------------\n\n";
    });
    alertText +=
      (STRINGS.sentVia[siteLanguage.toLowerCase()] || STRINGS.sentVia.he) +
      "\n" +
      Preferences.getSystemsPageUrl(City.siteLanguage);
    return alertText;
  }

  static async getSelectedLanguage() {
    const getWindowLang = () => {
      const langWindow = window?.navigator?.language;
      if (!langWindow) return "HE";

      const lang = langWindow.split("-")[0].trim().toUpperCase();
      if (lang == "HE" || lang == "AR" || lang == "RU" || lang == "ES" || lang == "EN") return lang;
      return "HE";
    };

    return new Promise((resolve, reject) =>
      chrome.storage.sync.get({ selectedLanguage: getWindowLang() }, (value) =>
        resolve(value.selectedLanguage)
      )
    );
  }
  static saveSelectedLanguage(languageCode, callback = () => {}) {
    chrome.storage.sync.set({ selectedLanguage: languageCode }, callback);
    City.siteLanguage = languageCode;
  }

  static async copyAlert(cities = null) {
    const siteLanguage = await Preferences.getSelectedLanguage();
    const currentAlertCities = cities
      ? cities
      : await new Promise((resolve, reject) =>
          chrome.runtime.sendMessage("currentAlertCities", (response) =>
            chrome.runtime.lastError
              ? resolve([])
              : resolve(
                  response.map(
                    (city) => new City(city.value, city.threat, city.isDrill, city.timestamp)
                  )
                )
          )
        );
    var input = document.createElement("textarea");
    document.body.appendChild(input);
    input.value = Preferences.generateAlertMessage(currentAlertCities, siteLanguage);
    input.focus();
    input.select();
    document.execCommand("Copy");
    input.remove();
  }

  static getSystemsPageUrl(lang) {
    return (
      "https://www.tzevaadom.co.il/" + (lang == "HE" ? "" : lang.toLowerCase() + "/") + "systems"
    );
  }

  static async findAlertIdByTime(time) {
    const history = await fetch("https://api.tzevaadom.co.il/alerts-history?" + time)
      .then((r) => r.json())
      .catch(() => []);

    for (const historyItem of history) {
      for (const alert of historyItem.alerts) {
        if (alert.time == time) return historyItem.id;
      }
    }
  }

  static async launchSiteMap(currentCities) {
    const siteLanguage = await Preferences.getSelectedLanguage();
    const siteBaseUrl =
      "https://www.tzevaadom.co.il/" +
      (siteLanguage == "HE" ? "" : `${siteLanguage.toLowerCase()}/`);

    const lastAlertServerTime = Number(localStorage.getItem("lastAlertServerTime") || 0);
    const historyId = await this.findAlertIdByTime(lastAlertServerTime);

    const url = historyId
      ? siteBaseUrl + `alerts/${historyId}`
      : siteBaseUrl +
        `?chrome-ext-cities=${encodeURI(
          Object.entries(Preferences.sortCitiesValuesByThreatDrillKey(currentCities))
            .map(([k, c]) => `${k}|${c.join("~")}`)
            .join("`")
        )}`;

    const windowName = "Tzofar" + siteLanguage + (historyId ?? "");
    if (typeof Preferences.launchSiteMap.winrefs == "undefined")
      Preferences.launchSiteMap.winrefs = {};
    if (
      typeof Preferences.launchSiteMap.winrefs[windowName] == "undefined" ||
      Preferences.launchSiteMap.winrefs[windowName].closed
    )
      window.open(url, windowName);
    else Preferences.launchSiteMap.winrefs[windowName].focus();
  }
}
