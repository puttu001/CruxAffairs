from pydantic import BaseModel


class CurrentAffairItem(BaseModel):
    category: str
    sub_category: str
    title: str
    summary: list[str]
    keywords: list[str]
    relevance_score: int
    source: str

    model_config = {"from_attributes": True}
