"""
Pipeline step 1: fetch latest articles from every news source and save new ones to the DB.

Run from the project root:
    python -m apps.workers.news_fetcher
"""

from database.session import SessionLocal
from modules.news.collectors.pib import fetch_latest_pib
from modules.news.collectors.rbi import fetch_latest_rbi
from modules.news.collectors.prs import fetch_latest_prs
from modules.news.schemas import ArticleIn
from modules.news.repository import save_article

SOURCES = {
    "PIB": fetch_latest_pib,
    "RBI": fetch_latest_rbi,
    "PRS": fetch_latest_prs,
}


def fetch_all(limit: int = 10) -> dict[str, int]:
    """Fetch latest articles from every source and save the new ones. Returns saved count per source."""
    db = SessionLocal()
    results = {}

    try:
        for name, fetch_fn in SOURCES.items():
            print(f"=== CruxAffairs: {name} Ingestion ===")
            raw_articles = fetch_fn(limit=limit)

            if not raw_articles:
                print(f"  No articles fetched for {name}.\n")
                results[name] = 0
                continue

            saved = skipped = 0
            for raw in raw_articles:
                article_in = ArticleIn(**raw)
                if save_article(db, article_in):
                    saved += 1
                    print(f"  SAVED    {article_in.title[:70]}")
                else:
                    skipped += 1
                    print(f"  SKIPPED  (already exists) {article_in.title[:60]}")

            print(f"--- {name}: {saved} saved, {skipped} skipped ---\n")
            results[name] = saved
    finally:
        db.close()

    return results


if __name__ == "__main__":
    fetch_all()
