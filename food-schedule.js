// Food calendar data: when free meals and food pantries are open.
// Taken from the Food & Meals listings in resources.js — if hours change,
// update both files.
//
// Fields:
//   id        Short unique name with no spaces (used for links)
//   name      Full name
//   short     Short name shown inside the calendar squares
//   kind      "meal" or "pantry"
//   time      Hours shown on the calendar, e.g. "9–11 am"
//   when      Plain-language schedule shown in the list below the calendar
//   repeat    Which days it shows on the calendar. One of:
//               { weekly: [1, 3] }             days of the week (0 = Sunday … 6 = Saturday)
//               { monthly: { week: 1, day: 6 } }  1st Saturday of the month
//               { monthly: { week: -1, day: 2 } } last Tuesday of the month
//               { dates: ["2026-11-14"] }      specific one-off dates
//             Leave it out if the dates vary; it will be listed under "Call for dates".

const FOOD_KINDS = {
  meal: "Hot meal",
  pantry: "Food pantry",
};

const FOOD_SCHEDULE = [
  {
    id: "daily-bread",
    name: "Cleveland Daily Bread",
    short: "Daily Bread",
    kind: "meal",
    address: "453 Broad St, Cleveland, TN 37311",
    phone: "(423) 715-9193",
    time: "5:30–7 pm",
    when: "Monday–Friday, 5:30–7:00 pm",
    repeat: { weekly: [1, 2, 3, 4, 5] },
  },
  {
    id: "centennial",
    name: "Centennial Church of Christ",
    short: "Centennial",
    kind: "pantry",
    address: "200 25th St NW, Cleveland, TN 37312",
    phone: "(423) 476-8941",
    time: "10 am–12 pm",
    when: "Mondays, 10 am–12 pm (canned goods)",
    repeat: { weekly: [1] },
  },
  {
    id: "valley-view",
    name: "Valley View Storehouse",
    short: "Valley View",
    kind: "pantry",
    address: "4657 Spring Place Rd SE, Cleveland, TN 37323",
    time: "Call for hours",
    when: "Tuesdays (call for hours)",
    repeat: { weekly: [2] },
  },
  {
    id: "big-spring",
    name: "Big Spring Baptist Church — Food Pantry",
    short: "Big Spring",
    kind: "pantry",
    address: "1415 Hardwick St SE, Cleveland, TN 37311",
    phone: "(423) 472-1101",
    time: "9–11 am",
    when: "Last Tuesday of every month, 9–11 am",
    repeat: { monthly: { week: -1, day: 2 } },
  },
  {
    id: "feed-the-people",
    name: "Feed the People",
    short: "Feed the People",
    kind: "pantry",
    address: "910 17th St NW, Cleveland, TN 37311",
    phone: "(423) 476-6281",
    when: "Every other week, Monday–Thursday, 7:30–9:00 am. Call to ask which weeks.",
  },
  {
    id: "eastside",
    name: "Eastside Church of Christ — Mobile Pantry",
    short: "Eastside",
    kind: "pantry",
    address: "252 Wildwood Ave SE, Cleveland, TN 37311",
    when: "Mobile pantry with curbside pickup. Dates vary; call 211 for the next one.",
  },
];
