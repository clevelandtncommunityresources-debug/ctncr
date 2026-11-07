"""Fetch the latest world headlines from Al Jazeera and other respected news
outlets based outside the United States, and write them to world-news.js for
the World News tab (world-news.html).

Run by .github/workflows/update-world-news.yml every hour. To run it by hand:
    python scripts/update_world_news.py

To add or remove an outlet, edit SOURCES below. Each one needs an RSS feed.
"""

import datetime as dt
import email.utils
import html
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from zoneinfo import ZoneInfo

# id, name, home country, home page, RSS feed. Al Jazeera is listed first and
# gets the big spot on the page.
SOURCES = [
    ("aljazeera", "Al Jazeera", "Qatar", "https://www.aljazeera.com/", "https://www.aljazeera.com/xml/rss/all.xml"),
    ("bbc", "BBC News", "United Kingdom", "https://www.bbc.com/news/world", "https://feeds.bbci.co.uk/news/world/rss.xml"),
    ("guardian", "The Guardian", "United Kingdom", "https://www.theguardian.com/world", "https://www.theguardian.com/world/rss"),
    ("dw", "DW", "Germany", "https://www.dw.com/en/", "https://rss.dw.com/rdf/rss-en-world"),
    ("france24", "France 24", "France", "https://www.france24.com/en/", "https://www.france24.com/en/rss"),
    ("rfi", "RFI", "France", "https://www.rfi.fr/en/", "https://www.rfi.fr/en/rss"),
    ("africanews", "Africanews", "Republic of the Congo", "https://www.africanews.com/", "https://www.africanews.com/feed/rss"),
    ("thehindu", "The Hindu", "India", "https://www.thehindu.com/news/international/", "https://www.thehindu.com/news/international/feeder/default.rss"),
    ("abc", "ABC News", "Australia", "https://www.abc.net.au/news/world", "https://www.abc.net.au/news/feed/45910/rss.xml"),
    ("cbc", "CBC News", "Canada", "https://www.cbc.ca/news/world", "https://www.cbc.ca/webfeed/rss/rss-world"),
]
PER_SOURCE = {"aljazeera": 9}
DEFAULT_PER_SOURCE = 6
TZ = ZoneInfo("America/New_York")
OUT = Path(__file__).resolve().parent.parent / "world-news.js"

NS = {
    "media": "http://search.yahoo.com/mrss/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "rss1": "http://purl.org/rss/1.0/",
    "content": "http://purl.org/rss/1.0/modules/content/",
}


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; ctncr.org news updater)"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def clean_text(value):
    text = re.sub(r"<[^>]+>", " ", html.unescape(html.unescape(value or "")))
    return re.sub(r"\s+", " ", text).strip()


def shorten(text, limit=200):
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0].rstrip(",;:.")
    return cut + "…"


def parse_date(value):
    if not value:
        return None
    value = value.strip()
    try:
        return email.utils.parsedate_to_datetime(value)
    except (TypeError, ValueError):
        pass
    try:
        return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def image_of(item):
    for tag in ("media:thumbnail", "media:content"):
        for el in item.findall(tag, NS):
            url = el.get("url")
            if url and el.get("medium", "image") == "image":
                return url
    for el in item.findall("media:group/media:content", NS):
        if el.get("url"):
            return el.get("url")
    enc = item.find("enclosure")
    if enc is not None and (enc.get("type") or "").startswith("image"):
        return enc.get("url")
    return None


def items_of(root):
    channel = root.find("channel")
    if channel is not None:
        return channel.findall("item")
    return root.findall("rss1:item", NS)  # RSS 1.0 (DW)


def text_of(item, *tags):
    for tag in tags:
        value = item.findtext(tag, namespaces=NS)
        if value and value.strip():
            return value
    return ""


def read_source(source_id, name, feed):
    root = ET.fromstring(fetch(feed))
    stories = []
    seen = set()
    for item in items_of(root):
        title = clean_text(text_of(item, "title", "rss1:title"))
        url = text_of(item, "link", "rss1:link").strip()
        if not title or not url or url in seen:
            continue
        seen.add(url)
        published = parse_date(text_of(item, "pubDate", "dc:date"))
        story = {
            "title": title,
            "url": url,
            "summary": shorten(clean_text(text_of(item, "description", "rss1:description"))),
        }
        if published:
            story["time"] = published.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        image = image_of(item)
        if image and image.startswith("https://"):
            story["image"] = image
        stories.append((published or dt.datetime.min.replace(tzinfo=dt.timezone.utc), story))
    stories.sort(key=lambda s: s[0], reverse=True)
    return [s for _, s in stories[: PER_SOURCE.get(source_id, DEFAULT_PER_SOURCE)]]


def main():
    out = []
    for source_id, name, country, home, feed in SOURCES:
        try:
            stories = read_source(source_id, name, feed)
        except Exception as err:  # one outlet being down shouldn't stop the rest
            print(f"Skipped {name}: {err}")
            continue
        if stories:
            out.append({"id": source_id, "name": name, "country": country, "home": home, "stories": stories})
            print(f"{name}: {len(stories)} stories")
    if len(out) < 3:
        raise SystemExit("Too few outlets answered; leaving world-news.js alone.")

    now = dt.datetime.now(dt.timezone.utc)
    body = ",\n".join("  " + json.dumps(s, ensure_ascii=False) for s in out)
    OUT.write_text(
        "// The latest world headlines for the World News tab (world-news.html).\n"
        "// This file is rewritten every hour by scripts/update_world_news.py, so\n"
        "// don't edit it by hand. To change the outlets, edit SOURCES in that script.\n"
        f"// Last updated {now.astimezone(TZ).strftime('%Y-%m-%d %H:%M')} Eastern.\n\n"
        f'const WORLD_NEWS_UPDATED = "{now.strftime("%Y-%m-%dT%H:%M:%SZ")}";\n\n'
        f"const WORLD_NEWS = [\n{body}\n];\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(out)} outlets to {OUT.name}.")


if __name__ == "__main__":
    main()
