"""
Pipeline entry point: fetch new articles from all sources, then process them with AI.
This is the single command the GitHub Actions cron job runs twice daily.

Run from the project root:
    python -m apps.workers.scheduler
"""

from database.session import SessionLocal
from apps.workers.news_fetcher import fetch_all
from apps.workers.ai_processor import process_all
from modules.quizzes.daily import generate_and_save_quiz


def run_pipeline():
    print("========================= CruxAffairs Pipeline: Fetch ===========================================================\n")
    fetch_all()

    print("===================== CruxAffairs Pipeline: AI Processing ===================\n")
    done, failed = process_all()

    print(f"\n=================== Pipeline complete: {done} processed, {failed} failed =====================")

    print("\n===================== CruxAffairs Pipeline: Quiz Generation ===================\n")
    db = SessionLocal()
    try:
        quiz = generate_and_save_quiz(db)
        if quiz:
            print(f"Quiz generated: {quiz.total_questions} questions for {quiz.date}")
        else:
            print("Quiz generation skipped: no articles found for today.")
    finally:
        db.close()


if __name__ == "__main__":
    run_pipeline()
