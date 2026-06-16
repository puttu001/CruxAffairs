import uuid
from sqlalchemy import Column, Text, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database.base import Base


class Article(Base):
    __tablename__ = "articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(Text)
    url = Column(Text, unique=True)
    source = Column(Text)
    content = Column(Text)
    published_at = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, server_default=func.now())
