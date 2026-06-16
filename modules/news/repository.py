from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database.models.article import Article
from modules.news.schemas import ArticleIn


def save_article(db: Session, data: ArticleIn) -> Article | None:
    """
    Insert one article into the articles table.
    Returns the saved Article, or None if the URL already exists (duplicate).
    """
    article = Article(
        title=data.title,
        url=data.url,
        content=data.content,
        source=data.source,
        published_at=data.published_at,
    )
    db.add(article)
    try:
        db.commit()
        db.refresh(article)
        return article
    except IntegrityError:
        # url column has a UNIQUE constraint — this article was already saved
        db.rollback()
        return None
