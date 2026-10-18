// How many resources to show before the "Show more" button.
const PAGE_SIZE = 9;

// No category is selected at first, so nothing shows until someone picks one or searches.
const state = { query: "", category: null, limit: PAGE_SIZE };

const els = {
  search: document.getElementById("search"),
  chips: document.getElementById("chips"),
  cards: document.getElementById("cards"),
  count: document.getElementById("result-count"),
  loadMore: document.getElementById("load-more"),
};

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

function telHref(phone) {
  return "tel:" + phone.replace(/[^\d]/g, "");
}

function mapHref(address) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address);
}

function renderChips() {
  const options = [["all", "All"], ...Object.entries(CATEGORIES)];
  els.chips.innerHTML = options
    .map(([key, label]) =>
      `<button type="button" class="chip" data-category="${key}" aria-pressed="${state.category === key}">${escapeHtml(label)}</button>`)
    .join("");
}

function matches(resource) {
  if (state.category && state.category !== "all" && resource.category !== state.category) return false;
  if (!state.query) return true;
  const haystack = [resource.name, resource.notes, resource.address, CATEGORIES[resource.category]]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return state.query.split(/\s+/).every((term) => haystack.includes(term));
}

function renderCard(r) {
  const links = [];
  if (r.phone) links.push(`<a href="${telHref(r.phone)}">Call ${escapeHtml(r.phone)}</a>`);
  if (r.address) links.push(`<a href="${mapHref(r.address)}" target="_blank" rel="noopener">Directions</a>`);
  if (r.url) links.push(`<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">Website</a>`);
  return `
    <article class="card">
      <span class="tag tag-${r.category}">${escapeHtml(CATEGORIES[r.category])}</span>
      <h3>${escapeHtml(r.name)}</h3>
      ${r.notes ? `<p>${escapeHtml(r.notes)}</p>` : ""}
      ${r.address ? `<p class="address">${escapeHtml(r.address)}</p>` : ""}
      <div class="card-links">${links.join("")}</div>
    </article>`;
}

function render() {
  els.chips.querySelectorAll(".chip").forEach((chip) => {
    chip.setAttribute("aria-pressed", String(chip.dataset.category === state.category));
  });
  if (!state.category && !state.query) {
    els.cards.innerHTML = `<div class="empty prompt"><p><strong>Choose a category above, or search, to see resources.</strong></p><p>Not sure where to start? Dial <a href="tel:211">211</a> to talk with someone who can help.</p></div>`;
    els.count.textContent = `${RESOURCES.length} resources available`;
    els.loadMore.hidden = true;
    return;
  }
  const results = RESOURCES.filter(matches);
  const shown = results.slice(0, state.limit);
  els.cards.innerHTML = results.length
    ? shown.map(renderCard).join("")
    : `<div class="empty"><p>No matches. Try a different word, or dial <a href="tel:211">211</a> to talk with someone who can help.</p></div>`;
  els.count.textContent = shown.length < results.length
    ? `Showing ${shown.length} of ${results.length} resources`
    : `Showing ${results.length} of ${RESOURCES.length} resources`;
  const remaining = results.length - shown.length;
  els.loadMore.hidden = remaining <= 0;
  els.loadMore.textContent = `Show all ${results.length} (${remaining} more)`;
}

els.search.addEventListener("input", (e) => {
  state.query = e.target.value.trim().toLowerCase();
  state.limit = PAGE_SIZE;
  render();
});

els.chips.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  // Tapping the selected category again clears it.
  state.category = state.category === chip.dataset.category ? null : chip.dataset.category;
  state.limit = PAGE_SIZE;
  render();
});

els.loadMore.addEventListener("click", () => {
  const firstNew = state.limit;
  state.limit = Infinity;
  render();
  // Move keyboard focus to the first newly shown card's first link.
  els.cards.children[firstNew]?.querySelector("a")?.focus({ preventScroll: true });
});

document.querySelectorAll("[data-jump]").forEach((link) => {
  link.addEventListener("click", () => {
    state.category = link.dataset.jump;
    state.limit = PAGE_SIZE;
    state.query = "";
    els.search.value = "";
    render();
  });
});

// Mobile navigation
const navToggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");
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

document.getElementById("year").textContent = new Date().getFullYear();

renderChips();
render();

