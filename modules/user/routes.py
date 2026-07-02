from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from database.session import get_db
from database.models.user import User
from modules.auth.service import get_current_user
from modules.current_affairs.schemas import CurrentAffairItem
from modules.user.schemas import (
    AddBookmarkRequest, AddQuizBookmarkRequest, QuizBookmarkItem,
    AddNoteRequest, NoteItem,
)
from modules.user import service

router = APIRouter(prefix="/user", tags=["User"])


def _get_user(authorization: str = Header(...), db: Session = Depends(get_db)) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid token format")
    user = get_current_user(db, authorization[7:])
    if not user:
        raise HTTPException(401, "Invalid or expired token")
    return user


# --- Article Bookmarks ---

@router.get("/bookmarks/ids", response_model=list[str])
def bookmark_ids(user: User = Depends(_get_user), db: Session = Depends(get_db)):
    return service.get_bookmark_ids(db, user.id)


@router.get("/bookmarks", response_model=list[CurrentAffairItem])
def bookmarks(user: User = Depends(_get_user), db: Session = Depends(get_db)):
    return service.get_bookmarks(db, user.id)


@router.post("/bookmarks", status_code=204)
def add_bookmark(data: AddBookmarkRequest, user: User = Depends(_get_user), db: Session = Depends(get_db)):
    service.add_bookmark(db, user.id, data.article_id)


@router.delete("/bookmarks/{article_id}", status_code=204)
def remove_bookmark(article_id: str, user: User = Depends(_get_user), db: Session = Depends(get_db)):
    service.remove_bookmark(db, user.id, article_id)


# --- Quiz Bookmarks ---

@router.get("/quiz-bookmarks", response_model=list[QuizBookmarkItem])
def quiz_bookmarks(user: User = Depends(_get_user), db: Session = Depends(get_db)):
    return service.get_quiz_bookmarks(db, user.id)


@router.post("/quiz-bookmarks", response_model=dict)
def add_quiz_bookmark(data: AddQuizBookmarkRequest, user: User = Depends(_get_user), db: Session = Depends(get_db)):
    bid = service.add_quiz_bookmark(db, user.id, data.question_data)
    return {"id": bid}


@router.delete("/quiz-bookmarks/{bookmark_id}", status_code=204)
def remove_quiz_bookmark(bookmark_id: str, user: User = Depends(_get_user), db: Session = Depends(get_db)):
    service.remove_quiz_bookmark(db, user.id, bookmark_id)


# --- Notes ---

@router.get("/notes", response_model=list[NoteItem])
def notes(user: User = Depends(_get_user), db: Session = Depends(get_db)):
    return service.get_notes(db, user.id)


@router.post("/notes", response_model=NoteItem)
def add_note(data: AddNoteRequest, user: User = Depends(_get_user), db: Session = Depends(get_db)):
    return service.add_note(db, user.id, data.title, data.content)


@router.delete("/notes/{note_id}", status_code=204)
def delete_note(note_id: str, user: User = Depends(_get_user), db: Session = Depends(get_db)):
    service.delete_note(db, user.id, note_id)
