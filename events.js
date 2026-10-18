// Community bulletin board: free local events.
//
// To post an event, copy the example below, remove the "//" at the start of
// each line, and fill it in. Events disappear from the board on their own
// once their date has passed, so old entries can be deleted whenever.
//
// Fields:
//   title        (required) Name of the event
//   date         (required) "YYYY-MM-DD", e.g. "2026-11-07"
//   endDate      (optional) Last day of a multi-day event, "YYYY-MM-DD"
//   time         (optional) Free text, e.g. "10 am–2 pm"
//   location     (optional) Place name, e.g. "Greenway Pavilion"
//   address      (optional) Street address; adds a Directions link
//   host         (optional) Who is putting it on
//   description  (optional) A sentence or two
//   url          (optional) Link for more info or sign-up
//
// Only post events that are free to attend. Library programs, free events on
// Visit Cleveland TN and city public meetings are pulled in automatically (see
// auto-events.js), so they don't need to be added here.

const EVENTS = [
  {
    title: "Fall Festival 2026",
    date: "2026-10-18",
    location: "New Friendship Baptist Church",
    address: "1344 Chatata Valley Rd NE, Cleveland, TN 37323",
    host: "New Friendship Baptist Church",
    description: "Games, inflatables, candy and food, and everything is free. Bring your family and friends! See the Facebook event for times.",
    url: "https://www.facebook.com/events/28138818329154520/",
  },
  // {
  //   title: "Community Potluck",
  //   date: "2026-11-07",
  //   time: "12–2 pm",
  //   location: "Greenway Pavilion",
  //   address: "Cleveland, TN",
  //   host: "CTNCR",
  //   description: "Bring a dish if you can, come hungry either way.",
  //   url: "https://example.com",
  // },
];
