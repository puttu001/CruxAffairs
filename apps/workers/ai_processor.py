"""
Pipeline step 2: process every unprocessed article with AI and save the results to the DB.

Run from the project root:
    python -m apps.workers.ai_processor
"""

from database.session import SessionLocal
from modules.current_affairs.repository import (
    get_unprocessed_articles,
    save_processed_article,
)
from modules.ai.processor import process_article


def process_all() -> tuple[int, int]:
    """Process every unprocessed article with AI. Returns (done, failed) counts."""
    db = SessionLocal()
    done = failed = 0

    try:
        articles = get_unprocessed_articles(db)
        print(f"Found {len(articles)} unprocessed articles.\n")

        for article in articles:
            print(f"Processing: {article.title[:70]}")
            result = process_article(article.title, article.content)

            if result:
                save_processed_article(db, article.id, result)
                print(f"  done [{result.category}] relevance={result.relevance_score}/10")
                done += 1
            else:
                print("  failed - skipping")
                failed += 1
    finally:
        db.close()

    return done, failed


if __name__ == "__main__":
    process_all()
