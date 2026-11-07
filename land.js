// Our Land tab (land.html): the four sub-tabs, and the partner organizations.
//
// To add a partner, copy an entry in PARTNERS. `kinds` can include "mutual",
// "food", "indigenous" and "directory". Every contact field is optional.

const PARTNERS = [
  // ---- Mutual aid & food, Chattanooga ----
  { name: "Chattanooga Community Fridge", where: "Chattanooga", kinds: ["mutual", "food"],
    about: "Free community fridges stocked by neighbors, no questions asked. Send them a photo of the fridge so volunteers know when to restock or clean it.",
    address: "1918 Union Ave, Chattanooga", instagram: "chattanoogacommunityfridge" },
  { name: "Hope Community Fridge", where: "Chattanooga (several locations)", kinds: ["mutual", "food"],
    about: "Donation-based community fridges and a garden, open to anyone who needs food.",
    address: "Hope Community Fridge & Garden, 309 Osborne Dr, Chattanooga", web: "https://linktr.ee/hopecommunityfridge", webLabel: "linktr.ee/hopecommunityfridge" },
  { name: "Chattanooga Free Store", where: "Avondale, Chattanooga", kinds: ["mutual"],
    about: "A volunteer-run mutual aid collective giving away clothing, food, sexual health and harm reduction supplies and more. Everything is free.",
    address: "1701 Dodson Ave, Suite A, Chattanooga", web: "https://chattfreestore.org/", webLabel: "chattfreestore.org" },
  { name: "Chattanooga Pride Food Coalition", where: "Chattanooga", kinds: ["mutual", "food"],
    about: "LGBTQ+ and allied groups working together on free fridges, meal prep and mutual aid, including the Chattanooga Queer Empowerment Collective, Trans Liberation Collective and Mutual Aid Resource Library.",
    web: "https://www.chattanoogapride.com/foodcoalition", webLabel: "chattanoogapride.com", instagram: "chattpride" },
  { name: "South East Tennessee Mutual Aid Network", where: "Southeast Tennessee", kinds: ["mutual"],
    about: "A network connecting mutual aid efforts across the region, raising and sharing funds in the open.",
    web: "https://opencollective.com/southeasttnmutualaidnetwork", webLabel: "Open Collective" },
  { name: "Chattanooga Area Food Bank", where: "Chattanooga", kinds: ["food"],
    about: "The regional food bank working to end hunger, supplying food pantries across the area.",
    web: "https://linktr.ee/chattfoodbank", webLabel: "linktr.ee/chattfoodbank" },

  // ---- Mutual aid & food, Knoxville and East Tennessee ----
  { name: "Knox Needs", where: "South Knoxville", kinds: ["mutual", "food"],
    about: "Serves free food daily and hands out basic care and harm reduction supplies at community events.",
    web: "https://knoxneeds.com/", webLabel: "knoxneeds.com" },
  { name: "Knox Pride", where: "Knoxville", kinds: ["food"],
    about: "An LGBTQ+ community center with a free food pantry, a free “thriftique,” support groups and events.",
    address: "Knox Pride Center, 4044A Chapman Hwy, Knoxville, TN 37920", web: "https://linktr.ee/knoxpridecenter", webLabel: "linktr.ee/knoxpridecenter" },
  { name: "Rooted East Knox", where: "East Knoxville", kinds: ["mutual", "food"],
    about: "A Black- and community-led collective working on food access, gardening and wellness.",
    web: "https://linktr.ee/rootedeastknox", webLabel: "linktr.ee/rootedeastknox" },
  { name: "First Aid Collective Knoxville (FACK)", where: "Knoxville", kinds: ["mutual"],
    about: "An autonomous collective doing first aid, wound care and mutual aid on the street.",
    instagram: "firstaidcollectiveknox" },
  { name: "Helping Mamas Knoxville", where: "Knoxville, serving 32 East TN counties", kinds: ["mutual"],
    about: "Gets diapers, baby gear and period products to families who need them.",
    web: "https://linktr.ee/helpingmamasknox", webLabel: "linktr.ee/helpingmamasknox" },
  { name: "Tri-Cities Mutual Aid & Solidarity Network", where: "Northeast TN & Southwest VA", kinds: ["mutual"],
    about: "Neighbors sharing resources across the Tri-Cities and the region around it.",
    web: "https://linktr.ee/tricitiesmutualaid", webLabel: "linktr.ee/tricitiesmutualaid" },

  // ---- Indigenous nations & organizations ----
  { name: "Cherokee Nation", where: "Tahlequah, Oklahoma", kinds: ["indigenous"],
    about: "The largest of the three Cherokee tribes, rebuilt in Indian Territory after removal. Runs programs in language, culture, health and history.",
    address: "17675 S Muskogee Ave, Tahlequah, OK 74464", phone: "918-453-5000", web: "https://www.cherokee.org/", webLabel: "cherokee.org" },
  { name: "Eastern Band of Cherokee Indians", where: "Cherokee, North Carolina", kinds: ["indigenous"],
    about: "Descendants of the Cherokee who stayed in the mountains and avoided removal, on the Qualla Boundary. They own and run the Sequoyah Birthplace Museum in Vonore.",
    address: "88 Council House Loop, Cherokee, NC 28719", phone: "828-497-7000", web: "https://www.ebci.gov/", webLabel: "ebci.gov" },
  { name: "United Keetoowah Band of Cherokee Indians", where: "Tahlequah, Oklahoma", kinds: ["indigenous"],
    about: "A federally recognized Cherokee tribe. Many members descend from the “Old Settlers,” Cherokee who moved west before removal.",
    address: "18300 W Keetoowah Circle, Tahlequah, OK 74464", phone: "918-871-2800", web: "https://www.ukb-nsn.gov/", webLabel: "ukb-nsn.gov" },
  { name: "Native American Indian Association of Tennessee", where: "Nashville", kinds: ["indigenous"],
    about: "A service agency for Native people living in Tennessee, with job training and other programs. Hosts the yearly Tennessee Indian Educational Pow Wow.",
    address: "230 Spence Ln, Nashville, TN 37210", phone: "615-232-9179", web: "https://naiatn.org/", webLabel: "naiatn.org" },
  { name: "Trail of Tears Association", where: "National, with a Tennessee chapter", kinds: ["indigenous"],
    about: "Works with the National Park Service and the Cherokee tribes to protect and mark the Trail of Tears and tell its history.",
    web: "https://www.nationaltota.org/", webLabel: "nationaltota.org" },

  // ---- Directories (online databases) ----
  { name: "CBFP.news Community Resources", where: "Bradley County", kinds: ["directory", "food"],
    about: "200+ local listings for food, shelter, utilities, health care, legal aid, veterans, seniors and LGBTQIA+ support.",
    web: "https://cbfp.news/resources/?utm_source=ctncr.org&utm_medium=referral&utm_campaign=our-land", webLabel: "cbfp.news/resources" },
  { name: "Mutual Aid Hub", where: "Nationwide map", kinds: ["directory", "mutual"],
    about: "A searchable map of mutual aid networks across the country.",
    web: "https://www.mutualaidhub.org/", webLabel: "mutualaidhub.org" },
  { name: "ACORN Directory: East Tennessee", where: "East Tennessee", kinds: ["directory", "mutual"],
    about: "A community-kept list of East Tennessee mutual aid, food sharing, free stores and ecology groups.",
    web: "https://acorn-dir.neocities.org/resources/tennessee/east-tn", webLabel: "acorn-dir.neocities.org" },
  { name: "Freedge", where: "Worldwide map", kinds: ["directory", "food"],
    about: "A map of community fridges, and a guide to starting one.",
    web: "https://freedge.org/", webLabel: "freedge.org" },
  { name: "Little Free Pantry map", where: "Nationwide map", kinds: ["directory", "food"],
    about: "Find little free pantries near you, or register your own.",
    web: "https://mapping.littlefreepantry.org/", webLabel: "littlefreepantry.org" },
  { name: "findhelp.org", where: "Nationwide", kinds: ["directory"],
    about: "Search free and reduced-cost services by ZIP code: food, housing, health, jobs and more.",
    web: "https://www.findhelp.org/", webLabel: "findhelp.org" },
  { name: "Native Land Digital", where: "Worldwide map", kinds: ["directory", "indigenous"],
    about: "Look up whose Indigenous homelands any address sits on, with links to each nation.",
    web: "https://native-land.ca/", webLabel: "native-land.ca" },
];