// ---- Shared date helpers ----

const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Parse "YYYY-MM-DD" as a local date (new Date("2026-11-07") would be UTC midnight).
function parseDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function shortDate(date) {
  return `${WEEKDAYS[date.getDay()].slice(0, 3)}, ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

// ---- Food calendar ----

function ruleMatches(rule, date) {
  if (rule.weekly) return rule.weekly.includes(date.getDay());
  if (rule.dates) return rule.dates.includes(dateKey(date));
  if (rule.monthly) {
    if (date.getDay() !== rule.monthly.day) return false;
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    if (rule.monthly.week === -1) return date.getDate() + 7 > daysInMonth;
    return Math.ceil(date.getDate() / 7) === rule.monthly.week;
  }
  return false;
}

// The hours a site is open on a date, or null if it isn't open. `repeat` can be
// one rule or a list of rules, each with an optional time of its own.
function hoursOn(site, date) {
  if (!site.repeat) return null;
  const rules = Array.isArray(site.repeat) ? site.repeat : [site.repeat];
  const rule = rules.find((r) => ruleMatches(r, date));
  return rule ? rule.time || site.time || "" : null;
}

// How many days ahead the day picker reaches.
const CAL_DAYS = 30;

const cal = {
  select: document.getElementById("day-select"),
  list: document.getElementById("day-list"),
  count: document.getElementById("day-count"),
  legend: document.getElementById("cal-legend"),
  hidden: new Set(), // kinds switched off in the legend
  day: "0", // days from today, or "call" for places without set dates
};

function calDate(offset) {
  const today = startOfToday();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
}

function shownSites() {
  return FOOD_SCHEDULE.filter((site) => !cal.hidden.has(site.kind));
}

// The places open on a date, each with its hours that day.
function openOn(date) {
  return shownSites()
    .map((site) => ({ site, time: hoursOn(site, date) }))
    .filter((o) => o.time !== null);
}

function places(n) {
  return `${n} ${n === 1 ? "place" : "places"}`;
}

function renderDayOptions() {
  const options = [];
  for (let i = 0; i < CAL_DAYS; i++) {
    const date = calDate(i);
    const name = i === 0 ? `Today, ${shortDate(date)}` : i === 1 ? `Tomorrow, ${shortDate(date)}` : shortDate(date);
    options.push(`<option value="${i}">${name} (${places(openOn(date).length)})</option>`);
  }
  const callCount = shownSites().filter((site) => !site.repeat).length;
  options.push(`<option value="call">Dates vary, call ahead (${places(callCount)})</option>`);
  cal.select.innerHTML = options.join("");
  cal.select.value = cal.day;
}

function foodCard({ site, time }) {
  const links = [];
  if (site.phone) links.push(`<a href="${telHref(site.phone)}">Call ${escapeHtml(site.phone)}</a>`);
  if (site.address) links.push(`<a href="${mapHref(site.address)}" target="_blank" rel="noopener">Directions</a>`);
  if (site.url) links.push(`<a href="${escapeHtml(site.url)}" target="_blank" rel="noopener">Website</a>`);
  return `
    <li class="card day-card kind-${site.kind}" id="site-${site.id}">
      <span class="tag cal-key">${escapeHtml(FOOD_KINDS[site.kind])}</span>
      ${time ? `<p class="day-time">${escapeHtml(time)}</p>` : ""}
      <h3>${escapeHtml(site.name)}</h3>
      <p>${site.repeat ? "" : "<strong>Call for dates:</strong> "}${escapeHtml(site.when)}</p>
      ${site.notes ? `<p>${escapeHtml(site.notes)}</p>` : ""}
      ${site.address ? `<p class="address">${escapeHtml(site.address)}</p>` : ""}
      <div class="card-links">${links.join("")}</div>
    </li>`;
}

function renderDay() {
  let open;
  if (cal.day === "call") {
    open = shownSites().filter((site) => !site.repeat).map((site) => ({ site, time: "" }));
    cal.count.textContent = `${places(open.length)} with dates that change. Call to ask when they're open next.`;
  } else {
    const offset = Number(cal.day);
    const date = calDate(offset);
    open = openOn(date);
    const when = offset === 0 ? "today" : offset === 1 ? "tomorrow" : `on ${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
    cal.count.textContent = open.length ? `${places(open.length)} open ${when}.` : "";
  }
  cal.list.classList.toggle("is-single", open.length < 2);
  cal.list.scrollLeft = 0;
  cal.list.innerHTML = open.length
    ? open.map(foodCard).join("")
    : `<li class="empty"><p><strong>Nothing on the calendar this day.</strong></p><p>Try another day, or pick “Dates vary, call ahead” in the list.</p></li>`;
}

function renderLegend() {
  cal.legend.innerHTML = Object.entries(FOOD_KINDS)
    .map(([kind, label]) =>
      `<button type="button" class="cal-key kind-${kind}" data-kind="${kind}" aria-pressed="${!cal.hidden.has(kind)}">${escapeHtml(label)}</button>`)
    .join("");
}

// Tapping a legend key shows or hides that kind.
cal.legend.addEventListener("click", (e) => {
  const key = e.target.closest("[data-kind]");
  if (!key) return;
  const kind = key.dataset.kind;
  if (cal.hidden.has(kind)) cal.hidden.delete(kind);
  else cal.hidden.add(kind);
  renderLegend();
  renderDayOptions();
  renderDay();
});

cal.select.addEventListener("change", () => {
  cal.day = cal.select.value;
  renderDay();
});

renderLegend();
renderDayOptions();
renderDay();

// ---- Community bulletin board ----

// The board shows a week at a time, starting today; the picker reaches this many weeks ahead.
const BOARD_WEEKS = 8;
const SOURCE_TAGS = { library: "Library", city: "City" };

const board = {
  el: document.getElementById("board"),
  select: document.getElementById("board-select"),
  count: document.getElementById("board-count"),
  week: 0,
};

// CTNCR's own events plus the ones gathered each morning into auto-events.js.
const ALL_EVENTS = [...EVENTS, ...(typeof AUTO_EVENTS === "undefined" ? [] : AUTO_EVENTS)];

function eventsOn(day) {
  return ALL_EVENTS
    .filter((e) => parseDate(e.date) <= day && parseDate(e.endDate || e.date) >= day)
    .sort((a, b) => (a.start || "").localeCompare(b.start || "") || a.title.localeCompare(b.title));
}

function weekDays(week) {
  return Array.from({ length: 7 }, (_, i) => calDate(week * 7 + i));
}

function eventLabel(n) {
  return `${n} ${n === 1 ? "event" : "events"}`;
}

function weekCount(week) {
  return weekDays(week).reduce((sum, day) => sum + eventsOn(day).length, 0);
}

function renderBoardOptions() {
  const options = [];
  for (let i = 0; i < BOARD_WEEKS; i++) {
    const days = weekDays(i);
    const first = days[0];
    const last = days[6];
    const span = `${MONTHS[first.getMonth()].slice(0, 3)} ${first.getDate()}–${last.getMonth() === first.getMonth() ? "" : MONTHS[last.getMonth()].slice(0, 3) + " "}${last.getDate()}`;
    options.push(`<option value="${i}">${i === 0 ? `This week, ${span}` : span} (${weekCount(i)})</option>`);
  }
  board.select.innerHTML = options.join("");
  board.select.value = String(board.week);
}

function agendaItem(e) {
  const tag = [SOURCE_TAGS[e.source], e.audience].filter(Boolean).join(" · ");
  const where = e.location || e.address || "";
  let when = e.time || "All day";
  if (e.endDate && e.endDate !== e.date) when = `Through ${shortDate(parseDate(e.endDate))}`;
  const links = [];
  if (e.address) links.push(`<a href="${mapHref(e.address)}" target="_blank" rel="noopener">Directions</a>`);
  if (e.url) links.push(`<a href="${escapeHtml(e.url)}" target="_blank" rel="noopener">More info</a>`);
  const fullWhere = [e.location, e.address].filter(Boolean).join(", ");
  return `
    <li>
      <details class="agenda-item">
        <summary>
          <span class="agenda-time">${escapeHtml(when)}</span>
          <span class="agenda-main">
            <span class="agenda-title">${escapeHtml(e.title)}</span>
            ${where ? `<span class="agenda-where">${escapeHtml(where)}</span>` : ""}
          </span>
          ${tag ? `<span class="tag agenda-tag">${escapeHtml(tag)}</span>` : ""}
        </summary>
        <div class="agenda-more">
          ${fullWhere ? `<p class="agenda-where">${escapeHtml(fullWhere)}</p>` : ""}
          ${e.host ? `<p class="agenda-where">Hosted by ${escapeHtml(e.host)}</p>` : ""}
          ${e.description ? `<p>${escapeHtml(e.description)}</p>` : ""}
          ${links.length ? `<div class="card-links">${links.join("")}</div>` : ""}
        </div>
      </details>
    </li>`;
}

function renderBoard() {
  const today = startOfToday();
  const days = weekDays(board.week).map((day) => ({ day, events: eventsOn(day) })).filter((d) => d.events.length);
  const total = days.reduce((sum, d) => sum + d.events.length, 0);
  board.count.textContent = total ? `${eventLabel(total)} from ${shortDate(weekDays(board.week)[0])} to ${shortDate(weekDays(board.week)[6])}.` : "";
  if (!total) {
    board.el.innerHTML = `<div class="empty"><p><strong>Nothing posted for this week yet.</strong></p><p>Know about something free? Send it our way and we'll pin it here.</p></div>`;
    return;
  }
  // Each day is a dropdown; only the first one (today, if anything is on) starts open.
  board.el.innerHTML = days.map(({ day, events }, i) => {
    const isToday = day.getTime() === today.getTime();
    const preview = events.slice(0, 3).map((e) => e.title).join(" · ") + (events.length > 3 ? " …" : "");
    return `
    <details class="agenda-day${isToday ? " is-today" : ""}"${i === 0 ? " open" : ""}>
      <summary class="agenda-day-head">
        <span class="agenda-date" aria-hidden="true">
          <span class="agenda-dow">${isToday ? "Today" : WEEKDAYS[day.getDay()].slice(0, 3)}</span>
          <span class="agenda-num">${day.getDate()}</span>
          <span class="agenda-month">${MONTHS[day.getMonth()].slice(0, 3)}</span>
        </span>
        <span class="agenda-day-info">
          <span class="agenda-day-name"><span class="visually-hidden">${WEEKDAYS[day.getDay()]}, ${MONTHS[day.getMonth()]} ${day.getDate()}: </span>${eventLabel(events.length)}</span>
          <span class="agenda-preview">${escapeHtml(preview)}</span>
        </span>
        <span class="agenda-chevron" aria-hidden="true"></span>
      </summary>
      <ul class="agenda-items">${events.map(agendaItem).join("")}</ul>
    </details>`;
  }).join("");
}

