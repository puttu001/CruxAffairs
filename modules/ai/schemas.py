from pydantic import BaseModel, Field


class AdditionalInfoItem(BaseModel):
    subject: str
    facts: list[str]


class ProcessedArticleOut(BaseModel):
    short_title: str
    category: str
    sub_category: str
    relevance_score: int = Field(ge=1, le=10)
    summary: list[str]
    keywords: list[str]
    additional_info: list[AdditionalInfoItem] = []