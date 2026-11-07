// Weather & Sky tab (sky.html): live conditions, forecast and alerts from the
// National Weather Service, plus sunrise and sunset and the moon, worked out
// right here in the browser, with the Cherokee name for the month.

const DAY_MS = 86400000;
const RAD = Math.PI / 180;
const SYNODIC = 29.530588853; // days from one new moon to the next

// ---- Cherokee months (Overhill dialect, the one spoken in Tennessee) ----
// From the Cherokee calendar as recorded by James Mooney (1894) and Durbin
// Feeling's Cherokee-English Dictionary (1975). "aka" is the English moon
// name you'll often see used for the same time of year.
const CHEROKEE_MONTHS = [
  { name: "Unolvtani", syl: "ᎤᏃᎸᏔᏂ", aka: "Cold Moon", meaning: "Its name has been translated as “windblown.” The heart of winter." },
  { name: "Kagali", syl: "ᎧᎦᎵ", aka: "Bony Moon", meaning: "Said to be the month when the stars and moon seem fixed in the sky. As the Bony Moon it was the leanest time of year, when food ran so low that people made soup from bone marrow." },
  { name: "Anayilisv", syl: "ᎠᎾᏱᎵᏒ", aka: "Windy Moon", meaning: "Its name points to the strawberries to come. As the Windy Moon, it is when the winds ready the land for renewal." },
  { name: "Guwoni", syl: "ᎫᏬᏂ", aka: "Flower Moon", meaning: "Named for the ducks coming back. As the Flower Moon, it is when flowers bloom and the earth is renewed." },
  { name: "Anasgvti", syl: "ᎠᎾᏍᎬᏘ", aka: "Planting Moon", meaning: "The month of strawberries, or of making pottery. As the Planting Moon, it is when the corn, beans and squash went into the ground." },
  { name: "Dehaluyi", syl: "ᏕᎭᎷᏱ", aka: "Green Corn Moon", meaning: "Blackberry month. As the Green Corn Moon, it is when the young corn is up." },
  { name: "Guyequoni", syl: "ᎫᏰᏉᏂ", aka: "Ripe Corn Moon", meaning: "Huckleberry month. The corn shows its tassels, and as the first ears ripen comes the Green Corn Ceremony, a time of renewal and forgiveness." },
  { name: "Galoni", syl: "ᎦᎶᏂ", aka: "End of Fruit Moon", meaning: "The month of wild grapes, when the streams run low." },
  { name: "Dulisdi", syl: "ᏚᎵᏍᏗ", aka: "Nut Moon", meaning: "The meaning of its name has been lost. As the Nut Moon, it is when nuts fall and are gathered. The Bounding Bush Feast was held around this time." },
  { name: "Duninodi", syl: "ᏚᏂᏃᏗ", aka: "Harvest Moon", meaning: "Harvest month. The Great New Moon Ceremony, the start of the Cherokee new year, was held in the fall." },
  { name: "Nvdadequa", syl: "ᏅᏓᏕᏆ", aka: "Trading Moon", meaning: "The “big moon” month. Often called the Trading Moon, and in the older list of 13, the Hunting Moon." },
  { name: "Vsgiyi", syl: "ᎥᏍᎩᏱ", aka: "Snow Moon", meaning: "The meaning of its name isn’t known for sure. Often called the Snow Moon, for the first snowfall." },
];

