"""
RBI (Reserve Bank of India) collector.
Fetches the latest press releases from rbi.org.in.

How it works:
  1. Fetch the listing page — extract titles + URLs from anchor tags.
  2. For each press release page, extract body text between the date line
     and the archive section (no clean HTML containers exist on this site).
  3. Return a list of plain dicts — no DB writes here.
"""

import re
import requests
from bs4 import BeautifulSoup
from datetime import datetime

RBI_BASE = "https://rbi.org.in/Scripts/"
RBI_PRESS_RELEASES = "https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    )
}


def _fetch_page(url: str) -> BeautifulSoup | None:
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        return BeautifulSoup(response.text, "lxml")
    except requests.RequestException as e:
        print(f"[RBI] Failed to fetch {url}: {e}")
        return None


def _extract_press_release_links(listing_soup: BeautifulSoup) -> list[dict]:
    """
    Listing page anchors look like:
      <a href="BS_PressReleaseDisplay.aspx?prid=62954">Title text here</a>
    We grab both the URL and the anchor text (= article title).
    """
    results = []
    seen_urls = set()
    for anchor in listing_soup.find_all("a", href=True):
        href = anchor["href"]
        if "prid=" not in href.lower():
            continue
        title = anchor.get_text(strip=True)
        if not title:
            continue
        full_url = href if href.startswith("http") else RBI_BASE + href
        if full_url not in seen_urls:
            seen_urls.add(full_url)
            results.append({"url": full_url, "title": title})
    return results


def _extract_content(url: str) -> dict:
    """
    Fetch an individual press release page and extract content using text markers.
    RBI pages have no clean content containers, so we:
      - Pull the full visible text
      - Find the date line ("Date : Jun 15, 2026")
      - Grab everything after the date until the archive filter ("2026 All Months")
    """
    soup = _fetch_page(url)
    if soup is None:
        return {"content": "", "published_at": None}

    full_text = soup.get_text(separator="\n", strip=True)

    # Extract date
    published_at = None
    date_match = re.search(r"Date\s*:\s*(\w+\s+\d+,\s*\d{4})", full_text)
    if date_match:
        for fmt in ("%b %d, %Y", "%B %d, %Y"):
            try:
                published_at = datetime.strptime(date_match.group(1).strip(), fmt)
                break
            except ValueError:
                continue

    # Content: everything between the date line and the year/month archive filter
    content = ""
    if date_match:
        after_date = full_text[date_match.end():]
        archive_match = re.search(r"\d{4}\s*All\s+Months", after_date)
        if archive_match:
            content = after_date[:archive_match.start()].strip()
        else:
            content = after_date[:5000].strip()

    return {"content": content, "published_at": published_at}


def fetch_latest_rbi(limit: int = 10) -> list[dict]:
    """
    Entry point: fetch the latest `limit` press releases from RBI.

    Returns a list of dicts, each with keys:
      title, url, content, source, published_at
    """
    print("[RBI] Fetching press releases listing...")
    listing_soup = _fetch_page(RBI_PRESS_RELEASES)
    if listing_soup is None:
        return []

    entries = _extract_press_release_links(listing_soup)
    print(f"[RBI] Found {len(entries)} links, fetching up to {limit}...")

    articles = []
    for entry in entries[:limit]:
        result = _extract_content(entry["url"])
        if result["content"]:
            articles.append({
                "title": entry["title"],
                "url": entry["url"],
                "content": result["content"],
                "source": "RBI",
                "published_at": result["published_at"],
            })
            print(f"[RBI] ✓ {entry['title'][:60]}")
        else:
            print(f"[RBI] ✗ No content: {entry['title'][:60]}")

    print(f"[RBI] Done. {len(articles)} articles collected.")
    return articles
