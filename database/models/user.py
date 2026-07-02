import uuid
from sqlalchemy import Column, Text, Boolean, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text)
    email = Column(Text, unique=True, nullable=False)
    password_hash = Column(Text)
    auth_provider = Column(Text, default="email")
    google_id = Column(Text, unique=True, nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