board.select.addEventListener("change", () => {
  board.week = Number(board.select.value);
  renderBoard();
});

renderBoardOptions();
renderBoard();

// ---- Photo gallery ----

const lightbox = {
  dialog: document.getElementById("lightbox"),
  img: document.getElementById("lightbox-img"),
  caption: document.getElementById("lightbox-caption"),
  index: 0,
};

function showPhoto(index) {
  lightbox.index = (index + GALLERY.length) % GALLERY.length;
  const photo = GALLERY[lightbox.index];
  lightbox.img.src = photo.src;
  lightbox.img.alt = photo.alt || "";
  lightbox.caption.textContent = photo.caption || "";
  lightbox.caption.hidden = !photo.caption;
}

// The slideshow advances on its own every few seconds, pauses while someone
// is hovering over or using it, and stays still for people who prefer less motion.
const SLIDE_SECONDS = 6;

const slideshow = {
  root: document.getElementById("photos"),
  slides: [],
  dots: [],
  pauseBtn: document.getElementById("slide-pause"),
  index: 0,
  timer: null,
  paused: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  held: false,
};

function slideHtml(photo, i) {
  const label = escapeHtml(photo.caption || photo.alt || `photo ${i + 1}`);
  const caption = photo.caption ? `<figcaption>${escapeHtml(photo.caption)}</figcaption>` : "";
  if (photo.quote) {
    return `
      <figure class="slide slide-quote" aria-roledescription="slide" aria-label="${i + 1} of ${GALLERY.length}">
        <button type="button" class="slide-open" data-index="${i}" aria-label="See the original message: ${label}">
          <blockquote><p>${escapeHtml(photo.quote)}</p></blockquote>
        </button>
        ${caption}
      </figure>`;
  }
  return `
    <figure class="slide${photo.whole ? " slide-whole" : ""}" aria-roledescription="slide" aria-label="${i + 1} of ${GALLERY.length}">
      <button type="button" class="slide-open" data-index="${i}" aria-label="View larger: ${label}">
        <img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt || "")}"${i ? ' loading="lazy"' : ""}>
      </button>
      ${caption}
    </figure>`;
}

