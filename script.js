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
