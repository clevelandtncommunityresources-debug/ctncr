// Resource directory data.
// Sources: UTC MobileMOC Bradley County Community Resource Guide and the
// Feeding America directory (retrieved Oct 2026). Hours and services change —
// verify each listing before relying on it and update `lastVerified` when you do.
//
// To add a resource, copy an entry and edit it. Categories must match a key in
// CATEGORIES below.

const CATEGORIES = {
  food: "Food & Meals",
  housing: "Housing & Basic Needs",
  health: "Health Care",
  mental: "Mental Health & Recovery",
  safety: "Safety & Advocacy",
  transport: "Transportation",
  lgbtq: "LGBTQ+ Support",
};

const RESOURCES = [
  // Food & Meals
  {
    name: "Cleveland Daily Bread",
    category: "food",
    address: "453 Broad St, Cleveland, TN 37311",
    phone: "(423) 715-9193",
    notes: "Hot meals Monday–Friday, 5:30–7:00 pm.",
  },
  {
    name: "Big Spring Baptist Church — Food Pantry",
    category: "food",
    address: "1415 Hardwick St SE, Cleveland, TN 37311",
    phone: "(423) 472-1101",
    notes: "Food pantry the last Tuesday of every month, 9–11 am.",
  },
  {
    name: "Centennial Church of Christ",
    category: "food",
    address: "200 25th St NW, Cleveland, TN 37312",
    phone: "(423) 476-8941",
    notes: "Canned goods Mondays, 10 am–12 pm.",
  },
  {
    name: "Feed the People",
    category: "food",
    address: "910 17th St NW, Cleveland, TN 37311",
    phone: "(423) 476-6281",
    notes: "Food provided every 2 weeks, 7:30–9:00 am, Monday–Thursday.",
  },
  {
    name: "Senior Home-Delivered Meals (Bradley Cleveland Community Services)",
    category: "food",
    address: "130 Wildwood Ave, Cleveland, TN 37311",
    phone: "(423) 479-4111",
    notes: "Home-delivered meals for seniors.",
  },
  {
    name: "Eastside Church of Christ — Mobile Pantry",
    category: "food",
    address: "252 Wildwood Ave SE, Cleveland, TN 37311",
    notes: "Mobile pantry with curbside pickup. Call 211 for current dates.",
  },
  {
    name: "Valley View Storehouse",
    category: "food",
    address: "4657 Spring Place Rd SE, Cleveland, TN 37323",
    notes: "Food pantry with Tuesday hours.",
  },

  // Housing & Basic Needs
  {
    name: "The Caring Place",
    category: "housing",
    address: "130 Wildwood Ave SE, Cleveland, TN 37311",
    phone: "(423) 472-4414",
    notes: "Food, clothing and services for households below the poverty level.",
  },
  {
    name: "Bradley Cleveland Community Services Agency",
    category: "housing",
    address: "165 6th St SE, Cleveland, TN 37311",
    phone: "(423) 479-4111",
    notes: "Emergency shelter and community assistance programs.",
  },
  {
    name: "Big Spring Baptist Church — Clothing Closet",
    category: "housing",
    address: "1415 Hardwick St SE, Cleveland, TN 37311",
    phone: "(423) 472-1101",
    notes: "Clothing and household items every Tuesday, 9–11 am.",
  },

  // Health Care
  {
    name: "Karis Community Health",
    category: "health",
    address: "254 Broad St SW, Cleveland, TN 37311",
    phone: "(423) 457-8024",
    notes: "Affordable health and dental care.",
  },
  {
    name: "UTC MobileMOC",
    category: "health",
    phone: "(423) 425-1657",
    notes: "Free mobile health care and social support, with or without insurance.",
    url: "https://www.utc.edu/college-of-nursing/mobilemoc",
  },
  {
    name: "Cloudland Dental",
    category: "health",
    address: "1065 Peerless Crossing, Cleveland, TN 37312",
    phone: "(423) 559-0157",
    notes: "Accepts adult TennCare and private insurance.",
  },
  {
    name: "CHI Memorial Mobile Lung Clinic",
    category: "health",
    phone: "(423) 495-4438",
    notes: "Lung screening for ages 50–80, current or former smokers.",
  },

  // Mental Health & Recovery
  {
    name: "Ocoee Regional Health Corporation",
    category: "mental",
    address: "1420 Fritz St SE, Cleveland, TN 37311",
    phone: "(423) 338-2831",
    notes: "Substance use counseling, psychiatry and counseling.",
  },
  {
    name: "Mental Health Cooperative",
    category: "mental",
    address: "2544 Dalton Pike SE, Cleveland, TN 37323",
    phone: "(423) 728-6400",
    notes: "Adult behavioral health services.",
  },
  {
    name: "988 Suicide & Crisis Lifeline",
    category: "mental",
    phone: "988",
    notes: "Free, confidential support 24/7 by call or text.",
    url: "https://988lifeline.org",
  },

  // Safety & Advocacy
  {
    name: "Harbor Safe House and Advocacy Center",
    category: "safety",
    phone: "(423) 476-3886",
    notes: "Domestic violence support and sexual assault resources.",
  },
  {
    name: "CASA of Bradley and Polk County",
    category: "safety",
    address: "85 S Ocoee St, Cleveland, TN 37311",
    phone: "(423) 472-5800",
    notes: "Court advocacy for children experiencing abuse and neglect.",
  },
  {
    name: "Adult Protective Services",
    category: "safety",
    address: "950 Star Vue Dr SW, Suite 1, Cleveland, TN 37311",
    phone: "(423) 478-0300",
    notes: "Investigates reports of abuse, neglect or financial exploitation of vulnerable adults.",
  },
  {
    name: "National Domestic Violence Hotline",
    category: "safety",
    phone: "1-800-799-7233",
    notes: "24/7 confidential support. Text START to 88788.",
    url: "https://www.thehotline.org",
  },

  // Transportation
  {
    name: "Cleveland Urban Area Transit System (CUATS)",
    category: "transport",
    address: "165 Edwards St, Cleveland, TN 37311",
    phone: "(423) 478-1396",
    notes: "Public bus service operated by SETHRA.",
  },

  // LGBTQ+ Support
  {
    name: "The Trevor Project",
    category: "lgbtq",
    phone: "1-866-488-7386",
    notes: "24/7 crisis support for LGBTQ+ young people. Text START to 678-678.",
    url: "https://www.thetrevorproject.org",
  },
  {
    name: "Trans Lifeline",
    category: "lgbtq",
    phone: "(877) 565-8860",
    notes: "Peer support hotline run by and for trans people.",
    url: "https://translifeline.org",
  },
];
