from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from database.models.article import Article
from database.models.processed_article import ProcessedArticle
from modules.current_affairs.schemas import CurrentAffairItem


def get_current_affairs(db: Session) -> list[CurrentAffairItem]:
    """
    Join processed_articles → articles, return all items sorted by relevance (highest first).
    """
    stmt = (
        select(ProcessedArticle, Article)
        .join(Article, ProcessedArticle.article_id == Article.id)
        .order_by(desc(ProcessedArticle.relevance_score))
    )
    rows = db.execute(stmt).all()

    result = []
    for pa, article in rows:
        result.append(
            CurrentAffairItem(
                category=pa.category,
                title=article.title,
                summary=pa.summary,
                keywords=pa.keywords,
                relevance_score=pa.relevance_score,
                source=article.source,
            )
        )
    return result
