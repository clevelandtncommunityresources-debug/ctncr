// Be Prepared tab (prepare.html): the emergency kit checklist. What someone
// checks off is saved in their own browser only.

const KIT = [
  { group: "Water & food", icon: "🥫", items: [
    "Water: 1 gallon per person per day, for 3 days",
    "Canned and dry food that needs no cooking",
    "Manual can opener",
    "Baby formula and food, if needed",
    "Pet food and water",
  ] },
  { group: "Health", icon: "💊", items: [
    "A week of prescription medicines",
    "First aid kit",
    "Glasses, hearing aid batteries, other medical supplies",
    "Masks, hand sanitizer, soap",
    "Diapers and period products",
  ] },
  { group: "Power & light", icon: "🔋", items: [
    "Flashlight for each person",
    "Extra batteries",
    "Battery or hand-crank weather radio",
    "Phone charger and a charged power bank",
  ] },
  { group: "Papers & money", icon: "📄", items: [
    "Copies of IDs, insurance and prescriptions in a waterproof bag",
    "Written list of important phone numbers",
    "Some cash in small bills",
    "Spare keys",
  ] },
  { group: "Warmth & shelter", icon: "🧥", items: [
    "Blankets or sleeping bags",
    "A change of clothes and sturdy shoes",
    "Rain gear",
    "Helmets for a tornado (bike helmets work)",
  ] },
  { group: "Tools", icon: "🧰", items: [
    "Whistle to signal for help",
    "Multi-tool or wrench to turn off utilities",
    "Duct tape and garbage bags",
    "Carbon monoxide detector with batteries",
  ] },
];

const KIT_KEY = "ctncr:kit";
let checked = new Set();
try { checked = new Set(JSON.parse(localStorage.getItem(KIT_KEY) || "[]")); } catch (e) { /* storage blocked */ }

const total = KIT.reduce((n, g) => n + g.items.length, 0);
const groupsEl = document.getElementById("kit-groups");
groupsEl.innerHTML = KIT.map((g, gi) => `
  <fieldset class="kit-group">
    <h3><span aria-hidden="true">${g.icon}</span> ${g.group}</h3>
    <ul>${g.items.map((item, ii) => {
      const id = `k${gi}-${ii}`;
      return `<li><label><input type="checkbox" data-id="${id}"${checked.has(id) ? " checked" : ""}><span>${escapeHtml(item)}</span></label></li>`;
    }).join("")}</ul>
  </fieldset>`).join("");

function updateKit() {
  const n = checked.size;
  document.getElementById("kit-count").textContent = `${n} of ${total}`;
  document.getElementById("kit-meter").style.width = `${(n / total) * 100}%`;
  document.getElementById("kit-message").textContent =
    n === 0 ? "Start with water and medicine." :
    n === total ? "Your kit is ready. Check expiration dates every six months." :
    n / total > 0.66 ? "Almost there!" :
    n / total > 0.33 ? "Good progress. Keep going." : "A good start.";
  try { localStorage.setItem(KIT_KEY, JSON.stringify([...checked])); } catch (e) { /* ignore */ }
}

groupsEl.addEventListener("change", (e) => {
  const box = e.target.closest("input[type=checkbox]");
  if (!box) return;
  box.checked ? checked.add(box.dataset.id) : checked.delete(box.dataset.id);
  updateKit();
});
document.getElementById("kit-reset").addEventListener("click", () => {
  checked.clear();
  groupsEl.querySelectorAll("input").forEach((b) => { b.checked = false; });
  updateKit();
});
document.getElementById("kit-print").addEventListener("click", () => window.print());
updateKit();