const KIND_LABELS = { mutual: "Mutual aid", food: "Food", indigenous: "Indigenous", directory: "Directory" };

function orgCard(o) {
  const rows = [];
  if (o.address) rows.push(["Address", escapeHtml(o.address)]);
  if (o.phone) rows.push(["Phone", `<a href="tel:${o.phone.replace(/\D/g, "")}">${escapeHtml(o.phone)}</a>`]);
  if (o.email) rows.push(["Email", `<a href="mailto:${escapeHtml(o.email)}">${escapeHtml(o.email)}</a>`]);
  if (o.web) rows.push(["Online", `<a href="${escapeHtml(o.web)}">${escapeHtml(o.webLabel || o.web)}</a>`]);
  if (o.instagram) rows.push(["Instagram", `<a href="https://www.instagram.com/${escapeHtml(o.instagram)}/">@${escapeHtml(o.instagram)}</a>`]);
  return `<article class="org" data-kinds="${o.kinds.join(" ")}">
    <div class="org-tags">${o.kinds.map((k) => `<span class="tag">${KIND_LABELS[k]}</span>`).join("")}</div>
    <h3>${escapeHtml(o.name)}</h3>
    <p class="org-where">📍 ${escapeHtml(o.where)}</p>
    <p>${escapeHtml(o.about)}</p>
    <dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
  </article>`;
}

document.getElementById("org-grid").innerHTML = PARTNERS.map(orgCard).join("");

const orgFilter = document.getElementById("org-filter");
orgFilter.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  orgFilter.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  document.querySelectorAll(".org").forEach((card) => {
    card.hidden = btn.dataset.kind !== "" && !card.dataset.kinds.split(" ").includes(btn.dataset.kind);
  });
});

// ---- Sub-tabs. The address bar remembers the tab (land.html#partners). ----
const landTabs = [...document.querySelectorAll('[role="tab"]')];
function showPanel(id, focus) {
  if (!document.getElementById(id)) id = "cherokee";
  landTabs.forEach((t) => {
    const on = t.getAttribute("aria-controls") === id;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    if (on && focus) t.focus();
  });
}
landTabs.forEach((t, i) => {
  t.addEventListener("click", () => {
    const id = t.getAttribute("aria-controls");
    history.replaceState(null, "", "#" + id);
    showPanel(id);
  });
  t.addEventListener("keydown", (e) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    const next = landTabs[(i + step + landTabs.length) % landTabs.length];
    history.replaceState(null, "", "#" + next.getAttribute("aria-controls"));
    showPanel(next.getAttribute("aria-controls"), true);
  });
});
showPanel(location.hash.slice(1));
window.addEventListener("hashchange", () => showPanel(location.hash.slice(1)));