function goToSlide(index) {
  slideshow.index = (index + GALLERY.length) % GALLERY.length;
  slideshow.slides.forEach((slide, i) => {
    const active = i === slideshow.index;
    slide.classList.toggle("is-active", active);
    slide.inert = !active;
    slide.setAttribute("aria-hidden", String(!active));
  });
  slideshow.dots.forEach((dot, i) => dot.setAttribute("aria-current", String(i === slideshow.index)));
}

function scheduleSlide() {
  clearTimeout(slideshow.timer);
  if (slideshow.paused || slideshow.held || GALLERY.length < 2) return;
  slideshow.timer = setTimeout(() => {
    goToSlide(slideshow.index + 1);
    scheduleSlide();
  }, SLIDE_SECONDS * 1000);
}

function setPaused(paused) {
  slideshow.paused = paused;
  slideshow.pauseBtn.textContent = paused ? "▶" : "❚❚";
  slideshow.pauseBtn.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
  scheduleSlide();
}

function renderGallery() {
  if (!GALLERY.length) return;
  slideshow.root.hidden = false;
  document.querySelectorAll(".gallery-link").forEach((link) => { link.hidden = false; });
  const slidesEl = document.getElementById("slides");
  slidesEl.innerHTML = GALLERY.map(slideHtml).join("");
  slideshow.slides = [...slidesEl.children];
  const dotsEl = document.getElementById("slide-dots");
  dotsEl.innerHTML = GALLERY.map((photo, i) => `
    <button type="button" class="slide-dot" data-index="${i}" aria-label="Photo ${i + 1}: ${escapeHtml(photo.caption || photo.alt || "")}"></button>`).join("");
  slideshow.dots = [...dotsEl.children];
  const multiple = GALLERY.length > 1;
  document.querySelector(".slideshow-controls").hidden = !multiple;
  document.getElementById("lightbox-prev").hidden = !multiple;
  document.getElementById("lightbox-next").hidden = !multiple;
  goToSlide(0);
  setPaused(slideshow.paused);
}

