"""
Daily quiz generator.
- generate_and_save_quiz(): calls LLM, saves to daily_quizzes table. Run once per day.
- get_saved_quiz(): reads from DB. No LLM call. Frontend calls this.
"""

import json
from datetime import date
from pathlib import Path

from sqlalchemy.orm import Session
from sqlalchemy import select

from modules.ai.llm_client import client
from modules.quizzes.schemas import DailyQuiz, QuizQuestion
from modules.current_affairs.service import get_current_affairs
from database.models.daily_quiz import DailyQuizRecord

PROMPT_PATH = Path(__file__).parents[1] / "ai" / "prompts" / "quiz.txt"
SYSTEM_PROMPT = PROMPT_PATH.read_text(encoding="utf-8")


def generate_and_save_quiz(db: Session) -> DailyQuiz | None:
    """
    Generate today's quiz via LLM and save to the daily_quizzes table.
    If a quiz already exists for today, it gets replaced.
    """
    today = date.today()
    articles = get_current_affairs(db, target_date=today)
    if not articles:
        return None

    lines = []
    for i, article in enumerate(articles, 1):
        bullets = " | ".join(article.summary)
        lines.append(f"{i}. [{article.short_title}] ({article.source}) — {bullets}")

    user_message = "Today's current affairs:\n\n" + "\n".join(lines)

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            response_format={"type": "json_object"},
            temperature=0.4,
        )

        raw_json = response.choices[0].message.content
        data = json.loads(raw_json)
        questions = [QuizQuestion(**q) for q in data["questions"]]

    except Exception as e:
        print(f"[Quiz] Failed to generate quiz: {e}")
        return None

    # Save to DB (upsert — replace if today's quiz already exists)
    existing = db.execute(
        select(DailyQuizRecord).where(DailyQuizRecord.date == today)
    ).scalar_one_or_none()

    questions_json = [q.model_dump() for q in questions]

    if existing:
        existing.questions = questions_json
    else:
        db.add(DailyQuizRecord(date=today, questions=questions_json))

    db.commit()

    return DailyQuiz(
        date=today.isoformat(),
        total_questions=len(questions),
        questions=questions,
    )


def get_saved_quiz(db: Session, target_date: date | None = None) -> DailyQuiz | None:
    """
    Read today's quiz from the DB. No LLM call.
    Returns None if no quiz has been generated for that date.
    """
    target = target_date or date.today()
    record = db.execute(
        select(DailyQuizRecord).where(DailyQuizRecord.date == target)
    ).scalar_one_or_none()

    if not record:
        return None

    questions = [QuizQuestion(**q) for q in record.questions]
    return DailyQuiz(
        date=target.isoformat(),
        total_questions=len(questions),
        questions=questions,
    )