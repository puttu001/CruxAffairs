import uuid
from sqlalchemy import Column, Text, Integer, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func

from database.base import Base


class ProcessedArticle(Base):
    __tablename__ = "processed_articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"))
    category = Column(Text)
    sub_category = Column(Text)
    relevance_score = Column(Integer)
    summary = Column(JSONB)
    keywords = Column(JSONB)
    created_at = Column(TIMESTAMP, server_default=func.now())
