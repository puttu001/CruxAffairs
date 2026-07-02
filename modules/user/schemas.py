from typing import Any
from pydantic import BaseModel


class AddBookmarkRequest(BaseModel):
    article_id: str


class AddQuizBookmarkRequest(BaseModel):
    question_data: dict[str, Any]


class QuizBookmarkItem(BaseModel):
    id: str
    question_data: dict[str, Any]
    created_at: str | None = None


class AddNoteRequest(BaseModel):
    title: str
    content: str


class NoteItem(BaseModel):
    id: str
    title: str
    content: str
    created_at: str | None = None
