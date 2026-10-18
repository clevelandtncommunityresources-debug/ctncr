"""Gather free events around Cleveland and Bradley County and write them to
auto-events.js for the bulletin board.

Sources:
  - Cleveland Bradley County Public Library's public Google Calendar
  - Visit Cleveland TN's event calendar (only events the listing says are free)
  - City of Cleveland's calendar (public meetings)

Run by .github/workflows/update-events.yml every morning. To run it by hand:
    pip install icalendar recurring_ical_events
    python scripts/update_events.py
"""

import datetime as dt
import html
import json
import re
import urllib.request
from pathlib import Path
from zoneinfo import ZoneInfo

import icalendar
import recurring_ical_events

DAYS_AHEAD = 60
TZ = ZoneInfo("America/New_York")
OUT = Path(__file__).resolve().parent.parent / "auto-events.js"

LIBRARY_FEED = ("https://calendar.google.com/calendar/ical/"
                "clevelandlibrary.org_9jeunnqgeirq8mlh7bbf0vds7g%40group.calendar.google.com/public/basic.ics")
LIBRARY_PAGE = ("https://calendar.google.com/calendar/embed?"
                "src=clevelandlibrary.org_9jeunnqgeirq8mlh7bbf0vds7g%40group.calendar.google.com&ctz=America%2FNew_York")
LIBRARY_ADDRESS = "795 Church St NE, Cleveland, TN 37311"
HISTORY_ADDRESS = "833 N Ocoee St, Cleveland, TN 37311"
VISIT_API = "https://visitclevelandtn.com/wp-json/tribe/events/v1/events"
CITY_FEED = "https://www.clevelandtn.gov/common/modules/iCalendar/iCalendar.aspx?catID=14&feed=calendar"

# Library event titles start with a code for who the program is for, e.g. "AD - Yoga".
AUDIENCES = {
    "AD": "Adults",
    "AA": "All ages",
    "CH": "Kids",
    "TZ": "Teens",
    "TW": "Tweens",
    "BKM": "Bookmobile",
}

# Library room bookings by outside groups, not programs open to everyone.
LIBRARY_SKIP = {"Meeting (Patron led)", "Democrats", "Republicans"}

# Visit Cleveland TN lists paid events too and rarely fills in a price, so an
# event is only kept when its listing says it's free (see is_free). These lists
# correct the guesses: titles are matched by their start.
VISIT_ALWAYS_FREE = ("Farmer’s on First", "Farmer's on First")  # free to walk around
VISIT_NEVER = ("Kids Eat Free",)  # free kid's meal with a paid entree

FREE_WORDS = re.compile(
    r"\bfree (event|admission|entry|activities|to (enter|attend|the public|spectators|all))\b"
    r"|\badmission:? (is )?free\b|\b(a|this) free\b|\bis free\b|\bfree,? family",
    re.I)
PRICE_WORDS = re.compile(r"\$\s?\d+[^.]{0,40}(ticket|admission|cover|per person|registration|entry)"
                         r"|(ticket|admission|cover|registration)[^.]{0,40}\$\s?\d+", re.I)


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (ctncr.org events)"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def clean_text(value):
    text = html.unescape(re.sub(r"<[^>]+>", " ", str(value or "")))
    return re.sub(r"\s+", " ", text).strip()


def shorten(text, limit=220):
    # Drop the keyword lists some listings end with ("Halloween events Cleveland TN | ...").
    if " | " in text:
        head = text.split(" | ")[0]
        end = max(head.rfind(". "), head.rfind("! "), head.rfind("? "))
        text = head[:end + 1] if end > 0 else head
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(" ", 1)[0].rstrip(",.;:") + "…"


def clock(t):
    hour = t.hour % 12 or 12
    return f"{hour}" if t.minute == 0 else f"{hour}:{t.minute:02d}"


