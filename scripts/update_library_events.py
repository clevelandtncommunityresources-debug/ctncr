"""Pull upcoming events from the Cleveland Bradley County Public Library's
public Google Calendar and write them to library-events.js for the bulletin board.

Run by .github/workflows/library-events.yml every morning. To run it by hand:
    pip install icalendar recurring_ical_events
    python scripts/update_library_events.py
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

FEED = ("https://calendar.google.com/calendar/ical/"
        "clevelandlibrary.org_9jeunnqgeirq8mlh7bbf0vds7g%40group.calendar.google.com/public/basic.ics")
CALENDAR_PAGE = ("https://calendar.google.com/calendar/embed?"
                 "src=clevelandlibrary.org_9jeunnqgeirq8mlh7bbf0vds7g%40group.calendar.google.com&ctz=America%2FNew_York")
DAYS_AHEAD = 60
TZ = ZoneInfo("America/New_York")
MAIN_ADDRESS = "795 Church St NE, Cleveland, TN 37311"
HISTORY_ADDRESS = "833 N Ocoee St, Cleveland, TN 37311"
OUT = Path(__file__).resolve().parent.parent / "library-events.js"

# Event titles start with a code for who the program is for, e.g. "AD - Yoga".
AUDIENCES = {
    "AD": "Adults",
    "AA": "All ages",
    "CH": "Kids",
    "TZ": "Teens",
    "TW": "Tweens",
    "BKM": "Bookmobile",
}

# Room bookings by outside groups, not library programs open to everyone.
SKIP_TITLES = {"Meeting (Patron led)", "Democrats", "Republicans"}


def clean_text(value):
    text = html.unescape(re.sub(r"<[^>]+>", " ", str(value or "")))
    return re.sub(r"\s+", " ", text).strip()


def shorten(text, limit=220):
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0].rstrip(",.;:")
    return cut + "…"


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


def split_title(summary):
    # "AD - Yoga", "CH & TW - Build Day", "CH&TW-STEAM Club"
    match = re.match(r"^\s*([A-Z]{2,3}(?:\s*&\s*[A-Z]{2,3})*)\s*-\s*(.+)$", summary)
    if match:
        codes = [c.strip() for c in match.group(1).split("&")]
        if all(c in AUDIENCES for c in codes):
            return " & ".join(AUDIENCES[c] for c in codes), match.group(2).strip()
    return None, summary.strip()


def place(location):
    location = clean_text(location)
    if re.search(r"\d+ .+, TN \d{5}", location):
        # A full street address, e.g. a bookmobile stop.
        name, _, rest = location.partition(", ")
        address = rest.replace(", USA", "")
        if name[:1].isdigit():
            return None, location.replace(", USA", "")
        return name, address
    if "History Branch" in location:
        return "History Branch", HISTORY_ADDRESS
    room = location.strip(" ,")
    return (f"Main Library, {room}" if room else "Main Library"), MAIN_ADDRESS


def main():
    with urllib.request.urlopen(FEED, timeout=60) as response:
        calendar = icalendar.Calendar.from_ical(response.read())

    today = dt.datetime.now(TZ).date()
    occurrences = recurring_ical_events.of(calendar).between(today, today + dt.timedelta(days=DAYS_AHEAD))

    events = []
    for item in occurrences:
        if str(item.get("STATUS", "")).upper() == "CANCELLED":
            continue
        audience, title = split_title(clean_text(item.get("SUMMARY")))
        if not title or title in SKIP_TITLES:
            continue
        start = item["DTSTART"].dt
        end = item["DTEND"].dt if item.get("DTEND") else None
        event = {"title": title}
        if isinstance(start, dt.datetime):
            start = start.astimezone(TZ)
            end = end.astimezone(TZ) if isinstance(end, dt.datetime) else None
            event["date"] = start.date().isoformat()
            event["start"] = start.strftime("%H:%M")
            event["time"] = time_range(start.time(), end.time() if end and end.date() == start.date() else None)
            sort_key = start.strftime("%Y-%m-%d %H:%M")
        else:
            event["date"] = start.isoformat()
            last_day = end - dt.timedelta(days=1) if isinstance(end, dt.date) else start
            if last_day > start:
                event["endDate"] = last_day.isoformat()
            sort_key = start.isoformat()
        location, address = place(item.get("LOCATION"))
        if location:
            event["location"] = location
        event["address"] = address
        if audience:
            event["audience"] = audience
        description = clean_text(item.get("DESCRIPTION")).split("Join with Google Meet")[0].strip()
        description = shorten(description)
        if description:
            event["description"] = description
        events.append((sort_key, title, event))

    events.sort(key=lambda e: (e[0], e[1]))
    body = ",\n".join("  " + json.dumps(e, ensure_ascii=False) for _, _, e in events)
    OUT.write_text(
        "// Events from the Cleveland Bradley County Public Library's calendar.\n"
        "// This file is rewritten every morning by scripts/update_library_events.py,\n"
        "// so don't edit it by hand: add CTNCR's own events to events.js instead.\n"
        f"// Last updated {dt.datetime.now(TZ):%Y-%m-%d %H:%M} Eastern.\n\n"
        f"const LIBRARY_CALENDAR_URL = {json.dumps(CALENDAR_PAGE)};\n\n"
        f"const LIBRARY_EVENTS = [\n{body}\n];\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(events)} events to {OUT.name}")


if __name__ == "__main__":
    main()
