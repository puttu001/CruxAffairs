"""
Pipeline entry point: fetch new articles from all sources, then process them with AI.
This is the single command the GitHub Actions cron job runs twice daily.

Run from the project root:
    python -m apps.workers.scheduler
"""

from database.session import SessionLocal, test_connection
from modules.ai.llm_client import client as openai_client
from apps.workers.news_fetcher import fetch_all
from apps.workers.ai_processor import process_all
from modules.quizzes.daily import generate_and_save_quiz


def check_environment():
    """
    Verify DB and OpenAI connectivity before running the pipeline.
    Fails fast with a clear error instead of every article silently failing later.
    """
    print("=== Environment Check ===")

    if test_connection():
        print("  Database: OK")
    else:
        raise RuntimeError("Environment check failed: could not connect to the database.")

    try:
        openai_client.models.list()
        print("  OpenAI API: OK")
    except Exception as e:
        raise RuntimeError(f"Environment check failed: OpenAI API authentication failed ({e})")

    print()


def run_pipeline():
    check_environment()

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
