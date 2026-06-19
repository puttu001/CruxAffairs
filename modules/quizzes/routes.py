from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.session import get_db
from modules.quizzes.schemas import DailyQuiz
from modules.quizzes.daily import generate_and_save_quiz, get_saved_quiz

router = APIRouter(prefix="/quiz", tags=["Quiz"])


@router.post("/generate", response_model=DailyQuiz)
def generate_quiz(db: Session = Depends(get_db)):
    """
    Generate today's quiz using AI and save to DB.
    Call this ONCE after ingestion. Replaces any existing quiz for today.
    """
    quiz = generate_and_save_quiz(db)
    if not quiz:
        raise HTTPException(
            status_code=404,
            detail="No articles found for today. Run the ingestion pipeline first.",
        )
    return quiz


@router.get("/daily", response_model=DailyQuiz)
def daily_quiz(db: Session = Depends(get_db)):
    """
    Fetch today's pre-generated quiz from DB. No LLM call.
    Returns 404 if quiz hasn't been generated yet for today.
    """
    quiz = get_saved_quiz(db)
    if not quiz:
        raise HTTPException(
            status_code=404,
            detail="Today's quiz hasn't been generated yet.",
        )
    return quiz