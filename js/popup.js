/*
    Set the language of the site.
*/
var siteLanguage;
var allCities;

window.addEventListener("load", async (event) => {
  siteLanguage = await Preferences.getSelectedLanguage();
  allCities = await City.getAllCities();
  await loadSettings().catch(console.error);
  loadHistory();
});

var currentPage = "Home";
(function () {
  document.querySelectorAll(".tablink").forEach((element) => {
    element.onclick = function () {
      // Update the current page ID
      currentPage = element.getAttribute("forPageID");

      // Clear background from all tab buttons
      document.querySelectorAll(".tablink").forEach((tab) => {
        tab.style.backgroundColor = "";
      });

      // Hide all pages
      document.querySelectorAll(".page").forEach((tab) => {
        tab.style.display = "";
      });

      // Show the specific page
      document.getElementById(currentPage).style.display = "block";

      // Add the specific color to the button used to open the page
      element.style.backgroundColor = "rgb(228, 0, 0)";

      // On load page callback
      onPageLoad(currentPage);
    };
  });
  // Open the default tab
  document.querySelector('.tablink[forPageID="' + currentPage + '"]').click();
})();

function onPageLoad(Page) {
  /* 
        Page change handler
    */

  switch (Page) {
    case "Home":
      try {
        let isAlertInfoOpen =
          document.querySelector("#Home #alertDetails").style.display == "block";
        if (isAlertInfoOpen) {
          document.querySelector("#Home #alertDetails #close").click();
          break;
        }
      } catch (e) {}
      if (siteLanguage) loadHistory();
      break;

    default:
      break;
  }
}

async function loadHistory() {
  if (document.getElementById("history")) document.getElementById("history").remove();
  var homeDiv = document.getElementById("Home");
  var history = document.createElement("div");
  history.setAttribute("id", "history");

  const feed = await fetch("https://api.tzevaadom.co.il/alerts-history/")
    .then((r) => r.json())
    .catch(() => []);

  feed.forEach((data) => {
    var historyItem = new History(data);
    var dateString = historyItem.getDate();
    var citiesNames = historyItem.getCitiesNames();
    var areasNames = historyItem.getAreasNames();
    var iconsDiv = historyItem.getThreatsIconsElements();

    const isAllDrill = historyItem.isDrill();
    var drillTitle = "";
    if (isAllDrill) {
      drillTitle =
        "<bold class='drill_text'>" + STRINGS["drill"][siteLanguage?.toLowerCase()] + " -  </bold>";
    }

    item = document.createElement("div");
    item.classList.add("history_item");
    if (isAllDrill) iconsDiv.classList.add("drill");

    item.innerHTML =
      "<div>" +
      '<p class="areas">' +
      drillTitle +
      areasNames.join(", ") +
      "</p>" +
      '<p class="date">' +
      dateString +
      "</p>" +
      '<p class="cities">' +
      citiesNames.join(", ") +
      "</p>" +
      "</div>";
    item.appendChild(iconsDiv);
    item.addEventListener("click", function (e) {
      let lang = siteLanguage == "HE" ? "" : siteLanguage + "/";
      let src = `https://www.tzevaadom.co.il/${lang.toLowerCase()}alerts/${historyItem.id}`;
      document.querySelector("#Home #alertDetails iframe").src = src;
      document.querySelector("#Home #alertDetails").style.display = "block";
      document.querySelector("#Home").style.overflow = "hidden";
      document.querySelector("#Home #alertDetails #openInBrowser").onclick = function (e) {
        window.open(src, "_blank");
      };
    });
    history.appendChild(item);
  });
  homeDiv.appendChild(history);
}

