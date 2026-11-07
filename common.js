// Shared by every page: the mobile menu, the section tabs, the little weather
// reading on the Weather & Sky tab, and a ribbon that appears on every page
// when the National Weather Service has an alert out for Cleveland.

// Cleveland, TN (downtown). The National Weather Service needs no key.
const HOME = { lat: 35.1595, lon: -84.8766 };
const NWS = {
  hourly: "https://api.weather.gov/gridpoints/MRX/39,13/forecast/hourly",
  daily: "https://api.weather.gov/gridpoints/MRX/39,13/forecast",
  station: "https://api.weather.gov/stations/KRZR/observations/latest",
  alerts: `https://api.weather.gov/alerts/active?point=${HOME.lat},${HOME.lon}`,
};

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

// Fetch JSON, keeping a copy for a few minutes so moving between tabs doesn't
// ask the Weather Service again each time.
async function cachedJson(url, minutes = 10) {
  const key = "ctncr:" + url;
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || "null");
    if (saved && Date.now() - saved.at < minutes * 60000) return saved.data;
  } catch (e) { /* storage can be blocked; just fetch */ }
  const resp = await fetch(url, { headers: { Accept: "application/geo+json" } });
  if (!resp.ok) throw new Error(`${resp.status} from ${url}`);
  const data = await resp.json();
  try { sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data })); } catch (e) { /* ignore */ }
  return data;
}

// A weather "kind" from the Weather Service's short forecast text. The sky
// page uses it to pick the animated background; everything uses the emoji.
function weatherKind(text = "", isDay = true) {
  const t = text.toLowerCase();
  if (/thunder|t-storm|tstorm/.test(t)) return "storm";
  if (/snow|flurr|sleet|blizzard|ice|freezing/.test(t)) return "snow";
  if (/rain|shower|drizzle/.test(t)) return "rain";
  if (/fog|haze|smoke|mist/.test(t)) return "fog";
  if (/mostly cloudy|overcast|^cloudy|cloudy$/.test(t)) return "cloudy";
  if (/partly|mostly sunny|mostly clear|few clouds/.test(t)) return isDay ? "partly" : "partly-night";
  return isDay ? "clear" : "clear-night";
}

const WEATHER_EMOJI = {
  storm: "⛈️", snow: "🌨️", rain: "🌧️", fog: "🌫️", cloudy: "☁️",
  partly: "⛅", "partly-night": "☁️", clear: "☀️", "clear-night": "🌙",
};

function weatherEmoji(text, isDay) {
  return WEATHER_EMOJI[weatherKind(text, isDay)];
}

// How serious an alert is, for its color: warning (red), watch (orange),
// advisory or statement (yellow).
function alertLevel(event = "") {
  if (/warning|emergency/i.test(event)) return "warning";
  if (/watch/i.test(event)) return "watch";
  return "advisory";
}

// ---- Mobile navigation ----
const navToggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");
if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("open", !open);
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      navToggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("open");
    }
  });
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Section tabs ----
(function markTab() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".tabbar a").forEach((a) => {
    if (a.getAttribute("href") === page) {
      a.setAttribute("aria-current", "page");
      // On phones the tabs scroll sideways; keep the current one in view.
      const bar = a.parentElement;
      bar.scrollLeft = a.offsetLeft - (bar.clientWidth - a.offsetWidth) / 2;
    }
  });
})();

// The current temperature on the Weather & Sky tab.
(async function tabWeather() {
  const chip = document.getElementById("tab-wx");
  if (!chip) return;
  try {
    const data = await cachedJson(NWS.hourly, 20);
    const now = data.properties.periods[0];
    chip.textContent = `${weatherEmoji(now.shortForecast, now.isDaytime)} ${now.temperature}°`;
    chip.hidden = false;
  } catch (e) { /* the tab still works without it */ }
})();

// ---- Weather alert ribbon ----
(async function alertRibbon() {
  const crisis = document.querySelector(".crisis-bar");
  if (!crisis) return;
  try {
    const data = await cachedJson(NWS.alerts, 5);
    const alerts = (data.features || []).map((f) => f.properties);
    if (!alerts.length) return;
    const order = { warning: 0, watch: 1, advisory: 2 };
    alerts.sort((a, b) => order[alertLevel(a.event)] - order[alertLevel(b.event)]);
    const top = alerts[0];
    const names = [...new Set(alerts.map((a) => a.event))].join(" · ");
    const ribbon = document.createElement("a");
    ribbon.className = `wx-ribbon wx-${alertLevel(top.event)}`;
    ribbon.href = "sky.html#alerts";
    ribbon.innerHTML = `<span class="wrap"><span class="wx-ribbon-icon" aria-hidden="true">⚠️</span>
      <strong>${escapeHtml(names)}</strong>
      <span class="wx-ribbon-more">for Cleveland &amp; Bradley County · See details →</span></span>`;
    crisis.after(ribbon);
  } catch (e) { /* no ribbon if the Weather Service can't be reached */ }
})();
