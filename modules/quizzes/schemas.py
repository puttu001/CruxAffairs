from pydantic import BaseModel, Field


class QuizQuestion(BaseModel):
    id: int
    question: str
    options: list[str] = Field(min_length=4, max_length=4)
    correct: int = Field(ge=0, le=3)
    explanation: str
    source_title: str


class DailyQuiz(BaseModel):
    date: str
    total_questions: int
    questions: list[QuizQuestion]