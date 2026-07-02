import uuid
from sqlalchemy import Column, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func

from database.base import Base


class UserQuizBookmark(Base):
    __tablename__ = "user_quiz_bookmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    question_data = Column(JSONB, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
