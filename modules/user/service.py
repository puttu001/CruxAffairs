from sqlalchemy.orm import Session
from sqlalchemy import select, desc, cast, String
import uuid

from database.models.article import Article
from database.models.processed_article import ProcessedArticle
from database.models.user_bookmark import UserBookmark
from database.models.user_quiz_bookmark import UserQuizBookmark
from database.models.user_note import UserNote
from modules.current_affairs.schemas import CurrentAffairItem
from modules.user.schemas import QuizBookmarkItem, NoteItem


def _row_to_article(pa: ProcessedArticle, article: Article) -> CurrentAffairItem:
    return CurrentAffairItem(
        id=str(article.id),
        category=pa.category,
        sub_category=pa.sub_category or "",
        short_title=pa.short_title or article.title[:50],
        title=article.title,
        url=article.url or "",
        summary=pa.summary,
        keywords=pa.keywords,
        additional_info=pa.additional_info or [],
        relevance_score=pa.relevance_score,
        source=article.source,
    )


# --- Article Bookmarks ---

def get_bookmark_ids(db: Session, user_id) -> list[str]:
    rows = db.execute(
        select(UserBookmark.article_id)
        .where(UserBookmark.user_id == user_id)
    ).scalars().all()
    return list(rows)


def get_bookmarks(db: Session, user_id) -> list[CurrentAffairItem]:
    stmt = (
        select(ProcessedArticle, Article)
        .join(Article, ProcessedArticle.article_id == Article.id)
        .join(UserBookmark, cast(Article.id, String) == UserBookmark.article_id)
        .where(UserBookmark.user_id == user_id)
        .order_by(desc(UserBookmark.created_at))
    )
    rows = db.execute(stmt).all()
    return [_row_to_article(pa, article) for pa, article in rows]


def add_bookmark(db: Session, user_id, article_id: str):
    exists = db.execute(
        select(UserBookmark).where(
            UserBookmark.user_id == user_id,
            UserBookmark.article_id == article_id,
        )
    ).scalar_one_or_none()
    if not exists:
        db.add(UserBookmark(user_id=user_id, article_id=article_id))
        db.commit()


def remove_bookmark(db: Session, user_id, article_id: str):
    row = db.execute(
        select(UserBookmark).where(
            UserBookmark.user_id == user_id,
            UserBookmark.article_id == article_id,
        )
    ).scalar_one_or_none()
    if row:
        db.delete(row)
        db.commit()


# --- Quiz Bookmarks ---

def get_quiz_bookmarks(db: Session, user_id) -> list[QuizBookmarkItem]:
    rows = db.execute(
        select(UserQuizBookmark)
        .where(UserQuizBookmark.user_id == user_id)
        .order_by(desc(UserQuizBookmark.created_at))
    ).scalars().all()
    return [
        QuizBookmarkItem(
            id=str(r.id),
            question_data=r.question_data,
            created_at=r.created_at.isoformat() if r.created_at else None,
        )
        for r in rows
    ]


def add_quiz_bookmark(db: Session, user_id, question_data: dict) -> str:
    row = UserQuizBookmark(user_id=user_id, question_data=question_data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return str(row.id)


def remove_quiz_bookmark(db: Session, user_id, bookmark_id: str):
    try:
        bid = uuid.UUID(bookmark_id)
    except ValueError:
        return
    row = db.execute(
        select(UserQuizBookmark).where(
            UserQuizBookmark.id == bid,
            UserQuizBookmark.user_id == user_id,
        )
    ).scalar_one_or_none()
    if row:
        db.delete(row)
        db.commit()


# --- Notes ---

def get_notes(db: Session, user_id) -> list[NoteItem]:
    rows = db.execute(
        select(UserNote)
        .where(UserNote.user_id == user_id)
        .order_by(desc(UserNote.created_at))
    ).scalars().all()
    return [
        NoteItem(
            id=str(r.id),
            title=r.title,
            content=r.content,
            created_at=r.created_at.isoformat() if r.created_at else None,
        )
        for r in rows
    ]


def add_note(db: Session, user_id, title: str, content: str) -> NoteItem:
    row = UserNote(user_id=user_id, title=title, content=content)
    db.add(row)
    db.commit()
    db.refresh(row)
    return NoteItem(
        id=str(row.id),
        title=row.title,
        content=row.content,
        created_at=row.created_at.isoformat() if row.created_at else None,
    )


def delete_note(db: Session, user_id, note_id: str):
    try:
        nid = uuid.UUID(note_id)
    except ValueError:
        return
    row = db.execute(
        select(UserNote).where(
            UserNote.id == nid,
            UserNote.user_id == user_id,
        )
    ).scalar_one_or_none()
    if row:
        db.delete(row)
        db.commit()
