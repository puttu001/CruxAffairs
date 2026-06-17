"""
Ingestion service: collect → save → AI process for any source.

This is the single function that does all the work when you hit an endpoint.
"""

from sqlalchemy.orm import Session

from modules.news.collectors.pib import fetch_latest_pib
from modules.news.collectors.rbi import fetch_latest_rbi
from modules.news.collectors.prs import fetch_latest_prs
from modules.news.collectors.hindu import fetch_latest_hindu
from modules.news.schemas import ArticleIn
from modules.news.repository import save_article
from modules.ai.processor import process_article
from modules.current_affairs.repository import save_processed_article

COLLECTORS = {
    "pib": fetch_latest_pib,
    "rbi": fetch_latest_rbi,
    "prs": fetch_latest_prs,
    "hindu": fetch_latest_hindu,
}


def ingest_source(db: Session, source: str, limit: int = 10) -> dict:
    """
    Full pipeline for one source:
      1. Fetch articles from the web
      2. Save new articles to DB (skip duplicates)
      3. AI-process each new article
      4. Save processed results to DB

    Returns a summary dict with counts.
    """
    collector = COLLECTORS.get(source)
    if collector is None:
        return {"error": f"Unknown source: {source}. Available: {list(COLLECTORS.keys())}"}

    # Step 1: Collect
    raw_articles = collector(limit=limit)
    if not raw_articles:
        return {"source": source, "fetched": 0, "saved": 0, "processed": 0, "skipped": 0}

    # Step 2: Save to articles table
    saved_articles = []
    skipped = 0
    for raw in raw_articles:
        article_in = ArticleIn(**raw)
        result = save_article(db, article_in)
        if result:
            saved_articles.append(result)
        else:
            skipped += 1

    # Step 3: AI-process each newly saved article
    processed = 0
    for article in saved_articles:
        ai_result = process_article(article.title, article.content)
        if ai_result:
            save_processed_article(db, article.id, ai_result)
            processed += 1

    return {
        "source": source,
        "fetched": len(raw_articles),
        "saved": len(saved_articles),
        "processed": processed,
        "skipped": skipped,
    }
