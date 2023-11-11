/*
    Listening for alerts.
*/

var currentCities = [];
var currentAlertCities = []; // All cities of this alert (For alert message)
var interval;
var pollingAlertsBackup = false;

const WEBSOCKET_URL = "wss://ws.tzevaadom.co.il:8443/socket?platform=CHROME_EXT";
const NOTIFICATIONS_API_URL = "https://api.tzevaadom.co.il/notifications";
const LISTS_VERSIONS_URL = "https://api.tzevaadom.co.il/lists-versions";

window.addEventListener("load", async (_) => {
  try {
    await City.loadingDataPromise;
  } catch {}
  await fetchAndCheckLists().catch(() => null);
  WSConnection();
});

async function checkListsVersion({ polygons, cities }) {
  await Promise.allSettled([
    Preferences.setPolygonsVersion(polygons),
    Preferences.setCitiesVersion(cities),
  ]);
  await City.loadData();
}

async function fetchAndCheckLists() {
  const data = await fetch(LISTS_VERSIONS_URL).then(async (r) => r.json());
  if (data.polygons && data.cities) await checkListsVersion(data);
}

function poolAlertsBackup() {
  if (!pollingAlertsBackup) return;

  setTimeout(poolAlertsBackup, 3000);
}

// -1 error both
// 0 websocket
// 1 api notifications
let connectionStatus = 0;

let runBackupAPI = false;

async function backupAPI() {
  if (!runBackupAPI) return;
  const result = await fetch(NOTIFICATIONS_API_URL)
    .then((r) => r.json())
    .catch(() => {
      if (!runBackupAPI) return;

      connectionStatus = -1;
      return null;
    });

  if (!runBackupAPI) return;

  if (result != null) {
    result.forEach((r) => getAlerts(r, "notificationsAPI"));
    connectionStatus = 1;
  }

  setTimeout(backupAPI, 3000);
}

function WSConnection() {
  /*
        WS connection
    */

  var ws = new WebSocket(WEBSOCKET_URL);

  ws.onmessage = (m) => {
    if (typeof m.data != "string") return;
    const { type, data } = JSON.parse(m.data);
    switch (type) {
      case "ALERT":
        getAlerts(data, "websocket");
        break;
      case "LISTS_VERSIONS":
        checkListsVersion(data);
        break;
    }
  };

  let isReconnecting = false;
  const handleReconnect = () => {
    ws.close();
    if (isReconnecting) return;
    isReconnecting = true;
    // console.log("ws reconnecting");

    if (!runBackupAPI) {
      runBackupAPI = true;
      backupAPI();
    }

    setTimeout(WSConnection, 5000);
  };

  ws.onopen = (e) => {
    console.log("ws connected");
    connectionStatus = 0;
    runBackupAPI = false;
  };

  ws.onclose = (e) => {
    //console.log("ws closed");
    handleReconnect();
  };
  ws.onerror = (e) => {
    //console.log("ws errored");
    handleReconnect();
  };
}

var rcvNotificationIds = [];

async function getAlerts(alert, source, testAlert = false) {
  if (!alert.notificationId) alert.notificationId = String(Math.random());
  if (!alert.isDrill) alert.isDrill = false;
  if (typeof alert.threat == "undefined") alert.threat = 8;

  if (rcvNotificationIds.includes(alert.notificationId)) return;
  rcvNotificationIds.push(alert.notificationId);
  if (rcvNotificationIds.length > 100) rcvNotificationIds.shift();

  if (source != "test") console.log("alert from", source, alert);
  /*
        Handler - New alert received!
    */
  const [selectionCitiesIDs, selectedThreats, selectedDrillsAlert] = await Promise.all([
    Preferences.getSelectedCities(),
    Preferences.getSelectedThreats(),
    Preferences.getSelectedDrillsAlerts(),
  ]);

  //save for popup - open alert btn
  localStorage.setItem("lastAlertServerTime", alert["time"]);

  // Get alert cities & filter by cities selection

  // 10 march 2023 - dont use server time, use local time since this can cause issues when system time is not calibrated
  var alertCities = alert["cities"].map(
    (cityValue) =>
      new City(cityValue, alert["threat"], alert["isDrill"], Math.floor(Date.now() / 1000))
  );

  alertCities = alertCities.filter((city) => {
    //filter threats
    if (
      selectedThreats.length != 0 &&
      !selectedThreats.includes(city.threat) &&
      city.threat != DRILLS_THREAT_ID
    )
      return false;

    //filter drills
    if ((city.isDrill || city.threat == DRILLS_THREAT_ID) && !selectedDrillsAlert) return false;

    //filter cities
    return (
      selectionCitiesIDs.includes(city.id) ||
      selectionCitiesIDs.length == 0 ||
      testAlert ||
      City.virtualCitiesIds.includes(city.id)
    );
  });
  if (alertCities.length == 0) return;

  // Show notify & play sound
  Preferences.playSound(
    alertCities
      .map((city) => city.id)
      .filter((cityID) => cityID != -1)
      .sort((a, b) => a - b),
    alert.threat,
    alert.isDrill
  );

  // To show all the cities
  currentCities = currentCities.concat(alertCities);
  currentAlertCities = currentAlertCities.concat(alertCities);

  // Update data and refresh after countdown finish.
  updateData(true, alertCities);
}