def time_range(start, end):
    def half(t):
        return "am" if t.hour < 12 else "pm"
    if not end or end == start:
        return f"{clock(start)} {half(start)}"
    if half(start) == half(end):
        return f"{clock(start)}–{clock(end)} {half(end)}"
    return f"{clock(start)} {half(start)}–{clock(end)} {half(end)}"


def timed(event, start, end):
    """Fill in date, start and time from two datetimes (end may be None)."""
    event["date"] = start.date().isoformat()
    event["start"] = start.strftime("%H:%M")
    same_day_end = end.time() if end and end.date() == start.date() else None
    event["time"] = time_range(start.time(), same_day_end)


def words(title):
    stop = {"the", "a", "an", "and", "of", "at", "in", "for", "with", "to", "&"}
    return {w.rstrip("s") for w in re.findall(r"[a-z']+", title.lower()) if w not in stop}


# ---- Library ----

def split_title(summary):
    # "AD - Yoga", "CH & TW - Build Day", "CH&TW-STEAM Club"
    match = re.match(r"^\s*([A-Z]{2,3}(?:\s*&\s*[A-Z]{2,3})*)\s*-\s*(.+)$", summary)
    if match:
        codes = [c.strip() for c in match.group(1).split("&")]
        if all(c in AUDIENCES for c in codes):
            return " & ".join(AUDIENCES[c] for c in codes), match.group(2).strip()
    return None, summary.strip()


def library_place(location):
    location = clean_text(location)
    if re.search(r"\d+ .+, TN \d{5}", location):
        # A full street address, e.g. a bookmobile stop.
        name, _, rest = location.partition(", ")
        if name[:1].isdigit():
            return None, location.replace(", USA", "")
        return name, rest.replace(", USA", "")
    if "History Branch" in location:
        return "History Branch", HISTORY_ADDRESS
    room = location.strip(" ,")
    return (f"Main Library, {room}" if room else "Main Library"), LIBRARY_ADDRESS


def library_events(first, last):
    calendar = icalendar.Calendar.from_ical(fetch(LIBRARY_FEED))
    events = []
    for item in recurring_ical_events.of(calendar).between(first, last):
        if str(item.get("STATUS", "")).upper() == "CANCELLED":
            continue
        audience, title = split_title(clean_text(item.get("SUMMARY")))
        if not title or title in LIBRARY_SKIP:
            continue
        event = {"title": title, "source": "library"}
        start = item["DTSTART"].dt
        end = item["DTEND"].dt if item.get("DTEND") else None
        if isinstance(start, dt.datetime):
            timed(event, start.astimezone(TZ), end.astimezone(TZ) if isinstance(end, dt.datetime) else None)
        else:
            event["date"] = start.isoformat()
            last_day = end - dt.timedelta(days=1) if isinstance(end, dt.date) else start
            if last_day > start:
                event["endDate"] = last_day.isoformat()
        location, address = library_place(item.get("LOCATION"))
        if location:
            event["location"] = location
        event["address"] = address
        if audience:
            event["audience"] = audience
        description = clean_text(item.get("DESCRIPTION")).split("Join with Google Meet")[0].strip()
        if description:
            event["description"] = shorten(description)
        event["url"] = LIBRARY_PAGE
        events.append(event)
    return events


# ---- Visit Cleveland TN ----

def is_free(title, cost, description):
    if title.startswith(VISIT_NEVER):
        return False
    if title.startswith(VISIT_ALWAYS_FREE) or "free" in cost.lower():
        return True
    text = f"{title}. {description}"
    if PRICE_WORDS.search(text) or "$" in cost:
        return False
    return bool(FREE_WORDS.search(text) or re.search(r"trick[- ]or[- ]treat", text, re.I))


