// World News tab (world-news.html). The headlines are in world-news.js,
// rewritten every hour by scripts/update_world_news.py.

function ago(iso) {
  if (!iso) return "";
  const mins = Math.round((Date.now() - new Date(iso)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

if (typeof WORLD_NEWS !== "undefined" && WORLD_NEWS.length) {
  document.getElementById("world-updated").textContent = `Updated ${ago(WORLD_NEWS_UPDATED)} · refreshed every hour`;

  const aj = WORLD_NEWS.find((s) => s.id === "aljazeera");
  if (aj) {
    document.getElementById("aj-block").hidden = false;
    document.getElementById("aj-grid").innerHTML = aj.stories.slice(0, 7).map((s) => `
      <a href="${escapeHtml(s.url)}">
        <span class="w-time">${ago(s.time)}</span>
        <strong>${escapeHtml(s.title)}</strong>
        ${s.summary && s.summary !== s.title ? `<span class="w-sum">${escapeHtml(s.summary)}</span>` : ""}
      </a>`).join("");
  }

  const others = WORLD_NEWS.filter((s) => s.id !== "aljazeera");
  document.getElementById("src-grid").innerHTML = others.map((src) => `
    <article class="src-col src-${escapeHtml(src.id)}" data-src="${escapeHtml(src.id)}">
      <div class="src-head"><h3>${escapeHtml(src.name)}</h3><span class="src-country">${escapeHtml(src.country)}</span></div>
      <ul class="src-list">${src.stories.map((s) => `
        <li><a href="${escapeHtml(s.url)}">
          <span><strong>${escapeHtml(s.title)}</strong><span class="w-time">${ago(s.time)}</span></span>
          ${s.image ? `<img src="${escapeHtml(s.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ""}
        </a></li>`).join("")}
      </ul>
      <a class="src-more" href="${escapeHtml(src.home)}">More from ${escapeHtml(src.name)} →</a>
    </article>`).join("");

  // Outlet filter
  const filter = document.getElementById("src-filter");
  filter.innerHTML = `<button type="button" aria-pressed="true" data-src="">All outlets</button>` +
    others.map((s) => `<button type="button" aria-pressed="false" data-src="${escapeHtml(s.id)}">${escapeHtml(s.name)}</button>`).join("");
  filter.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    filter.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    document.querySelectorAll(".src-col").forEach((col) => {
      col.hidden = btn.dataset.src !== "" && col.dataset.src !== btn.dataset.src;
    });
  });
}