document.getElementById("slides").addEventListener("click", (e) => {
  const item = e.target.closest(".slide-open");
  if (!item) return;
  showPhoto(Number(item.dataset.index));
  lightbox.dialog.showModal();
});
document.getElementById("slide-dots").addEventListener("click", (e) => {
  const dot = e.target.closest(".slide-dot");
  if (!dot) return;
  goToSlide(Number(dot.dataset.index));
  scheduleSlide();
});
document.getElementById("slide-prev").addEventListener("click", () => { goToSlide(slideshow.index - 1); scheduleSlide(); });
document.getElementById("slide-next").addEventListener("click", () => { goToSlide(slideshow.index + 1); scheduleSlide(); });
slideshow.pauseBtn.addEventListener("click", () => setPaused(!slideshow.paused));

// Hold still while someone is looking closely, reading a long quote or using the buttons.
function hold(held) {
  slideshow.held = held;
  scheduleSlide();
}
slideshow.root.addEventListener("mouseenter", () => hold(true));
slideshow.root.addEventListener("mouseleave", () => hold(false));
slideshow.root.addEventListener("focusin", () => hold(true));
slideshow.root.addEventListener("focusout", (e) => {
  if (!slideshow.root.contains(e.relatedTarget) && !lightbox.dialog.open) hold(false);
});
lightbox.dialog.addEventListener("close", () => hold(slideshow.root.matches(":hover, :focus-within")));

// Swipe left or right on phones.
let touchStartX = null;
slideshow.root.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
slideshow.root.addEventListener("touchend", (e) => {
  if (touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(dx) < 40) return;
  goToSlide(slideshow.index + (dx < 0 ? 1 : -1));
  scheduleSlide();
}, { passive: true });

