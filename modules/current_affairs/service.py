from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session
from sqlalchemy import select, desc, func, or_, cast, String

from database.models.article import Article
from database.models.processed_article import ProcessedArticle
from modules.current_affairs.schemas import CurrentAffairItem


def get_current_affairs(
    db: Session,
    target_date: date | None = None,
    source: str | None = None,
    category: str | None = None,
    sub_category: str | None = None,
) -> list[CurrentAffairItem]:
    """
    Join processed_articles → articles with optional filters.
    Returns items sorted by relevance (highest first).
    """
    stmt = (
        select(ProcessedArticle, Article)
        .join(Article, ProcessedArticle.article_id == Article.id)
    )

    if target_date:
        day_start = datetime.combine(target_date, datetime.min.time())
        day_end = day_start + timedelta(days=1)
        stmt = stmt.where(Article.created_at >= day_start, Article.created_at < day_end)

    if source:
        stmt = stmt.where(func.lower(Article.source) == source.lower())

    if category:
        stmt = stmt.where(func.lower(ProcessedArticle.category) == category.lower())

    if sub_category:
        stmt = stmt.where(func.lower(ProcessedArticle.sub_category) == sub_category.lower())

    stmt = stmt.order_by(desc(ProcessedArticle.relevance_score))
    rows = db.execute(stmt).all()

    result = []
    for pa, article in rows:
        result.append(
            CurrentAffairItem(
                id=str(article.id),
                category=pa.category,
                sub_category=pa.sub_category or "",
                short_title=pa.short_title or article.title[:50],
                title=article.title,
                summary=pa.summary,
                keywords=pa.keywords,
                relevance_score=pa.relevance_score,
                source=article.source,
            )
        )
    return result


def get_article_by_id(db: Session, article_id: str) -> CurrentAffairItem | None:
    """Fetch a single article by its ID."""
    stmt = (
        select(ProcessedArticle, Article)
        .join(Article, ProcessedArticle.article_id == Article.id)
        .where(cast(Article.id, String) == article_id)
    )
    row = db.execute(stmt).first()
    if not row:
        return None
    pa, article = row
    return CurrentAffairItem(
        id=str(article.id),
        category=pa.category,
        sub_category=pa.sub_category or "",
        short_title=pa.short_title or article.title[:50],
        title=article.title,
        summary=pa.summary,
        keywords=pa.keywords,
        relevance_score=pa.relevance_score,
        source=article.source,
    )


def search_current_affairs(db: Session, query: str) -> list[CurrentAffairItem]:
    """
    Search across article titles, content, and processed keywords.
    Uses SQL ILIKE for case-insensitive partial matching.
    """
    pattern = f"%{query}%"

    stmt = (
        select(ProcessedArticle, Article)
        .join(Article, ProcessedArticle.article_id == Article.id)
        .where(
            or_(
                Article.title.ilike(pattern),
                Article.content.ilike(pattern),
                cast(ProcessedArticle.keywords, String).ilike(pattern),
            )
        )
        .order_by(desc(ProcessedArticle.relevance_score))
    )
    rows = db.execute(stmt).all()

    result = []
    for pa, article in rows:
        result.append(
            CurrentAffairItem(
                id=str(article.id),
                category=pa.category,
                sub_category=pa.sub_category or "",
                short_title=pa.short_title or article.title[:50],
                title=article.title,
                summary=pa.summary,
                keywords=pa.keywords,
                relevance_score=pa.relevance_score,
                source=article.source,
            )
        )
    return result
