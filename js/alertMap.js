var map;
var isMapLoaded = false;
var nowCities = [];
var mapMouseDown = false;

City.loadDataSync();
window.addEventListener("load", function (event) {
  // Load google maps script
  loadMapScript();

  // On load page - get current cities from background service
  chrome.runtime.sendMessage("currentCities", (currentCities) => alertsListener(currentCities));

  // Listen to alerts
  chrome.runtime.onMessage.addListener((data) => {
    if (data.hasOwnProperty("cities"))
      data.cities.length ? alertsListener(data.cities || []) : window.close();
  });

  document.getElementById("copy").addEventListener("click", () => Preferences.copyAlert());
  document
    .getElementById("open")
    .addEventListener("click", () => Preferences.launchSiteMap(nowCities));
});

const specialLocations = {
  // שדרות, איבים, ניר עם
  248: [
    [31.5227, 34.5956],
    [31.5335, 34.6096],
    [31.5185, 34.5805],
  ],
  // גבים, מכללת ספיר
  1759: [
    [31.5063, 34.5989],
    [31.5094, 34.5945],
  ],
  // מבטחים עמיעוז ישע
  135: [
    [31.2484, 34.4134],
    [31.2424, 34.4075],
    [31.2476, 34.4031],
  ],
  // קריית גת, כרמי גת
  293: [
    [31.6111, 34.7684],
    [31.6291, 34.7727],
  ],
  // מעגלים גבעולים מלילות
  200: [
    [31.3989, 34.5982],
    [31.3976, 34.5938],
    [31.3899, 34.5952],
  ],
  // צוחר ואוהד
  136: [
    [31.2372, 34.4264],
    [31.2384, 34.4319],
  ],
  // זמרת ושובה
  220: [
    [31.4479, 34.5523],
    [31.4499, 34.5455],
  ],
};

function loadMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 31.5469501, lng: 34.6863132 },
    zoom: 9,
    maxZoom: 12,
    disableDefaultUI: true,
    options: {
      gestureHandling: "greedy",
    },
  });
  map.addListener("mousedown", function () {
    mapMouseDown = true;
  });
  map.addListener("mouseup", function () {
    mapMouseDown = false;
  });
  isMapLoaded = true;
  if (nowCities.length) addPolygonsMarkers(nowCities);
}

async function alertsListener(cities) {
  // Convert objects to City objects
  cities = cities.map((city) => new City(city.value, city.threat, city.isDrill, city.timestamp));
  nowCities = cities;

  // Get elements
  var threatTitle = document.querySelector("#alert h3");
  var citiesDIV = document.querySelector(".cities-container");
  citiesDIV.innerHTML = "";

  // Threats titles
  const threatTitles = {};

  cities.reverse();
  cities.forEach((city) => {
    var cityNode = document.createElement("city");
    cityNode.textContent = city.getLocalizationCityName();
    if (Date.now() / 1000 - city.timestamp < 2) {
      cityNode.classList.add("blink");
    }
    cityNode.addEventListener("click", function (e) {
      if (!map || !city.getPolygon().length) return;

      // Change map center on click
      var bounds = new google.maps.LatLngBounds();
      city.getPolygon().forEach((point) => bounds.extend(point));

      if (!bounds.isEmpty()) {
        map.initialZoom = true;
        map.fitBounds(bounds);
      }
    });
    citiesDIV.appendChild(cityNode);

    const title = City.getLocalizationThreatDrillTitle(city.threat, city.isDrill);
    threatTitles[title] = title;
  });
  threatTitle.textContent = Object.values(threatTitles).join(" | ");

  // Add polygons & Markers
  if (isMapLoaded) {
    addPolygonsMarkers(cities);
  }
}

const markersAndPolygons = {};
function addPolygonsMarkers(cities) {
  var bounds = new google.maps.LatLngBounds();
  const citiesIds = new Set();

  cities.forEach((city) => {
    const cityId = city?.id;
    if (!cityId) return;

    citiesIds.add(String(cityId));

    const polygon = city.getPolygon();
    polygon.forEach((point) => bounds.extend(point));

    //we already have some map items for this city, return
    if (markersAndPolygons[cityId]) return;

    //create markers
    const points = (
      specialLocations[cityId] ? specialLocations[cityId] : [[city.lat, city.lng]]
    ).map(([lat, lng]) => new google.maps.LatLng(lat, lng));

    const gMapMarkers = points.map(
      (z) =>
        new google.maps.Marker({
          position: z,
          icon: {
            url: "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3.png",
            scaledSize: new google.maps.Size(20, 30),
          },
          map: map,
          animation: google.maps.Animation.DROP,
        })
    );

    //create polygon
    const gMapPolygon = new google.maps.Polygon({
      paths: polygon,
      strokeColor: "#FF0000",
      strokeOpacity: 0.7,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.3,
      map: map,
    });

    //save for later
    markersAndPolygons[cityId] = { markers: gMapMarkers, polygon: gMapPolygon };
  });

  // check if we need to remove some
  Object.keys(markersAndPolygons).forEach((cid) => {
    if (!citiesIds.has(cid)) {
      markersAndPolygons[cid].polygon.setMap(null);
      markersAndPolygons[cid].markers.forEach((m) => m.setMap(null));
      delete markersAndPolygons[cid];
    }
  });

  if (bounds.isEmpty() || mapMouseDown) return;

  map.initialZoom = true;
  map.fitBounds(bounds);
}

async function loadMapScript() {
  // Load google map js
  const siteLanguage = await Preferences.getSelectedLanguage();
  const googleMapsKEY = await Preferences.getGoogleMapsKEY();
  const scriptTag = document.createElement("script");
  scriptTag.setAttribute(
    "src",
    `https://maps.googleapis.com/maps/api/js?key=${googleMapsKEY}&callback=loadMap&v=3.51&language=${
      siteLanguage == "HE" ? "iw" : siteLanguage.toLowerCase()
    }`
  );
  document.head.appendChild(scriptTag);

  // Load map after script has been loaded
  //scriptTag.addEventListener("load", () => loadMap());
}

function gm_authFailure() {
  // Google Maps KEY not working? Try to load another key from the server.
  // After that, load the map again.
  Preferences.updateGoogleMapsKEY((googleMapsKEY) => loadMapScript());
}
