"""
The Hindu collector.
Fetches latest articles via RSS feeds from thehindu.com.

How it works:
  1. Parse multiple RSS feeds (national, editorial, business, science).
  2. Each feed entry has: title, link, summary, published date.
  3. For each entry, try to fetch the full article page for richer content.
     If that fails, fall back to the RSS summary.
  4. Return a list of plain dicts — no DB writes here.

Why RSS: The Hindu provides clean RSS feeds with structured data.
No HTML scraping needed for the listing step — feedparser does the work.
"""

import feedparser
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from time import mktime

FEEDS = {
    "national": "https://www.thehindu.com/news/national/feeder/default.rss",
    "editorial": "https://www.thehindu.com/opinion/editorial/feeder/default.rss",
    "international": "https://www.thehindu.com/news/international/feeder/default.rss",
    "business": "https://www.thehindu.com/business/feeder/default.rss",
    "science": "https://www.thehindu.com/sci-tech/feeder/default.rss",
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    )
}


def _parse_date(entry) -> datetime | None:
    """Convert feedparser's published_parsed to a datetime."""
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        try:
            return datetime.fromtimestamp(mktime(entry.published_parsed))
        except (ValueError, OverflowError):
            pass
    return None


def _fetch_full_article(url: str) -> str | None:
    """
    Try to fetch the full article text from The Hindu's website.
    Returns None if blocked or if the page can't be parsed.
    """
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "lxml")

        article_body = (
            soup.find("div", class_="articlebodycontent")
            or soup.find("div", class_="article-body")
            or soup.find("article")
        )
        if article_body:
            paragraphs = article_body.find_all("p")
            text = "\n".join(p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True))
            if len(text) > 100:
                return text

    except requests.RequestException:
        pass

    return None


def _clean_summary(raw_summary: str) -> str:
    """Strip HTML tags from the RSS summary."""
    soup = BeautifulSoup(raw_summary, "lxml")
    return soup.get_text(separator=" ", strip=True)


def fetch_latest_hindu(limit: int = 10) -> list[dict]:
    """
    Entry point: fetch the latest articles from The Hindu's RSS feeds.

    Returns a list of dicts, each with keys:
      title, url, content, source, published_at
    """
    print("[Hindu] Parsing RSS feeds...")

    all_entries = []
    for feed_name, feed_url in FEEDS.items():
        feed = feedparser.parse(feed_url)
        if feed.bozo and not feed.entries:
            print(f"[Hindu] ✗ Feed failed: {feed_name}")
            continue
        print(f"[Hindu] {feed_name}: {len(feed.entries)} entries")
        for entry in feed.entries:
            all_entries.append(entry)

    # Deduplicate by link
    seen_urls = set()
    unique_entries = []
    for entry in all_entries:
        url = getattr(entry, "link", "")
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_entries.append(entry)

    print(f"[Hindu] {len(unique_entries)} unique entries, fetching up to {limit}...")

    articles = []
    for entry in unique_entries[:limit]:
        title = getattr(entry, "title", "").strip()
        url = getattr(entry, "link", "").strip()
        if not title or not url:
            continue

        # Try full article first, fall back to RSS summary
        content = _fetch_full_article(url)
        if not content:
            raw_summary = getattr(entry, "summary", "")
            content = _clean_summary(raw_summary)

        if not content:
            print(f"[Hindu] ✗ No content: {title[:60]}")
            continue

        articles.append({
            "title": title,
            "url": url,
            "content": content,
            "source": "TheHindu",
            "published_at": _parse_date(entry),
        })
        print(f"[Hindu] ✓ {title[:60]}")

    print(f"[Hindu] Done. {len(articles)} articles collected.")
    return articles
