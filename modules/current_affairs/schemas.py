from pydantic import BaseModel


class AdditionalInfoItem(BaseModel):
    subject: str
    facts: list[str]


class CurrentAffairItem(BaseModel):
    id: str
    category: str
    sub_category: str
    short_title: str
    title: str
    url: str
    summary: list[str]
    keywords: list[str]
    additional_info: list[AdditionalInfoItem]
    relevance_score: int
    source: str

    model_config = {"from_attributes": True}