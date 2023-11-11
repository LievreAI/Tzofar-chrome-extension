/*
    {"id":283,"description":null, "alerts":[{"time":1626279901,"cities":["כרמית"],"threat":0,"isDrill":false}]}
*/

class History {
  constructor(JSONHistoryItem) {
    this.description = JSONHistoryItem.description;
    this.id = JSONHistoryItem.id;
    this.threatsIDs = [];
    this.alerts = [];

    this.citiesNames = [];
    this.areasNames = [];

    JSONHistoryItem["alerts"].forEach((alert) => {
      var timestamp = alert.time;
      var threatID = alert.threat;
      if (!(threatID >= 0 && threatID <= 9)) {
        threatID = 8;
      }
      var isDrill = alert.isDrill || false;
      if (!this.threatsIDs.includes(threatID)) this.threatsIDs.push(threatID);

      var cities = [];
      alert.cities.forEach((cityValue) => {
        var city = new City(cityValue, threatID, isDrill, timestamp);
        cities.push(city);

        var cityName = city.getLocalizationCityName();
        if (!this.citiesNames.includes(cityName)) this.citiesNames.push(cityName);

        var areaName = new Area(city.areaID, cityName).getLocalizationAreaName();
        if (!this.areasNames.includes(areaName)) this.areasNames.push(areaName);
      });

      this.alerts.push(new Alert(timestamp, cities, threatID, isDrill));
    });
  }

  getDate() {
    if (this.alerts.length == 0) return "";
    const startDate = new Date(this.alerts[0].getTimestamp() * 1000);
    const endDate = new Date(this.alerts[this.alerts.length - 1].getTimestamp() * 1000);
    const dates = {
      [Preferences.getDateString(startDate)]: 0,
      [Preferences.getDateString(endDate)]: 0,
    };
    const times = {
      [Preferences.getTimeString(startDate, true)]: 0,
      [Preferences.getTimeString(endDate, true)]: 0,
    };

    const lang = City.siteLanguage || "HE";
    if (lang == "AR" || lang == "HE")
      return (
        Preferences.getRelativeTimeString(endDate) +
        " | " +
        "(" +
        Object.keys(times).reverse().join(" - ") +
        ") " +
        Object.keys(dates).join(" - ")
      );

    return (
      Preferences.getRelativeTimeString(endDate) +
      " | " +
      Object.keys(dates).join(" - ") +
      " (" +
      Object.keys(times).join(" - ") +
      ")"
    );
  }

  getAlerts() {
    return this.alerts;
  }

  getThreatsIDs() {
    return this.threatsIDs;
  }

  isDrill() {
    // If all the alerts in this object is drill
    if (this.alerts.length == 0) return false;
    let isDrill = true;
    this.alerts.forEach((alert) => {
      if (!alert.isDrill && alert.getThreatID() != DRILLS_THREAT_ID) isDrill = false;
    });
    //return Math.random() > 0.5;
    return isDrill;
  }

  getThreatsIconsElements() {
    var icons = document.createElement("div");
    this.threatsIDs.forEach((threatID) => {
      if (threatID == DRILLS_THREAT_ID) {
        threatID = 0;
      }
      var img = document.createElement("img");
      img.setAttribute("threat", threatID);
      img.setAttribute(
        "src",
        "threats_icons/type" + threatID + "." + (threatID == 0 ? "png" : "svg")
      );
      icons.appendChild(img);
    });
    return icons;
  }

  getCitiesNames() {
    return this.citiesNames;
  }
  getAreasNames() {
    return this.areasNames;
  }

  getDescription() {
    return this.description;
  }
}