document.getElementById("lightbox-close").addEventListener("click", () => lightbox.dialog.close());
document.getElementById("lightbox-prev").addEventListener("click", () => showPhoto(lightbox.index - 1));
document.getElementById("lightbox-next").addEventListener("click", () => showPhoto(lightbox.index + 1));
lightbox.dialog.addEventListener("click", (e) => {
  // Clicking the dark backdrop (outside the photo) closes the viewer.
  if (e.target === lightbox.dialog) lightbox.dialog.close();
});
lightbox.dialog.addEventListener("keydown", (e) => {
  if (GALLERY.length < 2) return;
  if (e.key === "ArrowLeft") showPhoto(lightbox.index - 1);
  if (e.key === "ArrowRight") showPhoto(lightbox.index + 1);
});

renderGallery();

// ---- Neighbors' stories ----

// Each story shows beside a photo; it moves on by itself after this many seconds.
const STORY_SECONDS = 10;

const stories = {
  root: document.getElementById("stories"),
  slides: [],
  count: document.getElementById("story-count"),
  pauseBtn: document.getElementById("story-pause"),
  index: 0,
  timer: null,
  paused: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  held: false,
};

function renderStories() {
  if (typeof STORIES === "undefined" || !STORIES.length) return;
  // Only photos without recognizable people, so no one looks like the speaker.
  const photos = GALLERY.filter((photo) => !photo.whole && !photo.people);
  stories.root.hidden = false;
  const slidesEl = document.getElementById("story-slides");
  slidesEl.innerHTML = STORIES.map((story, i) => {
    const photo = photos.length ? photos[i % photos.length] : null;
    return `
      <figure class="story" aria-roledescription="slide" aria-label="${i + 1} of ${STORIES.length}">
        ${photo ? `<div class="story-photo"><img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt || "")}" loading="lazy"></div>` : ""}
        <div class="story-text">
          <blockquote><p>${escapeHtml(story.quote)}</p></blockquote>
          <figcaption>${escapeHtml(story.name)}</figcaption>
        </div>
      </figure>`;
  }).join("");
  stories.slides = [...slidesEl.children];
  showStory(0);
  setStoriesPaused(stories.paused);
}

function showStory(index) {
  stories.index = (index + STORIES.length) % STORIES.length;
  stories.slides.forEach((slide, i) => {
    const active = i === stories.index;
    slide.classList.toggle("is-active", active);
    slide.inert = !active;
    slide.setAttribute("aria-hidden", String(!active));
  });
  stories.count.textContent = `${stories.index + 1} of ${STORIES.length}`;
}

function scheduleStory() {
  clearTimeout(stories.timer);
  if (stories.paused || stories.held || STORIES.length < 2) return;
  stories.timer = setTimeout(() => {
    showStory(stories.index + 1);
    scheduleStory();
  }, STORY_SECONDS * 1000);
}

function setStoriesPaused(paused) {
  stories.paused = paused;
  stories.pauseBtn.textContent = paused ? "▶" : "❚❚";
  stories.pauseBtn.setAttribute("aria-label", paused ? "Play stories" : "Pause stories");
  scheduleStory();
}

function holdStories(held) {
  stories.held = held;
  scheduleStory();
}

document.getElementById("story-prev").addEventListener("click", () => { showStory(stories.index - 1); scheduleStory(); });
document.getElementById("story-next").addEventListener("click", () => { showStory(stories.index + 1); scheduleStory(); });
stories.pauseBtn.addEventListener("click", () => setStoriesPaused(!stories.paused));
const storyShow = document.querySelector(".story-show");
storyShow.addEventListener("mouseenter", () => holdStories(true));
storyShow.addEventListener("mouseleave", () => holdStories(false));
storyShow.addEventListener("focusin", () => holdStories(true));
storyShow.addEventListener("focusout", (e) => { if (!storyShow.contains(e.relatedTarget)) holdStories(false); });

let storyTouchX = null;
storyShow.addEventListener("touchstart", (e) => { storyTouchX = e.touches[0].clientX; }, { passive: true });
storyShow.addEventListener("touchend", (e) => {
  if (storyTouchX === null) return;
  const dx = e.changedTouches[0].clientX - storyTouchX;
  storyTouchX = null;
  if (Math.abs(dx) < 40) return;
  showStory(stories.index + (dx < 0 ? 1 : -1));
  scheduleStory();
}, { passive: true });

renderStories();