def visit_events(first, last):
    events, page = [], 1
    while True:
        query = f"?start_date={first}&end_date={last}&per_page=50&page={page}"
        data = json.loads(fetch(VISIT_API + query))
        for item in data.get("events", []):
            title = clean_text(item.get("title"))
            venue = item.get("venue") if isinstance(item.get("venue"), dict) else {}
            venue_name = clean_text(venue.get("venue"))
            if "Library" in venue_name:
                continue  # already in the library's own calendar
            description = clean_text(item.get("description"))
            if not is_free(title, clean_text(item.get("cost")), description):
                continue
            event = {"title": title, "source": "visit"}
            start = dt.datetime.fromisoformat(item["start_date"])
            end = dt.datetime.fromisoformat(item["end_date"])
            if item.get("all_day"):
                event["date"] = start.date().isoformat()
                if end.date() > start.date():
                    event["endDate"] = end.date().isoformat()
            else:
                timed(event, start, end)
            if venue_name:
                event["location"] = venue_name
            street = ", ".join(clean_text(venue.get(k)) for k in ("address", "city") if venue.get(k))
            if street:
                event["address"] = f"{street}, TN"
            if description:
                event["description"] = shorten(description)
            event["url"] = item.get("url")
            events.append(event)
        if page >= int(data.get("total_pages") or 1):
            return events
        page += 1


# ---- City of Cleveland ----

def city_events(first, last):
    calendar = icalendar.Calendar.from_ical(fetch(CITY_FEED))
    events = []
    for item in recurring_ical_events.of(calendar).between(first, last):
        start = item["DTSTART"].dt
        if not isinstance(start, dt.datetime):
            continue
        end = item["DTEND"].dt if item.get("DTEND") else None
        event = {"title": clean_text(item.get("SUMMARY")), "source": "city", "audience": "Public meeting"}
        timed(event, start.astimezone(TZ), end.astimezone(TZ) if isinstance(end, dt.datetime) else None)
        location = clean_text(item.get("LOCATION")).strip(" -")
        name, _, street = location.partition(" - ")
        if street:
            event["location"] = name
            location = street
        address = re.sub(r"\s+", " ", location).replace(" Cleveland TN", ", Cleveland, TN").strip(" ,")
        if re.match(r"\d", address):
            event["address"] = address
        event["description"] = "Open to the public."
        url = re.search(r"https?://\S+", str(item.get("DESCRIPTION", "")))
        event["url"] = url.group(0) if url else "https://www.clevelandtn.gov/calendar.aspx"
        events.append(event)
    return events


def main():
    today = dt.datetime.now(TZ).date()
    last = today + dt.timedelta(days=DAYS_AHEAD)
    library = library_events(today, last)
    visit = visit_events(today, last)
    city = city_events(today, last)

    # Visit Cleveland TN repeats some library programs under other venue names.
    library_titles = {}
    for e in library:
        library_titles.setdefault(e["date"], []).append(words(e["title"]))
    def is_repeat(e):
        mine = words(e["title"])
        return any(len(mine & other) / len(mine | other) >= 0.5 for other in library_titles.get(e["date"], []))
    visit = [e for e in visit if not is_repeat(e)]

    events, seen = [], set()
    for e in library + visit + city:
        key = (e["date"], e.get("start"), e["title"].lower())
        if key not in seen:
            seen.add(key)
            events.append(e)
    events.sort(key=lambda e: (e["date"], e.get("start", ""), e["title"]))

    body = ",\n".join("  " + json.dumps(e, ensure_ascii=False) for e in events)
    OUT.write_text(
        "// Free events gathered from the Cleveland Bradley County Public Library,\n"
        "// Visit Cleveland TN and the City of Cleveland. This file is rewritten every\n"
        "// morning by scripts/update_events.py, so don't edit it by hand: add events\n"
        "// to events.js instead.\n"
        f"// Last updated {dt.datetime.now(TZ):%Y-%m-%d %H:%M} Eastern.\n\n"
        f"const AUTO_EVENTS = [\n{body}\n];\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(events)} events to {OUT.name}: {len(library)} library, {len(visit)} Visit Cleveland, {len(city)} city")


if __name__ == "__main__":
    main()
