class City {
  static loadedSync = false;

  static CITIES_JSON = {};
  static POLYGONS = {};
  static siteLanguage;

  static virtualCities = {
    "תרגיל עורף לאומי": {
      id: 3008,
      he: "תרגיל עורף לאומי",
      en: "National Home Front Drill",
      ru: "Национальное упражнения Ко",
      ar: "تمرين الدفاع المدني",
      es: "Simulacro nacional de frente doméstico",
      countdown: 60,
    },
    "רעידת אדמה": {
      id: 4000,
      he: "רעידת אדמה",
      en: "Earthquake",
      ru: "Землетрясение",
      ar: "هزة أرضية",
      es: "Terremoto",
      countdown: 60,
    },
    "ברחבי הארץ": {
      id: 10000000,
      he: "ברחבי הארץ",
      en: "Across the country",
      ru: "на территории Израиля",
      ar: "في انحاء البلاد",
      es: "A través del país",
      countdown: 60,
    },
    בדיקה: {
      id: 3000,
      he: "בדיקה",
      en: "Test",
      ru: "Проверка",
      ar: "فحص",
      es: "Prueba",
      countdown: 0,
    },
  };

  static virtualCitiesIds = Object.values(City.virtualCities).map((c) => c.id);

  constructor(cityValue, threat = 0, isDrill = false, timestamp = 0) {
    this.value = cityValue;
    this.threat = threat;
    if (!(this.threat >= 0 && this.threat <= 9)) {
      this.threat = 8;
    }
    this.isDrill = isDrill || false;
    this.timestamp = timestamp;

    var item;
    try {
      if (City.CITIES_JSON)
        item = City.CITIES_JSON["cities"].hasOwnProperty(cityValue)
          ? City.CITIES_JSON["cities"][cityValue]
          : null;
    } catch (error) {}

    if (this.threat != 0 && this.threat != 9 && this.threat != 7 && this.threat != 8) {
      this.countdown = 60;
    }

    if (item) {
      this.cityHE = item.he;
      this.cityEN = item.en;
      this.cityES = item.es;
      this.cityAR = item.ar;
      this.cityRU = item.ru;
      if (!this.countdown) this.countdown = item.countdown;
      this.lat = item.lat;
      this.lng = item.lng;
      this.id = item.id;
      this.areaID = item.area;
      return;
    }

    if (!item) {
      const virtualCity = City.virtualCities[cityValue];
      if (virtualCity) {
        this.cityHE = virtualCity.he;
        this.cityEN = virtualCity.en;
        this.cityES = virtualCity.es;
        this.cityAR = virtualCity.ar;
        this.cityRU = virtualCity.ru;
        this.countdown = virtualCity.countdown;
        this.lat = 0;
        this.lng = 0;
        this.id = virtualCity.id;
        this.areaID = -1;
        return;
      }
    }

    this.cityHE = cityValue;
    this.cityEN = cityValue;
    this.cityES = cityValue;
    this.cityAR = cityValue;
    this.cityRU = cityValue;
    this.countdown = 0;
    this.lat = 0;
    this.lng = 0;
    this.id = -1;
    this.areaID = -1;
  }

  getCountdown() {
    var nowTime = Math.floor(Date.now() / 1000);
    return Math.max(
      (this.countdown == 0 ? 15 : this.countdown) + 10 - (nowTime - this.timestamp),
      0
    );
  }

  getLocalizationCityName() {
    switch (City.siteLanguage) {
      case "EN":
        return this.cityEN;
      case "ES":
        return this.cityES;
      case "AR":
        return this.cityAR;
      case "RU":
        return this.cityRU;
      default:
        return this.cityHE;
    }
  }

  getThreatID() {
    return this.threat;
  }
  getIsDrill() {
    return this.isDrill;
  }
  getThreatDrillKey() {
    return this.threat.toString() + "|" + Number(this.isDrill);
  }
  static decodeThreatDrillKey(k) {
    const [threat, drill] = k.split("|");
    return [Number(threat), Boolean(+drill)];
  }
  static getLocalizationThreatDrillTitle(threat, isDrill) {
    if (!isDrill) return City.getLocalizationThreatTitle(threat);
    return (
      STRINGS["drill"][City.siteLanguage?.toLowerCase() || "he"] +
      " - " +
      City.getLocalizationThreatTitle(threat)
    );
  }

