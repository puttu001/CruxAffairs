"""
PRS Legislative Research collector.
Fetches the latest bills and legislative briefs from prsindia.org.

How it works:
  1. Fetch the bill tracking listing page.
  2. Extract links + titles from anchors pointing to /billtrack/<slug>.
  3. For each bill page, extract body text between the title and the footer.
  4. Return a list of plain dicts — no DB writes here.

PRS page structure (as of Jun 2026):
  - Listing: simple headings with anchor links, no pagination
  - Bill page: <h1> title, then content as paragraphs/lists, minimal HTML containers
"""

import re
import requests
from bs4 import BeautifulSoup

PRS_BASE = "https://prsindia.org"
PRS_BILLS = "https://prsindia.org/billtrack"

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
        print(f"[PRS] Failed to fetch {url}: {e}")
        return None


def _extract_bill_links(listing_soup: BeautifulSoup) -> list[dict]:
    """
    Listing page has anchors like:
      <a href="/billtrack/the-delimitation-bill-2026">The Delimitation Bill, 2026</a>
    """
    results = []
    seen_urls = set()
    for anchor in listing_soup.find_all("a", href=True):
        href = anchor["href"]
        if "/billtrack/" not in href:
            continue
        # Skip the listing page itself and any anchor fragments
        slug = href.rstrip("/").split("/billtrack/")[-1]
        if not slug or slug == "billtrack" or "#" in slug:
            continue
        title = anchor.get_text(strip=True)
        if not title:
            continue
        full_url = href if href.startswith("http") else PRS_BASE + href
        if full_url not in seen_urls:
            seen_urls.add(full_url)
            results.append({"url": full_url, "title": title})
    return results


def _extract_content(url: str) -> str:
    """
    Fetch a bill page and extract the body text.
    PRS pages have no clean content container, so we:
      - Get full visible text
      - Strip navigation (before the bill title) and footer (after copyright)
    """
    soup = _fetch_page(url)
    if soup is None:
        return ""

    # Try to find the main article area
    # PRS sometimes uses <article> or a div with class containing "content"
    article = soup.find("article") or soup.find("div", class_=re.compile(r"content|field"))
    if article:
        return article.get_text(separator="\n", strip=True)

    # Fallback: full text between title heading and footer markers
    full_text = soup.get_text(separator="\n", strip=True)

    # Find the start: after the page title (appears in an h1)
    h1 = soup.find("h1")
    if h1:
        h1_text = h1.get_text(strip=True)
        start_idx = full_text.find(h1_text)
        if start_idx >= 0:
            full_text = full_text[start_idx:]

    # Find the end: before copyright/footer
    for marker in ["© PRS Legislative", "Copyright", "Creative Commons", "Disclaimer"]:
        end_idx = full_text.find(marker)
        if end_idx > 0:
            full_text = full_text[:end_idx]
            break

    return full_text.strip()


def fetch_latest_prs(limit: int = 10) -> list[dict]:
    """
    Entry point: fetch the latest `limit` bills from PRS Legislative Research.

    Returns a list of dicts, each with keys:
      title, url, content, source, published_at
    """
    print("[PRS] Fetching bill listing page...")
    listing_soup = _fetch_page(PRS_BILLS)
    if listing_soup is None:
        return []

    entries = _extract_bill_links(listing_soup)
    print(f"[PRS] Found {len(entries)} bill links, fetching up to {limit}...")

    articles = []
    for entry in entries[:limit]:
        content = _extract_content(entry["url"])
        if content:
            articles.append({
                "title": entry["title"],
                "url": entry["url"],
                "content": content,
                "source": "PRS",
                "published_at": None,
            })
            print(f"[PRS] ✓ {entry['title'][:60]}")
        else:
            print(f"[PRS] ✗ No content: {entry['title'][:60]}")

    print(f"[PRS] Done. {len(articles)} articles collected.")
    return articles