// The 13 moons of the older ceremonial year.
const THIRTEEN_MOONS = [
  { en: "Cold Moon", ch: "Nvda Kanawoga", syl: "ᏅᏓ ᎧᎾᏬᎦ" },
  { en: "Bone Moon", ch: "Nvda Kola", syl: "ᏅᏓ ᎪᎳ", note: "so little food, people made soup from bone marrow" },
  { en: "Wind Moon", ch: "Nvda Unole", syl: "ᏅᏓ ᎤᏃᎴ", note: "winds ready the land for renewal" },
  { en: "Flower Moon", ch: "Nvda Atsilusgi", syl: "ᏅᏓ ᎠᏥᎷᏍᎩ", note: "flowers bloom and the earth is renewed" },
  { en: "Planting Moon", ch: "Nvda Gahlvsga", syl: "ᏅᏓ ᎦᏢᏍᎦ", note: "“putting it in a hole”" },
  { en: "Green Corn Moon", ch: "Nvda Seluitseiyusdi", syl: "ᏅᏓ ᏎᎷᎢᏤᎢᏳᏍᏗ", note: "the corn is up" },
  { en: "Corn in Tassel Moon", ch: "Nvda Utsidsata", syl: "ᏅᏓ ᎤᏥᏣᏔ", note: "the corn shows its tassel" },
  { en: "Ripe Corn Moon", ch: "Nvda Seluuwanvsa", syl: "ᏅᏓ ᏎᎷᎤᏩᏅᏌ" },
  { en: "End of Fruit Moon", ch: "Nvda Udatanvagisdi Ulisdv", syl: "ᏅᏓ ᎤᏓᏔᏅᎠᎩᏍᏗ ᎤᎵᏍᏛ" },
  { en: "Nut Moon", ch: "Nvda Udatanv", syl: "ᏅᏓ ᎤᏓᏔᏅ" },
  { en: "Harvest Moon", ch: "Nvda Tsiyahloha", syl: "ᏅᏓ ᏥᎠᎶᎭ" },
  { en: "Hunting Moon", ch: "Nvda Ganohalidoha", syl: "ᏅᏓ ᎦᏃᎭᎵᏙᎭ" },
  { en: "Snow Moon", ch: "Nvda Gutiha", syl: "ᏅᏓ ᎫᏘᎭ", note: "first snowfall" },
];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
const hourFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", timeZone: "America/New_York" });
const dateFmt = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/New_York" });

// ---- Moon ----
// New and full moon times by Jean Meeus' method (Astronomical Algorithms,
// ch. 49), good to a few minutes. k counts lunations from January 2000;
// a whole k is a new moon and k + 0.5 a full moon.
function moonPhaseTime(k) {
  const T = k / 1236.85;
  let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T - 0.00000015 * T ** 3 + 0.00000000073 * T ** 4;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const M = (2.5534 + 29.1053567 * k - 0.0000014 * T * T) * RAD;
  const Mp = (201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T ** 3) * RAD;
  const F = (160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T ** 3) * RAD;
  const Om = (124.7746 - 1.56375588 * k + 0.0020672 * T * T) * RAD;
  const full = Math.abs(k % 1) > 0.25;
  const c = full
    ? [-0.40614, 0.17302, 0.01614, 0.01043, 0.00734, -0.00515, 0.00209]
    : [-0.4072, 0.17241, 0.01608, 0.01039, 0.00739, -0.00514, 0.00208];
  jde += c[0] * Math.sin(Mp) + c[1] * E * Math.sin(M) + c[2] * Math.sin(2 * Mp) + c[3] * Math.sin(2 * F)
    + c[4] * E * Math.sin(Mp - M) + c[5] * E * Math.sin(Mp + M) + c[6] * E * E * Math.sin(2 * M)
    - 0.00111 * Math.sin(Mp - 2 * F) - 0.00057 * Math.sin(Mp + 2 * F) + 0.00056 * E * Math.sin(2 * Mp + M)
    - 0.00042 * Math.sin(3 * Mp) + 0.00042 * E * Math.sin(M + 2 * F) + 0.00038 * E * Math.sin(M - 2 * F)
    - 0.00024 * E * Math.sin(2 * Mp - M) - 0.00017 * Math.sin(Om);
  return new Date((jde - 2440587.5) * DAY_MS);
}

function moonNow(now = new Date()) {
  const jd = now.getTime() / DAY_MS + 2440587.5;
  let k = Math.floor((jd - 2451550.09766) / SYNODIC);
  // Step until we have the new moon just before now.
  while (moonPhaseTime(k) > now) k--;
  while (moonPhaseTime(k + 1) <= now) k++;
  const lastNew = moonPhaseTime(k);
  const nextNew = moonPhaseTime(k + 1);
  const full = moonPhaseTime(k + 0.5);
  const age = (now - lastNew) / DAY_MS;
  const fraction = (now - lastNew) / (nextNew - lastNew); // 0 new, 0.5 full
  return {
    age, fraction,
    lit: (1 - Math.cos(2 * Math.PI * fraction)) / 2,
    nextFull: full > now ? full : moonPhaseTime(k + 1.5),
    nextNew,
  };
}

