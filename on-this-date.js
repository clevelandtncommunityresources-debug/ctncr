// "On this date" on the home page. Two parts:
//   1. LOCAL_HISTORY below: dates from the history of Cleveland, Bradley
//      County, Tennessee and the Cherokee Nation, picked by CTNCR. On a day with
//      none, the page shows the next ones coming up.
//   2. World history for today, from Wikipedia's "On this day" feed.
//
// To add a date, copy a line and change it. month is 1-12. Please only add
// things you can point to a source for, and put that source in `link`.

const LOCAL_HISTORY = [
  { month: 2, day: 10, year: 1836, text: "The Tennessee legislature creates Bradley County out of Cherokee land taken by the Treaty of New Echota, naming it for Col. Edward Bradley.", link: "https://en.wikipedia.org/wiki/Bradley_County,_Tennessee" },
  { month: 2, day: 21, year: 1828, text: "The first issue of the Cherokee Phoenix, the first newspaper published by Native Americans, comes off the press at New Echota, printed in English and in Sequoyah’s Cherokee syllabary.", link: "https://en.wikipedia.org/wiki/Cherokee_Phoenix" },
  { month: 2, day: 27, year: 1819, text: "In the Calhoun Treaty, the Cherokee are pressed to give up the land north of the Hiwassee River. The river becomes the border, with present-day Bradley County still Cherokee land to the south.", link: "https://en.wikipedia.org/wiki/Treaty_of_Washington_(1819)" },
  { month: 3, day: 3, year: 1832, text: "In Worcester v. Georgia, the U.S. Supreme Court rules that the Cherokee Nation is a sovereign nation that Georgia’s laws can’t touch. President Jackson ignores the ruling.", link: "https://en.wikipedia.org/wiki/Worcester_v._Georgia" },
  { month: 4, day: 6, year: 1984, text: "At Red Clay, the Cherokee Nation and the Eastern Band of Cherokee Indians meet together in council for the first time since the Trail of Tears. An eternal flame is lit there in memory of those who suffered and died.", link: "https://en.wikipedia.org/wiki/Red_Clay_State_Historic_Park" },
  { month: 5, day: 18, year: 1933, text: "Congress creates the Tennessee Valley Authority, which goes on to dam the region’s rivers. Its Tellico Dam, finished in 1979, flooded the old Overhill Cherokee towns of Chota and Tanasi.", link: "https://en.wikipedia.org/wiki/Tennessee_Valley_Authority" },
  { month: 5, day: 23, year: 1838, text: "The deadline set by the Treaty of New Echota for the Cherokee to leave their homeland passes. U.S. soldiers begin rounding families up into stockades and camps, the largest at Fort Cass in Charleston, just north of Cleveland.", link: "https://en.wikipedia.org/wiki/Trail_of_Tears" },
  { month: 5, day: 28, year: 1830, text: "President Andrew Jackson signs the Indian Removal Act, the law behind the forced removal of the Cherokee, Muscogee, Chickasaw, Choctaw and Seminole nations.", link: "https://en.wikipedia.org/wiki/Indian_Removal_Act" },
  { month: 6, day: 1, year: 1796, text: "Tennessee becomes the 16th state, on land that was home to the Cherokee, Chickasaw, Shawnee, Yuchi and other peoples.", link: "https://en.wikipedia.org/wiki/Tennessee" },
  { month: 6, day: 2, year: 1924, text: "The Indian Citizenship Act makes Native Americans born in the U.S. citizens. Some states still kept them from voting for decades.", link: "https://en.wikipedia.org/wiki/Indian_Citizenship_Act" },
  { month: 7, day: 10, year: 1925, text: "The Scopes “Monkey” Trial opens in Dayton, in neighboring Rhea County.", link: "https://en.wikipedia.org/wiki/Scopes_trial" },
  { month: 7, day: 26, year: 1827, text: "The Cherokee Nation adopts a written constitution at New Echota, setting up a government with three branches.", link: "https://en.wikipedia.org/wiki/Cherokee_Nation_(1794%E2%80%931907)" },
  { month: 8, day: 11, year: 1978, text: "The American Indian Religious Freedom Act becomes law, protecting the right of Native people to practice their traditional religions.", link: "https://en.wikipedia.org/wiki/American_Indian_Religious_Freedom_Act" },
  { month: 8, day: 18, year: 1920, text: "Tennessee becomes the 36th state to ratify the 19th Amendment, giving it the votes it needed to guarantee women the right to vote.", link: "https://en.wikipedia.org/wiki/Nineteenth_Amendment_to_the_United_States_Constitution" },
  { month: 10, day: 3, year: 1790, text: "John Ross is born. As Principal Chief from 1828 to 1866, he led the Cherokee Nation from its last eastern capital at Red Clay, and through removal.", link: "https://en.wikipedia.org/wiki/John_Ross_(Cherokee_chief)" },
  { month: 12, day: 5, year: 1985, text: "Wilma Mankiller becomes Principal Chief of the Cherokee Nation, the first woman to lead it.", link: "https://en.wikipedia.org/wiki/Wilma_Mankiller" },
  { month: 12, day: 29, year: 1835, text: "A small group of Cherokee with no authority from their nation signs the Treaty of New Echota, giving up all Cherokee land east of the Mississippi. More than 15,000 Cherokee petition against it.", link: "https://en.wikipedia.org/wiki/Treaty_of_New_Echota" },
];

