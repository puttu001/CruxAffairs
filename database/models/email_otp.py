from sqlalchemy import Column, Text, TIMESTAMP
from sqlalchemy.sql import func

from database.base import Base


class EmailOTP(Base):
    __tablename__ = "email_otps"

    email = Column(Text, primary_key=True)
    code = Column(Text, nullable=False)
    expires_at = Column(TIMESTAMP, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