var lastData = [];
var popupCreatingPromise;
async function updateData(isNewData, alertCities = []) {
  // Filter list by countdown & alert's timestamp
  currentCities = currentCities.filter((city) => {
    return city.getCountdown() > 0;
  });
  if (currentCities.length == 0) return finishAlert();

  // Refresh data every 1 sec (To remove when countdown finish)
  if (interval == null)
    interval = setInterval(() => {
      updateData(false);
    }, 1000);

  // If data was changed, update in popup.
  if (!equalArrays(currentCities, lastData)) {
    // If is not new data, dont open the alert window again
    if (isNewData) {
      // Check what type of notification we need to create
      const desktop = await Preferences.getSelectedDesktop();
      if (desktop && alertCities.length) {
        // To show only the newest
        notify(alertCities);
      } else {
        if (popupCreatingPromise) await popupCreatingPromise;
        else {
          popupCreatingPromise = popup();
          await popupCreatingPromise;
          popupCreatingPromise = null;
        }
      }
    }

    if (popupCreatingPromise) await popupCreatingPromise;
    if (popupWindow)
      chrome.tabs.sendMessage(popupWindow.tabs[0].id, { cities: this.currentCities });
  }

  lastData = currentCities;
}

function finishAlert() {
  /*
        Alert ended
    */
  // Clear all data
  currentCities = [];
  currentAlertCities = [];
  lastData = [];
  if (interval != null) {
    clearInterval(interval);
    interval = null;
  }

  // Close popup window
  if (popupWindow) chrome.tabs.sendMessage(popupWindow.tabs[0].id, { cities: this.currentCities });
}

function equalArrays(one, two) {
  if ((one.length == 0 && two.length == 0) || one.length != two.length) return false;
  var same = true;
  one.forEach((a, i) => {
    if (a != two[i]) same = false;
  });
  return same;
}

async function notify(cities) {
  /*
        Show notification
    */
  const siteLanguage = await Preferences.getSelectedLanguage();
  City.siteLanguage = siteLanguage;

  // Sort list by Threats & Areas
  var newList = Preferences.sortCitiesByThreatDrillKey(cities);
  Object.keys(newList).forEach((threatDrillKey) => {
    var areasNames = [];
    var citiesNames = [];

    const [threat, isDrill] = City.decodeThreatDrillKey(threatDrillKey);

    Object.keys(newList[threatDrillKey]).forEach((areaName) => {
      areasNames.push(areaName);
      citiesNames = citiesNames.concat(newList[threatDrillKey][areaName]);
    });

    const title =
      City.getLocalizationThreatDrillTitle(threat, isDrill) + ": " + areasNames.join(", ");
    const message = citiesNames.join(", ");

    // Desktop
    var options = {
      type: "basic",
      title,
      message,
      iconUrl: "../img/notify.png",
      buttons: [
        { title: STRINGS.openMapButton[siteLanguage.toLowerCase()] || STRINGS.openMapButton.he },
        { title: STRINGS.copyButton[siteLanguage.toLowerCase()] || STRINGS.copyButton.he },
      ],
    };
    chrome.notifications.create(options);
  });
}

// Buttons in the desktop notifications
chrome.notifications.onButtonClicked.addListener(function (notifId, btnIdx) {
  if (!btnIdx) return Preferences.launchSiteMap(this.currentAlertCities);
  Preferences.copyAlert(this.currentAlertCities);
});

var popupWindow;
var isPopupCreating = false;
async function popup() {
  if (isPopupCreating) return;
  isPopupCreating = true;
  var options = {
    url: "../alert.html",
    type: "popup",
    width: 700,
    height: 270,
    left: 0,
    top: window.screen.height - 270,
  };
  try {
    const preventfocus = await Preferences.getSelectedBackgroundHidePopup();
    options.focused = !preventfocus;
    if (!popupWindow)
      popupWindow = await new Promise((resolve, reject) =>
        chrome.windows.create(options, (window) => resolve(window))
      );
    else
      popupWindow = await new Promise((resolve, reject) =>
        chrome.windows.update(popupWindow.id, { focused: !preventfocus }, (window) =>
          chrome.runtime.lastError
            ? chrome.windows.create(options, (window) => resolve(window))
            : resolve(popupWindow)
        )
      );
  } catch (error) {}
  isPopupCreating = false;
}

let testThreat = 0;
const getTestThreat = (selectedThreats) => {
  if (selectedThreats.length == 0) {
    if (testThreat == 8) {
      testThreat = 0;
      return 8;
    }

    testThreat++;
    return testThreat - 1;
  }

  const idx = selectedThreats.indexOf(testThreat);
  if (idx == -1 || idx == selectedThreats.length - 1) {
    testThreat = selectedThreats[0];
    return testThreat;
  }

  testThreat = selectedThreats[idx + 1];
  return testThreat;
};

// Return current cities
chrome.runtime.onMessage.addListener(async (value, sender, sendResponse) => {
  switch (value) {
    case "currentCities":
      return sendResponse(this.currentCities);

    case "currentAlertCities":
      return sendResponse(this.currentAlertCities);

    case "testAlert":
      return getAlerts(
        {
          cities: ["בדיקה"],
          threat: getTestThreat(await Preferences.getSelectedThreats()),
          time: Math.floor(Date.now() / 1000),
          isDrill: false,
        },
        "test",
        true
      );

    case "isConnectedToServer":
      return sendResponse(connectionStatus != -1);
  }
});
