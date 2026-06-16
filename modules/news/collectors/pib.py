"""
PIB (Press Information Bureau) collector.
Fetches the latest press releases from pib.gov.in.

How it works:
  1. Fetch the "All Press Releases" listing page.
  2. Extract links to individual press release pages.
  3. For each link, fetch the page and pull out the title + body text.
  4. Return a list of plain dicts — no DB writes here.
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime

PIB_BASE = "https://pib.gov.in"
PIB_LISTING = "https://pib.gov.in/allRel.aspx"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    )
}


def _fetch_page(url: str) -> BeautifulSoup | None:
    """GET a URL and return a BeautifulSoup object, or None on failure."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        return BeautifulSoup(response.text, "lxml")
    except requests.RequestException as e:
        print(f"[PIB] Failed to fetch {url}: {e}")
        return None


def _extract_article_links(listing_soup: BeautifulSoup) -> list[str]:
    """
    Parse the listing page and collect absolute URLs of press release pages.
    PIB listing anchors look like:
      <a href="/PressReleasePage.aspx?PRID=2129876">Title</a>
    """
    links = []
    for anchor in listing_soup.find_all("a", href=True):
        href = anchor["href"]
        if "PressReleasePage.aspx" in href or "PressReleaseIframePage.aspx" in href:
            full_url = PIB_BASE + href if href.startswith("/") else href
            if full_url not in links:
                links.append(full_url)
    return links


def _parse_article_page(url: str) -> dict | None:
    """
    Fetch one press release page and return:
      { title, url, content, source, published_at }
    Returns None if the page can't be parsed.
    """
    soup = _fetch_page(url)
    if soup is None:
        return None

    # Title is inside the main content heading
    title_tag = (
        soup.find("div", class_="innner-page-main-about-us-content-right-part")
        or soup.find("h2")
        or soup.find("h1")
    )
    title = title_tag.get_text(strip=True) if title_tag else "Untitled"

    # Body text is inside the release content div
    content_div = soup.find("div", id="PressReleaseContent") or soup.find(
        "div", class_="innner-page-main-about-us-content-right-part"
    )
    content = content_div.get_text(separator="\n", strip=True) if content_div else ""

    # Try to grab the date if it's on the page
    date_tag = soup.find("div", class_="ReleaseDateSubHeaddateTime")
    published_at = None
    if date_tag:
        try:
            # typical format: "June 16, 2025 18:30 IST"
            raw_date = date_tag.get_text(strip=True).split("IST")[0].strip()
            published_at = datetime.strptime(raw_date, "%B %d, %Y %H:%M")
        except ValueError:
            pass

    return {
        "title": title,
        "url": url,
        "content": content,
        "source": "PIB",
        "published_at": published_at,
    }


def fetch_latest_pib(limit: int = 10) -> list[dict]:
    """
    Entry point: fetch the latest `limit` press releases from PIB.

    Returns a list of dicts, each with keys:
      title, url, content, source, published_at
    """
    print("[PIB] Fetching listing page...")
    listing_soup = _fetch_page(PIB_LISTING)
    if listing_soup is None:
        return []

    links = _extract_article_links(listing_soup)
    print(f"[PIB] Found {len(links)} links, fetching up to {limit}...")

    articles = []
    for url in links[:limit]:
        article = _parse_article_page(url)
        if article and article["content"]:
            articles.append(article)
            print(f"[PIB] ✓ {article['title'][:60]}")

    print(f"[PIB] Done. {len(articles)} articles collected.")
    return articles
