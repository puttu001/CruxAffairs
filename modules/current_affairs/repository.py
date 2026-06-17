from sqlalchemy.orm import Session
from sqlalchemy import select, outerjoin

from database.models.article import Article
from database.models.processed_article import ProcessedArticle
from modules.ai.schemas import ProcessedArticleOut


def get_unprocessed_articles(db: Session) -> list[Article]:
    """
    Return all articles that don't yet have a row in processed_articles.
    Uses a LEFT JOIN so we only return the gap.
    """
    stmt = (
        select(Article)
        .outerjoin(ProcessedArticle, Article.id == ProcessedArticle.article_id)
        .where(ProcessedArticle.id == None)  # noqa: E711 — SQLAlchemy requires ==
    )
    return db.execute(stmt).scalars().all()


def save_processed_article(
    db: Session, article_id, result: ProcessedArticleOut
) -> ProcessedArticle:
    """Insert one row into processed_articles from the AI result."""
    row = ProcessedArticle(
        article_id=article_id,
        category=result.category,
        sub_category=result.sub_category,
        relevance_score=result.relevance_score,
        summary=result.summary,
        keywords=result.keywords,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
