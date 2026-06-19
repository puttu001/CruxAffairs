from pydantic import BaseModel


class CurrentAffairItem(BaseModel):
    id: str
    category: str
    sub_category: str
    short_title: str
    title: str
    summary: list[str]
    keywords: list[str]
    relevance_score: int
    source: str

    model_config = {"from_attributes": True}