(function onThisDate() {
  const section = document.getElementById("on-this-date");
  if (!section) return;
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const today = new Date();
  const m = today.getMonth() + 1, d = today.getDate();
  document.getElementById("otd-date").textContent = `${MONTHS[m - 1]} ${d}`;
  document.getElementById("otd-day").textContent = d;
  document.getElementById("otd-month").textContent = MONTHS[m - 1].slice(0, 3);

  // ---- Local history ----
  const dayOfYear = (mm, dd) => (Date.UTC(2024, mm - 1, dd) - Date.UTC(2024, 0, 1)) / 86400000;
  const now = dayOfYear(m, d);
  const exact = LOCAL_HISTORY.filter((e) => e.month === m && e.day === d);
  const ahead = (e) => (dayOfYear(e.month, e.day) - now + 366) % 366;
  const list = exact.length ? exact : [...LOCAL_HISTORY].sort((a, b) => ahead(a) - ahead(b)).slice(0, 2);
  document.getElementById("otd-local-head").textContent = exact.length ? "Here at home, on this date" : "Coming up in local history";
  document.getElementById("otd-local").innerHTML = list.map((e) => `
    <li>
      <a href="${escapeHtml(e.link)}">
        <span class="otd-when">${exact.length ? "" : `${MONTHS[e.month - 1]} ${e.day}, `}${e.year}<small>${today.getFullYear() - e.year} years ago</small></span>
        <span class="otd-text">${escapeHtml(e.text)}</span>
      </a>
    </li>`).join("");

  // ---- World history (Wikipedia) ----
  const mm = String(m).padStart(2, "0"), dd = String(d).padStart(2, "0");
  const world = document.getElementById("otd-world");
  fetch(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/selected/${mm}/${dd}`)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((data) => {
      const events = (data.selected || []).sort((a, b) => b.year - a.year);
      if (!events.length) throw new Error("empty");
      // A spread across the centuries: newest, oldest and some in between.
      const pick = events.length <= 6 ? events
        : [0, 1, 2, 3, 4, 5].map((i) => events[Math.round((i * (events.length - 1)) / 5)]);
      world.innerHTML = pick.map((e) => {
        const page = (e.pages || [])[0];
        const url = page?.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${MONTHS[m - 1]}_${d}`;
        const thumb = page?.thumbnail?.source;
        return `<li>
          <a href="${escapeHtml(url)}">
            ${thumb ? `<img src="${escapeHtml(thumb)}" alt="" loading="lazy" onerror="this.remove()">` : `<span class="otd-noimg" aria-hidden="true">📜</span>`}
            <span><span class="otd-year">${e.year}</span>${escapeHtml(e.text)}</span>
          </a>
        </li>`;
      }).join("");
    })
    .catch(() => {
      world.innerHTML = `<li class="otd-fallback"><a href="https://en.wikipedia.org/wiki/${MONTHS[m - 1]}_${d}">See what happened on ${MONTHS[m - 1]} ${d} on Wikipedia →</a></li>`;
    });
  document.getElementById("otd-more").href = `https://en.wikipedia.org/wiki/${MONTHS[m - 1]}_${d}`;
})();