function phaseName(m) {
  const d = m.age, len = SYNODIC;
  if (d < 1 || d > len - 1) return { name: "New Moon", emoji: "🌑" };
  if (Math.abs(d - len / 4) < 1) return { name: "First Quarter", emoji: "🌓" };
  if (Math.abs(d - len / 2) < 1) return { name: "Full Moon", emoji: "🌕" };
  if (Math.abs(d - (3 * len) / 4) < 1) return { name: "Last Quarter", emoji: "🌗" };
  if (d < len / 4) return { name: "Waxing Crescent", emoji: "🌒" };
  if (d < len / 2) return { name: "Waxing Gibbous", emoji: "🌔" };
  if (d < (3 * len) / 4) return { name: "Waning Gibbous", emoji: "🌖" };
  return { name: "Waning Crescent", emoji: "🌘" };
}

// The moon as we see it from Tennessee: lit on the right while it grows,
// on the left while it shrinks.
let moonId = 0;
function moonSvg(fraction, size) {
  const r = 48, cx = 50, cy = 50;
  const id = "m" + moonId++;
  const rx = Math.abs(Math.cos(2 * Math.PI * fraction)) * r;
  const waxing = fraction < 0.5;
  const crescent = fraction < 0.25 || fraction > 0.75;
  const outer = waxing ? 1 : 0;
  const inner = waxing ? (crescent ? 0 : 1) : (crescent ? 1 : 0);
  const lit = `M${cx} ${cy - r} A${r} ${r} 0 0 ${outer} ${cx} ${cy + r} A${rx.toFixed(2)} ${r} 0 0 ${inner} ${cx} ${cy - r}Z`;
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${escapeHtml(phaseName(moonNow()).name)}">
    <defs>
      <radialGradient id="${id}-lit" cx="40%" cy="38%" r="70%">
        <stop offset="0" stop-color="#fffdf2"/><stop offset=".7" stop-color="#efe6cf"/><stop offset="1" stop-color="#cfc3a6"/>
      </radialGradient>
      <clipPath id="${id}-clip"><path d="${lit}"/></clipPath>
    </defs>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#2a2440"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" opacity=".05"/>
    <g clip-path="url(#${id}-clip)">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}-lit)"/>
      <g fill="#b9ab8c" opacity=".45">
        <circle cx="36" cy="34" r="9"/><circle cx="62" cy="58" r="12"/><circle cx="40" cy="66" r="6"/>
        <circle cx="66" cy="30" r="5"/><circle cx="28" cy="52" r="4"/><circle cx="54" cy="78" r="4"/>
      </g>
    </g>
  </svg>`;
}

// ---- Sun ----
// Sunrise and sunset by the standard sunrise equation (NOAA), within a
// minute or two.
function sunTimes(date, lat = HOME.lat, lon = HOME.lon) {
  const noon = new Date(date); noon.setHours(12, 0, 0, 0);
  const n = Math.round(noon.getTime() / DAY_MS + 2440587.5 - 2451545.0 + 0.0008);
  const Jstar = n - lon / 360;
  const M = (357.5291 + 0.98560028 * Jstar) % 360;
  const C = 1.9148 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 0.0003 * Math.sin(3 * M * RAD);
  const lambda = (M + C + 180 + 102.9372) % 360;
  const transit = 2451545 + Jstar + 0.0053 * Math.sin(M * RAD) - 0.0069 * Math.sin(2 * lambda * RAD);
  const dec = Math.asin(Math.sin(lambda * RAD) * Math.sin(23.4397 * RAD));
  const cosW = (Math.sin(-0.833 * RAD) - Math.sin(lat * RAD) * Math.sin(dec)) / (Math.cos(lat * RAD) * Math.cos(dec));
  const w = Math.acos(Math.max(-1, Math.min(1, cosW))) / RAD;
  const toDate = (j) => new Date((j - 2440587.5) * DAY_MS);
  return { rise: toDate(transit - w / 360), set: toDate(transit + w / 360) };
}

function timeOfDay(now, sun) {
  const m = 45 * 60000;
  if (Math.abs(now - sun.rise) < m) return "dawn";
  if (Math.abs(now - sun.set) < m) return "dusk";
  return now > sun.rise && now < sun.set ? "day" : "night";
}

// ---- Rendering: sun and moon ----
function renderSunMoon() {
  const now = new Date();
  const sun = sunTimes(now);
  document.getElementById("sunrise").textContent = timeFmt.format(sun.rise);
  document.getElementById("sunset").textContent = timeFmt.format(sun.set);
  const mins = Math.round((sun.set - sun.rise) / 60000);
  document.getElementById("daylength").textContent = `${Math.floor(mins / 60)} h ${mins % 60} m`;
  // Put the sun on its arc (below the line at night).
  const t = Math.max(0, Math.min(1, (now - sun.rise) / (sun.set - sun.rise)));
  const a = Math.PI * (1 - t);
  const dot = document.getElementById("sun-dot");
  dot.setAttribute("cx", (150 + 130 * Math.cos(a)).toFixed(1));
  dot.setAttribute("cy", (140 - 130 * Math.sin(a)).toFixed(1));
  dot.classList.toggle("is-down", now < sun.rise || now > sun.set);

  const moon = moonNow(now);
  const phase = phaseName(moon);
  document.getElementById("big-moon").innerHTML = moonSvg(moon.fraction, 220);
  document.getElementById("mini-moon").innerHTML = moonSvg(moon.fraction, 64);
  document.getElementById("moon-phase").textContent = phase.name;
  document.getElementById("mini-moon-name").textContent = phase.name;
  document.getElementById("moon-lit").textContent =
    `${Math.round(moon.lit * 100)}% lit · ${Math.floor(moon.age)} day${Math.floor(moon.age) === 1 ? "" : "s"} since the new moon`;
  const soon = [
    ["Next full moon", moon.nextFull, "🌕"],
    ["Next new moon", moon.nextNew, "🌑"],
  ].sort((x, y) => x[1] - y[1]);
  document.getElementById("moon-dates").innerHTML = soon.map(([label, d, e]) =>
    `<div><dt>${e} ${label}</dt><dd>${dateFmt.format(d)} · ${timeFmt.format(d)}</dd></div>`).join("");

  const cm = CHEROKEE_MONTHS[now.getMonth()];
  const next = CHEROKEE_MONTHS[(now.getMonth() + 1) % 12];
  document.getElementById("cm-syllabary").textContent = cm.syl;
  document.getElementById("cm-name").textContent = cm.name;
  document.getElementById("cm-say").textContent = `${cm.aka} · ${MONTH_NAMES[now.getMonth()]}`;
  document.getElementById("cm-meaning").textContent = cm.meaning;
  document.getElementById("cm-note").innerHTML =
    `Next: <strong>${escapeHtml(next.name)}</strong> (${escapeHtml(next.syl)}), the ${escapeHtml(next.aka)}.`;
  document.getElementById("mini-moon-cherokee").textContent = `${cm.syl} ${cm.name} · ${cm.aka}`;

  document.getElementById("moon-ring").innerHTML = THIRTEEN_MOONS.map((m, i) => `
    <li>
      <span class="ring-num">${i + 1}</span>
      <span class="ring-text"><strong>${escapeHtml(m.en)}</strong>
      <span class="ring-ch" lang="chr">${escapeHtml(m.syl)}</span>
      <span class="ring-tr">${escapeHtml(m.ch)}${m.note ? ` · <em>${escapeHtml(m.note)}</em>` : ""}</span></span>
    </li>`).join("");

  document.getElementById("month-grid").innerHTML = CHEROKEE_MONTHS.map((m, i) => `
    <li class="${i === now.getMonth() ? "is-now" : ""}"${i === now.getMonth() ? ' aria-current="date"' : ""}>
      <span class="mg-month">${MONTH_NAMES[i]}${i === now.getMonth() ? " · now" : ""}</span>
      <span class="mg-syl" lang="chr">${escapeHtml(m.syl)}</span>
      <strong class="mg-name">${escapeHtml(m.name)}</strong>
      <span class="mg-aka">${escapeHtml(m.aka)}</span>
    </li>`).join("");

  return { now, sun };
}

// ---- Rendering: weather ----
const cToF = (c) => (c == null ? null : Math.round((c * 9) / 5 + 32));
const kmhToMph = (k) => (k == null ? null : Math.round(k / 1.609));
const compass = (deg) => (deg == null ? "" : ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(deg / 45) % 8]);

function setScene(kind, time) {
  const hero = document.getElementById("sky");
  hero.dataset.kind = kind.replace("-night", "");
  hero.dataset.time = time;
}

async function renderNow(sky) {
  const [hourly, obs] = await Promise.allSettled([cachedJson(NWS.hourly, 15), cachedJson(NWS.station, 10)]);
  if (hourly.status !== "fulfilled") throw hourly.reason;
  const periods = hourly.value.properties.periods;
  const first = periods[0];
  const isDay = sky.now > sky.sun.rise && sky.now < sky.sun.set;

  let temp = first.temperature;
  let cond = first.shortForecast;
  let facts = [];
  let updated = "Forecast for this hour";
  const o = obs.status === "fulfilled" ? obs.value.properties : null;
  const fresh = o && o.temperature?.value != null && Date.now() - new Date(o.timestamp) < 2 * 3600000;
  if (fresh) {
    temp = cToF(o.temperature.value);
    if (o.textDescription) cond = o.textDescription;
    const feels = cToF(o.heatIndex?.value ?? o.windChill?.value);
    if (feels != null && Math.abs(feels - temp) >= 2) facts.push(["Feels like", `${feels}°`]);
    if (o.relativeHumidity?.value != null) facts.push(["Humidity", `${Math.round(o.relativeHumidity.value)}%`]);
    const wind = kmhToMph(o.windSpeed?.value);
    if (wind != null) facts.push(["Wind", wind === 0 ? "Calm" : `${compass(o.windDirection?.value)} ${wind} mph`]);
    const gust = kmhToMph(o.windGust?.value);
    if (gust) facts.push(["Gusts", `${gust} mph`]);
    updated = `Measured at the Cleveland Regional Jetport, ${timeFmt.format(new Date(o.timestamp))}`;
  } else {
    facts.push(["Wind", `${first.windDirection} ${first.windSpeed}`]);
    if (first.relativeHumidity?.value != null) facts.push(["Humidity", `${first.relativeHumidity.value}%`]);
  }
  const rain = first.probabilityOfPrecipitation?.value;
  if (rain != null) facts.push(["Chance of rain", `${rain}%`]);

  document.getElementById("now-temp").textContent = `${temp}°`;
  document.getElementById("now-icon").textContent = weatherEmoji(cond, isDay);
  document.getElementById("now-cond").textContent = cond;
  document.getElementById("now-facts").innerHTML = facts.map(([k, v]) => `<li><span>${k}</span><strong>${escapeHtml(v)}</strong></li>`).join("");
  document.getElementById("now-updated").textContent = updated;
  setScene(weatherKind(cond, isDay), timeOfDay(sky.now, sky.sun));

  // Next 24 hours.
  document.getElementById("hourly").innerHTML = periods.slice(0, 24).map((p, i) => {
    const start = new Date(p.startTime);
    const pop = p.probabilityOfPrecipitation?.value;
    return `<li${i === 0 ? ' class="is-now"' : ""}>
      <span class="h-time">${i === 0 ? "Now" : hourFmt.format(start)}</span>
      <span class="h-icon" aria-hidden="true">${weatherEmoji(p.shortForecast, p.isDaytime)}</span>
      <span class="visually-hidden">${escapeHtml(p.shortForecast)}</span>
      <strong class="h-temp">${p.temperature}°</strong>
      <span class="h-pop${pop >= 30 ? " is-wet" : ""}">${pop ? `💧${pop}%` : "&nbsp;"}</span>
    </li>`;
  }).join("");
}

async function renderWeek() {
  const data = await cachedJson(NWS.daily, 30);
  const periods = data.properties.periods;
  // Pair each day with the night after it.
  const days = [];
  for (const p of periods) {
    if (p.isDaytime || !days.length) days.push({ day: p.isDaytime ? p : null, night: p.isDaytime ? null : p });
    else days[days.length - 1].night = p;
  }
  const temps = periods.map((p) => p.temperature);
  const lo = Math.min(...temps), hi = Math.max(...temps);
  const pct = (t) => (((t - lo) / Math.max(1, hi - lo)) * 100).toFixed(1);
  document.getElementById("week").innerHTML = days.slice(0, 7).map((d, i) => {
    const main = d.day || d.night;
    const start = new Date(main.startTime);
    const high = d.day?.temperature, low = d.night?.temperature;
    const pop = Math.max(d.day?.probabilityOfPrecipitation?.value || 0, d.night?.probabilityOfPrecipitation?.value || 0);
    const name = i === 0 ? (d.day ? "Today" : "Tonight") : DOW[start.getDay()];
    const barLo = low ?? high, barHi = high ?? low;
    return `<li>
      <details>
        <summary>
          <span class="w-day">${name}<small>${MONTH_NAMES[start.getMonth()].slice(0, 3)} ${start.getDate()}</small></span>
          <span class="w-icon" aria-hidden="true">${weatherEmoji(main.shortForecast, !!d.day)}</span>
          <span class="w-cond">${escapeHtml(main.shortForecast)}${pop >= 20 ? ` <span class="w-pop">💧${pop}%</span>` : ""}</span>
          <span class="w-temps">
            <span class="w-lo">${low != null ? low + "°" : ""}</span>
            <span class="w-bar"><span style="left:${pct(barLo)}%;right:${(100 - pct(barHi)).toFixed(1)}%"></span></span>
            <span class="w-hi">${high != null ? high + "°" : ""}</span>
          </span>
        </summary>
        <div class="w-more">
          ${d.day ? `<p><strong>${escapeHtml(d.day.name)}:</strong> ${escapeHtml(d.day.detailedForecast)}</p>` : ""}
          ${d.night ? `<p><strong>${escapeHtml(d.night.name)}:</strong> ${escapeHtml(d.night.detailedForecast)}</p>` : ""}
        </div>
      </details>
    </li>`;
  }).join("");
}

async function renderAlerts() {
  const list = document.getElementById("alert-list");
  try {
    const data = await cachedJson(NWS.alerts, 4);
    const alerts = (data.features || []).map((f) => f.properties);
    if (!alerts.length) {
      list.innerHTML = `<p class="alert-none"><span aria-hidden="true">✅</span> No weather alerts for Cleveland or Bradley County right now. <span>Checked ${timeFmt.format(new Date())}.</span></p>`;
      return;
    }
    const order = { warning: 0, watch: 1, advisory: 2 };
    alerts.sort((a, b) => order[alertLevel(a.event)] - order[alertLevel(b.event)]);
    list.innerHTML = alerts.map((a) => {
      const level = alertLevel(a.event);
      const ends = a.ends || a.expires;
      return `<article class="alert-card alert-${level}">
        <p class="alert-kind">${level === "warning" ? "Warning · take action" : level === "watch" ? "Watch · be ready" : "Advisory · be aware"}</p>
        <h3>${escapeHtml(a.event)}</h3>
        ${a.headline ? `<p class="alert-headline">${escapeHtml(a.headline)}</p>` : ""}
        <p class="alert-when">${a.onset || a.effective ? `From ${dateFmt.format(new Date(a.onset || a.effective))}, ${timeFmt.format(new Date(a.onset || a.effective))}` : ""}${ends ? ` until ${dateFmt.format(new Date(ends))}, ${timeFmt.format(new Date(ends))}` : ""}</p>
        ${a.instruction ? `<p class="alert-do"><strong>What to do:</strong> ${escapeHtml(a.instruction)}</p>` : ""}
        <details><summary>Full alert</summary><p class="alert-desc">${escapeHtml(a.description)}</p><p class="alert-area">${escapeHtml(a.areaDesc)}</p></details>
      </article>`;
    }).join("");
  } catch (e) {
    list.innerHTML = `<p class="alert-none alert-error">We couldn’t reach the National Weather Service just now. Check <a href="https://alerts.weather.gov/search?zone=TNZ100">alerts for Bradley County at weather.gov</a>.</p>`;
  }
}

function weatherError() {
  document.getElementById("now-cond").innerHTML =
    `Couldn’t reach the National Weather Service. <a href="https://forecast.weather.gov/MapClick.php?lat=35.1595&lon=-84.8766">See the forecast at weather.gov</a>.`;
}

function refresh() {
  const sky = renderSunMoon();
  // Until the weather loads, show a clear sky for the time of day.
  if (!document.getElementById("hourly").children.length) setScene("clear", timeOfDay(sky.now, sky.sun));
  renderNow(sky).catch(weatherError);
  renderWeek().catch(() => {
    document.getElementById("week").innerHTML = `<li class="alert-none">The week’s forecast didn’t load. <a href="https://forecast.weather.gov/MapClick.php?lat=35.1595&lon=-84.8766">See it at weather.gov</a>.</li>`;
  });
  renderAlerts();
}

refresh();
// Keep it current while the page sits open.
setInterval(refresh, 5 * 60000);
