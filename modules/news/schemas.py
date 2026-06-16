from datetime import datetime
from pydantic import BaseModel


class ArticleIn(BaseModel):
    """Raw article data coming from a collector (PIB, RBI, etc.)."""
    title: str
    url: str
    content: str
    source: str
    published_at: datetime | None = None