/* Cities Selection */
var selectionCitiesIDs = [];
var founds = [];
var currentFocusIndex;
document.getElementById("search").oninput = async function (e) {
  const searchText = this.value;

  if (document.getElementById("autocomplete")) document.getElementById("autocomplete").remove();
  if (!searchText || !searchText) return; // No text to search...

  const allCities = (await City.getAllCities()) || [];
  founds = allCities
    .filter((city) =>
      city
        .getLocalizationCityName()
        .toLowerCase()
        .replace(/[0-9 ~`!@#$%^&*()+={}\[\];:\'\"<>.,\/\\\?-_]/g, "")
        .includes(
          searchText.toLowerCase().replace(/[0-9 ~`!@#$%^&*()+={}\[\];:\'\"<>.,\/\\\?-_]/g, "")
        )
    )
    .slice(0, 5);
  if (!founds.length) return; // No search options...

  var autocomplete = document.createElement("div");
  autocomplete.setAttribute("id", "autocomplete");

  founds.forEach((city, index) => {
    var option = document.createElement("button");
    option.classList.add("card");
    option.innerHTML =
      "<p>" +
      city.getLocalizationCityName() +
      "</p>" +
      "<p>" +
      new Area(city.areaID).getLocalizationAreaName() +
      "</p>";
    option.onclick = function (e) {
      currentFocusIndex = index;
      onClickOption();
    };
    autocomplete.appendChild(option);
  });

  document.querySelector("#selection div").appendChild(autocomplete);
  currentFocusIndex--;
};

function updateFocus() {
  let options = document.querySelectorAll("#autocomplete button");
  options.forEach((node) => node.classList.remove("focused"));
  if (currentFocusIndex == -1) {
    document.getElementById("search").focus();
    document.getElementById("search").value = document.getElementById("search").value;
  }
  if (!options[currentFocusIndex]) return;
  options[currentFocusIndex].classList.add("focused");
  options[currentFocusIndex].scrollIntoView(false);
}

function onClickOption() {
  const selectedCity = founds[currentFocusIndex];
  if (!selectedCity) return;

  if (document.getElementById("autocomplete")) document.getElementById("autocomplete").remove();
  document.getElementById("search").value = ""; // Clear search input

  // City has been selected before?
  if (selectionCitiesIDs.includes(selectedCity.id)) return;

  // Add city
  selectionCitiesIDs.push(selectedCity.id);
  Preferences.saveSelectedCities(selectionCitiesIDs);
  loadSelectionCitiesUI();
}

document.getElementById("search").onkeydown = function (e) {
  if (!document.getElementById("autocomplete")) return;
  switch (e.keyCode) {
    case 40: // Down
      currentFocusIndex == founds.length - 1 ? (currentFocusIndex = 0) : currentFocusIndex++;
      break;
    case 38: // Up
      currentFocusIndex == 0 ? (currentFocusIndex = -1) : currentFocusIndex--;
      break;
    case 13: // Enter
      e.preventDefault();
      return onClickOption();
    default:
      return;
  }
  updateFocus();
};

document.getElementById("search").addEventListener("focusout", function (e) {
  // Delay to save the selection
  setTimeout(function () {
    if (document.getElementById("autocomplete") != null)
      document.getElementById("autocomplete").remove();
  }, 200);
});

document.getElementById("search").onfocus = function () {
  document.getElementById("search").dispatchEvent(new Event("input"));
};

// Clear all selections
document.getElementById("clear").onclick = function (e) {
  selectionCitiesIDs = [];
  Preferences.saveSelectedCities(selectionCitiesIDs);
  loadSelectionCitiesUI();
};

function loadSelectionCitiesUI() {
  var container = document.getElementById("selected");
  container.innerHTML = "";

  allCities
    .filter((city) => {
      return selectionCitiesIDs.includes(city.id);
    })
    .forEach((city) => {
      var item = document.createElement("div");
      item.classList.add("item");
      item.classList.add("card");

      var removeBtn = document.createElement("button");
      removeBtn.setAttribute("cityID", city.id);
      removeBtn.classList.add("card");
      removeBtn.innerHTML = "x";

      item.appendChild(removeBtn);
      item.innerHTML += "<p>" + city.getLocalizationCityName() + "</p>";
      container.appendChild(item);

      document.querySelector("button[cityID='" + city.id + "']").onclick = function (e) {
        // Remove from selection
        selectionCitiesIDs = selectionCitiesIDs.filter((cityID) => {
          return cityID != city.id;
        });
        Preferences.saveSelectedCities(selectionCitiesIDs, loadSelectionCitiesUI);
      };
    });

  if (!container.innerHTML)
    container.innerHTML =
      '<p style="text-align: center;font-size: 14px;color: #777777;">' +
      SELECTION_DESC[siteLanguage.toLowerCase()] +
      "</p>";
}

const readCities = document.getElementById("readCities");
const desktopNotifications = document.getElementById("desktopNotifications");
const backgroundHidePopup = document.getElementById("backgroundHidePopup");
const selectedThreatsTitle = document.getElementById("selectedThreatsTitle");
const alertsOverSites = document.getElementById("alertsOverSites");
const drillsAlerts = document.getElementById("drillsAlerts");
const selectLanguage = document.getElementById("language");
const testAlert = document.getElementById("testAlert");
var selectedThreats = [];

var expanded = false;

function showCheckboxes() {
  var checkboxes = document.getElementById("threats-checkboxes");
  if (!expanded) {
    checkboxes.style.display = "block";
    expanded = true;
  } else {
    checkboxes.style.display = "none";
    expanded = false;
  }
}
document.getElementById("selectBox").onclick = showCheckboxes;

const updateThreatsTitle = () => {
  if (selectedThreats.length == 0 || selectedThreats.length == 9) {
    return (selectedThreatsTitle.innerHTML = replaceStrings("{allThreats}", selectLanguage.value));
  }
  return (selectedThreatsTitle.innerHTML = replaceStrings(
    `${selectedThreats.length}/9 {threats}`,
    selectLanguage.value
  ));
};

// Initialize triggers

document.addEventListener("click", ({ target }) => {
  if (!target.closest("#multiselect")) {
    if (getComputedStyle(document.getElementById("threats-checkboxes"), null).display != "none") {
      expanded = false;
      document.getElementById("threats-checkboxes").style.display = "none";
    }
  }
});
readCities.onclick = () => Preferences.saveSelectedReadCities(readCities.checked);
desktopNotifications.onclick = () => Preferences.saveSelectedDesktop(desktopNotifications.checked);
backgroundHidePopup.onclick = () =>
  Preferences.saveSelectedBackgroundHidePopup(backgroundHidePopup.checked);
alertsOverSites.onclick = () => Preferences.saveSelectedAlertsOverSites(alertsOverSites.checked);
drillsAlerts.onclick = () => Preferences.saveDrillsAlerts(drillsAlerts.checked);
selectLanguage.onchange = () => {
  siteLanguage = selectLanguage.value.toUpperCase();
  Preferences.saveSelectedLanguage(siteLanguage);
  location.reload();
};
testAlert.onclick = () => chrome.runtime.sendMessage("testAlert");

const checkServerConnection = () => {
  chrome.runtime.sendMessage("isConnectedToServer", (connected) => {
    const elem = document.getElementById("alertsServerConnectionError");
    !connected ? elem.classList.add("show") : elem.classList.remove("show");
  });
};

/* Load data from LocalStorage */
async function loadSettings() {
  checkServerConnection();
  setInterval(checkServerConnection, 5000);

  // Load selection cities
  selectionCitiesIDs = await Preferences.getSelectedCities();
  loadSelectionCitiesUI();

  // Load close alert detail button
  document.querySelector("#Home #alertDetails #close").addEventListener("click", function (e) {
    document.querySelector("#Home #alertDetails").style.display = "none";
    document.querySelector("#Home #alertDetails iframe").src = "";
    document.querySelector("#Home").style.overflow = "overlay";
  });

  // Load selected sound
  const selectedSound = await Preferences.getSelectedSound();
  document.querySelectorAll('input[name="sound"').forEach((element) => {
    const soundID = element.getAttribute("id");
    element.onclick = () =>
      Preferences.saveSelectedSound(soundID, () => Preferences.startPlaying()); // Save & Test sound
    if (selectedSound == soundID) element.checked = true;
  });

  // Read cities
  readCities.checked = await Preferences.getSelectedReadCities();

  // Desktop notifications
  desktopNotifications.checked = await Preferences.getSelectedDesktop();

  // Hide popup when chrome is on background
  backgroundHidePopup.checked = await Preferences.getSelectedBackgroundHidePopup();

  // Alerts over sites
  alertsOverSites.checked = await Preferences.getSelectedAlertsOverSites();

  // App language
  selectLanguage.value = await Preferences.getSelectedLanguage();
  document
    .getElementById("systemsPageUrl")
    .setAttribute("href", Preferences.getSystemsPageUrl(selectLanguage.value ?? "HE"));

  // Drills Alerts
  drillsAlerts.checked = await Preferences.getSelectedDrillsAlerts();

  //Threats selection
  selectedThreats = await Preferences.getSelectedThreats();
  if (selectedThreats.length == 0) selectedThreats = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  for (const _c of document.getElementById("threats-checkboxes").children) {
    _c.firstElementChild.onclick = () => {
      //threatid
      const id = Number(_c.firstElementChild.id);
      const checked = _c.firstElementChild.checked;
      if (!checked && selectedThreats.length == 1) {
        _c.firstElementChild.checked = true;
        return;
      }
      checked ? selectedThreats.push(id) : selectedThreats.splice(selectedThreats.indexOf(id), 1);
      updateThreatsTitle();
      Preferences.setSelectedThreats(selectedThreats.length == 9 ? [] : selectedThreats);
    };
    _c.firstElementChild.checked = selectedThreats.includes(Number(_c.firstElementChild.id));
  }
  updateThreatsTitle();
}
