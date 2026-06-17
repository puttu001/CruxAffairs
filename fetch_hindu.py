"""
Fetch latest The Hindu articles and save them to Neon.

Run from the project root:
    python fetch_hindu.py
"""

from database.session import SessionLocal
from modules.news.collectors.hindu import fetch_latest_hindu
from modules.news.schemas import ArticleIn
from modules.news.repository import save_article


def main():
    print("=== CruxAffairs: The Hindu Ingestion ===\n")

    raw_articles = fetch_latest_hindu(limit=10)
    if not raw_articles:
        print("No articles fetched. Check your internet connection or the RSS feeds.")
        return

    db = SessionLocal()
    saved = 0
    skipped = 0

    try:
        for raw in raw_articles:
            article_in = ArticleIn(**raw)
            result = save_article(db, article_in)
            if result:
                saved += 1
                print(f"  SAVED    {article_in.title[:70]}")
            else:
                skipped += 1
                print(f"  SKIPPED  (already exists) {article_in.title[:60]}")
    finally:
        db.close()

    print(f"\n=== Done: {saved} saved, {skipped} skipped ===")


if __name__ == "__main__":
    main()
