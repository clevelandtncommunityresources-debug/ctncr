"""Fetch the newest articles from our friends at CBFP.news (the Cleveland-Bradley
Free Press) and write them to cbfp-news.js for the news section.

Run by .github/workflows/update-events.yml every morning. To run it by hand:
    python scripts/update_news.py
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

FEED = "https://cbfp.news/rss.xml"
HOW_MANY = 3
TZ = ZoneInfo("America/New_York")
OUT = Path(__file__).resolve().parent.parent / "cbfp-news.js"


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "ctncr.org news updater"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def clean_text(value):
    text = re.sub(r"<[^>]+>", " ", html.unescape(value or ""))
    return re.sub(r"\s+", " ", text).strip()


def shorten(text, limit=240):
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0].rstrip(",;:.")
    return cut + "…"


def summary(value):
    # Some feed descriptions end in "..", and some in no punctuation at all.
    text = clean_text(value).rstrip(".")
    return text if text.endswith(("?", "!", "…")) else text + "."


def main():
    channel = ET.fromstring(fetch(FEED)).find("channel")
    articles = []
    for item in channel.findall("item"):
        published = email.utils.parsedate_to_datetime(item.findtext("pubDate"))
        articles.append({
            "title": clean_text(item.findtext("title")),
            "url": item.findtext("link").strip(),
            "date": published.astimezone(TZ).date().isoformat(),
            "summary": shorten(summary(item.findtext("description"))),
            "_sort": published,
        })
    articles.sort(key=lambda a: a.pop("_sort"), reverse=True)
    if not articles:
        raise SystemExit("The CBFP.news feed had no articles; leaving cbfp-news.js alone.")

    now = dt.datetime.now(TZ).strftime("%Y-%m-%d %H:%M")
    body = ",\n".join("  " + json.dumps(a, ensure_ascii=False) for a in articles[:HOW_MANY])
    OUT.write_text(
        "// The newest articles from our friends at CBFP.news (cbfp.news/rss.xml).\n"
        "// This file is rewritten every morning by scripts/update_news.py, so don't\n"
        "// edit it by hand.\n"
        f"// Last updated {now} Eastern.\n\n"
        f"const CBFP_NEWS = [\n{body}\n];\n",
        encoding="utf-8",
    )
    print(f"Wrote {min(len(articles), HOW_MANY)} articles to {OUT.name}.")


if __name__ == "__main__":
    main()