  static getLocalizationThreatTitle(threatID) {
    var item = THREATS_TITLES[threatID];
    switch (City.siteLanguage) {
      case "EN":
        return item.en;
      case "ES":
        return item.es;
      case "AR":
        return item.ar;
      case "RU":
        return item.ru;
      default:
        return item.he;
    }
  }

  static allCities;
  static async getAllCities() {
    if (this.allCities) return this.allCities;
    if (!City.CITIES_JSON) await loadData();
    this.allCities = Object.keys(City.CITIES_JSON["cities"]).map(
      (cityValue) => new City(cityValue)
    );
    return this.allCities;
  }

  getPolygon() {
    var item = City.POLYGONS[this.id.toString()];
    if (item == null) return [];
    var final = [];
    item.forEach((point) => {
      final.push(new google.maps.LatLng(point[0], point[1]));
    });
    return final;
  }

  getPolygonCenter() {
    var bounds = new google.maps.LatLngBounds();
    this.getPolygon().forEach((p) => {
      bounds.extend(p);
    });
    return bounds.getCenter();
  }

  static loadDataSync() {
    City.CITIES_JSON = JSON.parse(localStorage.getItem("citiesJSON") || "{}");
    City.POLYGONS = JSON.parse(localStorage.getItem("polygonsJSON") || "{}");
    City.loadedSync = true;
  }

  static async loadData() {
    City.siteLanguage = await Preferences.getSelectedLanguage();
    const citiesVersion = await Preferences.getCitiesVersion();
    const polygonsVersion = await Preferences.getPolygonsVersion();

    if (!City.loadedSync) City.CITIES_JSON = JSON.parse(localStorage.getItem("citiesJSON") || "{}");
    if (
      (localStorage.getItem("citiesVersion") || -1) == citiesVersion &&
      City.CITIES_JSON != null &&
      City.CITIES_JSON != undefined &&
      typeof City.CITIES_JSON === "object" &&
      Object.keys(City.CITIES_JSON).length > 0
    ) {
      console.log("cities was loaded successfully from localStorge.");
    } else {
      const cities = await fetch(
        "https://www.tzevaadom.co.il/static/cities.json?v=" + citiesVersion
      )
        .then(async (r) => r.json())
        .catch(() => null);
      if (
        cities != null &&
        cities != undefined &&
        typeof cities === "object" &&
        Object.keys(cities).length > 0
      ) {
        City.CITIES_JSON = cities;
        localStorage.setItem("citiesJSON", JSON.stringify(City.CITIES_JSON));
        localStorage.setItem("citiesVersion", citiesVersion);
        console.log("cities was loaded successfully from server.");
      }
    }

    if (!City.loadedSync) City.POLYGONS = JSON.parse(localStorage.getItem("polygonsJSON") || "{}");
    if (
      (localStorage.getItem("polygonsVersion") || -1) == polygonsVersion &&
      City.POLYGONS != null &&
      City.POLYGONS != undefined &&
      typeof City.POLYGONS === "object" &&
      Object.keys(City.POLYGONS).length > 0
    ) {
      console.log("polygons was loaded successfully from localStorge.");
    } else {
      const polygons = await fetch(
        "https://www.tzevaadom.co.il/static/polygons.json?v=" + polygonsVersion
      )
        .then((r) => r.json())
        .catch(() => null);
      if (
        polygons != null &&
        polygons != undefined &&
        typeof polygons === "object" &&
        Object.keys(polygons).length > 0
      ) {
        City.POLYGONS = polygons;
        localStorage.setItem("polygonsJSON", JSON.stringify(City.POLYGONS));
        localStorage.setItem("polygonsVersion", polygonsVersion);
        console.log("polygons was loaded successfully from server.");
      }
    }
  }
}

// Load cities & polygons from server.
City.loadingDataPromise = City.loadData();
