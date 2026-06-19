from sqlalchemy import Column, Date, TIMESTAMP
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from database.base import Base


class DailyQuizRecord(Base):
    __tablename__ = "daily_quizzes"

    date = Column(Date, primary_key=True)
    questions = Column(JSONB)
    created_at = Column(TIMESTAMP, server_default=func.now())