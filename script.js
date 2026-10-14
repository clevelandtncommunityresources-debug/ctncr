// Set this to the organization's public email to show a contact link.
const CONTACT_EMAIL = "";

const state = { query: "", category: "all" };

const els = {
  search: document.getElementById("search"),
  chips: document.getElementById("chips"),
  cards: document.getElementById("cards"),
  count: document.getElementById("result-count"),
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
  if (state.category !== "all" && resource.category !== state.category) return false;
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
  const results = RESOURCES.filter(matches);
  els.cards.innerHTML = results.length
    ? results.map(renderCard).join("")
    : `<div class="empty"><p>No matches. Try a different word, or dial <a href="tel:211">211</a> to talk with someone who can help.</p></div>`;
  els.count.textContent = `Showing ${results.length} of ${RESOURCES.length} resources`;
  els.chips.querySelectorAll(".chip").forEach((chip) => {
    chip.setAttribute("aria-pressed", String(chip.dataset.category === state.category));
  });
}

els.search.addEventListener("input", (e) => {
  state.query = e.target.value.trim().toLowerCase();
  render();
});

els.chips.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  state.category = chip.dataset.category;
  render();
});

document.querySelectorAll("[data-jump]").forEach((link) => {
  link.addEventListener("click", () => {
    state.category = link.dataset.jump;
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

if (CONTACT_EMAIL) {
  const link = document.getElementById("contact-email");
  link.href = "mailto:" + CONTACT_EMAIL;
  link.textContent = CONTACT_EMAIL;
  document.getElementById("contact-line").hidden = false;
}

document.getElementById("year").textContent = new Date().getFullYear();

renderChips();
render();
