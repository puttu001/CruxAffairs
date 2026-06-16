from pydantic import BaseModel, Field


class ProcessedArticleOut(BaseModel):
    category: str
    relevance_score: int = Field(ge=1, le=10)
    summary: list[str]
    keywords: list[str]
