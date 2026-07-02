from sqlalchemy import Column, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database.base import Base


class UserBookmark(Base):
    __tablename__ = "user_bookmarks"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    article_id = Column(Text, primary_key=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
