// Local News tab (local-news.html): the newest CBFP.news stories, from
// cbfp-news.js (refreshed every morning). Every link to CBFP.news is tagged
// so the Free Press can see the readers CTNCR sends them.

function cbfpLink(url, campaign) {
  const u = new URL(url);
  u.searchParams.set("utm_source", "ctncr.org");
  u.searchParams.set("utm_medium", "referral");
  u.searchParams.set("utm_campaign", "local-news-" + campaign);
  return u.toString();
}

const NEWS_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function newsDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return `${NEWS_MONTHS[m - 1]} ${d}, ${y}`;
}

document.getElementById("cbfp-date").textContent = new Date().toLocaleDateString("en-US", {
  weekday: "long", month: "long", day: "numeric", year: "numeric",
});

if (typeof CBFP_NEWS !== "undefined" && CBFP_NEWS.length) {
  const [lead, ...rest] = CBFP_NEWS;
  const leadEl = document.getElementById("lead-story");
  leadEl.href = lead.url;
  leadEl.querySelector("h2").textContent = lead.title;
  leadEl.querySelector("p").textContent = lead.summary || "";
  leadEl.querySelector(".lead-kicker").textContent = `Top story · ${newsDate(lead.date)}`;
  // Pull the first sentence of the summary as the big quote.
  // (Split only after a real word, so "U.S." doesn't end the sentence.)
  const first = (lead.summary || "").split(/(?<=[a-z]{2}[.?!])\s/)[0];
  if (first) leadEl.querySelector(".quote").textContent = first;

  document.getElementById("story-grid").innerHTML = rest.map((a, i) => `
    <a class="story-card" data-cbfp="grid" href="${escapeHtml(a.url)}">
      <span class="sc-num" aria-hidden="true">${String(i + 2).padStart(2, "0")}</span>
      <span class="sc-date">${newsDate(a.date)}</span>
      <strong>${escapeHtml(a.title)}</strong>
      ${a.summary ? `<span class="sc-sum">${escapeHtml(a.summary)}</span>` : ""}
      <span class="sc-cta">Read at CBFP.news →</span>
    </a>`).join("");
}

document.querySelectorAll("a[data-cbfp]").forEach((a) => {
  a.href = cbfpLink(a.href, a.dataset.cbfp);
});
