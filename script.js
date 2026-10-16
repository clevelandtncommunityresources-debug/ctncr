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

function servesOn(site, date) {
  const rule = site.repeat;
  if (!rule) return false;
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

const cal = {
  grid: document.getElementById("cal-grid"),
  title: document.getElementById("cal-title"),
  sites: document.getElementById("cal-sites"),
  month: new Date(startOfToday().getFullYear(), startOfToday().getMonth(), 1),
};

function renderCalendar() {
  const today = startOfToday();
  const year = cal.month.getFullYear();
  const month = cal.month.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  cal.title.textContent = `${MONTHS[month]} ${year}`;

  const cells = [];
  for (let i = 0; i < cal.month.getDay(); i++) cells.push(`<li class="cal-blank" aria-hidden="true"></li>`);
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const open = FOOD_SCHEDULE.filter((site) => servesOn(site, date));
    const classes = ["cal-day"];
    if (date.getTime() === today.getTime()) classes.push("is-today");
    if (date < today) classes.push("is-past");
    if (!open.length) classes.push("is-empty");
    const items = open.map((site) => `
      <li class="cal-item kind-${site.kind}">
        <a href="#site-${site.id}"><span class="cal-time">${escapeHtml(site.time)}</span> ${escapeHtml(site.short)}</a>
      </li>`).join("");
    cells.push(`
      <li class="${classes.join(" ")}">
        <span class="cal-num" aria-hidden="true">${day}</span>
        <span class="cal-label">${shortDate(date)}${date.getTime() === today.getTime() ? " (today)" : ""}</span>
        ${open.length ? `<ul class="cal-items">${items}</ul>` : `<span class="visually-hidden">Nothing scheduled</span>`}
      </li>`);
  }
  cal.grid.innerHTML = cells.join("");
}

function renderFoodSites() {
  const card = (site) => {
    const links = [];
    if (site.phone) links.push(`<a href="${telHref(site.phone)}">Call ${escapeHtml(site.phone)}</a>`);
    if (site.address) links.push(`<a href="${mapHref(site.address)}" target="_blank" rel="noopener">Directions</a>`);
    return `
      <article class="card" id="site-${site.id}">
        <span class="tag cal-key kind-${site.kind}">${escapeHtml(FOOD_KINDS[site.kind])}</span>
        <h3>${escapeHtml(site.name)}</h3>
        <p>${site.repeat ? "" : "<strong>Call for dates:</strong> "}${escapeHtml(site.when)}</p>
        ${site.address ? `<p class="address">${escapeHtml(site.address)}</p>` : ""}
        <div class="card-links">${links.join("")}</div>
      </article>`;
  };
  // Sites with a regular schedule first, then the ones you have to call about.
  const sorted = [...FOOD_SCHEDULE.filter((s) => s.repeat), ...FOOD_SCHEDULE.filter((s) => !s.repeat)];
  cal.sites.innerHTML = sorted.map(card).join("");
}

function shiftMonth(delta) {
  cal.month = new Date(cal.month.getFullYear(), cal.month.getMonth() + delta, 1);
  renderCalendar();
}
document.getElementById("cal-prev").addEventListener("click", () => shiftMonth(-1));
document.getElementById("cal-next").addEventListener("click", () => shiftMonth(1));
document.getElementById("cal-today").addEventListener("click", () => {
  const today = startOfToday();
  cal.month = new Date(today.getFullYear(), today.getMonth(), 1);
  renderCalendar();
});

renderCalendar();
renderFoodSites();

// ---- Community bulletin board ----

function renderBoard() {
  const board = document.getElementById("board");
  const today = startOfToday();
  const upcoming = EVENTS
    .filter((e) => parseDate(e.endDate || e.date) >= today)
    .sort((a, b) => parseDate(a.date) - parseDate(b.date));

  if (!upcoming.length) {
    board.innerHTML = `<div class="empty"><p><strong>No events posted right now.</strong></p><p>Know about something free coming up? Send it our way and we'll pin it here.</p></div>`;
    return;
  }

  board.innerHTML = upcoming.map((e) => {
    const start = parseDate(e.date);
    let when = shortDate(start);
    if (e.endDate && e.endDate !== e.date) when += ` – ${shortDate(parseDate(e.endDate))}`;
    if (e.time) when += ` · ${e.time}`;
    const where = [e.location, e.address].filter(Boolean).join(", ");
    const links = [];
    if (e.address) links.push(`<a href="${mapHref(e.address)}" target="_blank" rel="noopener">Directions</a>`);
    if (e.url) links.push(`<a href="${escapeHtml(e.url)}" target="_blank" rel="noopener">More info</a>`);
    return `
      <article class="note">
        <div class="note-date" aria-hidden="true">
          <span class="note-month">${MONTHS[start.getMonth()].slice(0, 3)}</span>
          <span class="note-day">${start.getDate()}</span>
        </div>
        <div class="note-body">
          <h3>${escapeHtml(e.title)}</h3>
          <p class="note-when">${escapeHtml(when)}</p>
          ${where ? `<p class="note-where">${escapeHtml(where)}</p>` : ""}
          ${e.host ? `<p class="note-host">Hosted by ${escapeHtml(e.host)}</p>` : ""}
          ${e.description ? `<p>${escapeHtml(e.description)}</p>` : ""}
          ${links.length ? `<div class="card-links">${links.join("")}</div>` : ""}
        </div>
      </article>`;
  }).join("");
}

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

function renderGallery() {
  if (!GALLERY.length) return;
  document.getElementById("photos").hidden = false;
  document.querySelectorAll(".gallery-link").forEach((link) => { link.hidden = false; });
  document.getElementById("gallery").innerHTML = GALLERY.map((photo, i) => `
    <li>
      <button type="button" class="gallery-item${photo.whole ? " gallery-item-whole" : ""}" data-index="${i}" aria-label="View larger: ${escapeHtml(photo.caption || photo.alt || `photo ${i + 1}`)}">
        <img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt || "")}" loading="lazy">
      </button>
    </li>`).join("");
  const multiple = GALLERY.length > 1;
  document.getElementById("lightbox-prev").hidden = !multiple;
  document.getElementById("lightbox-next").hidden = !multiple;
}

document.getElementById("gallery").addEventListener("click", (e) => {
  const item = e.target.closest(".gallery-item");
  if (!item) return;
  showPhoto(Number(item.dataset.index));
  lightbox.dialog.showModal();
});
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
