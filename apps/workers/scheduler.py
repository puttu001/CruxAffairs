"""
Pipeline entry point: fetch new articles from all sources, then process them with AI.
This is the single command the GitHub Actions cron job runs twice daily.

Run from the project root:
    python -m apps.workers.scheduler
"""

import time

from database.session import SessionLocal, test_connection
from modules.ai.llm_client import client as openai_client
from apps.workers.news_fetcher import fetch_all
from apps.workers.ai_processor import process_all
from modules.quizzes.daily import generate_and_save_quiz
from shared.metrics import (
    articles_failed,
    articles_processed,
    pipeline_duration_seconds,
    pipeline_last_run_success,
    pipeline_last_run_timestamp,
    push_metrics,
)


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
    start_time = time.time()
    try:
        check_environment()

        print("========================= CruxAffairs Pipeline: Fetch ===========================================================\n")
        fetch_all()

        print("===================== CruxAffairs Pipeline: AI Processing ===================\n")
        done, failed = process_all()
        articles_processed.set(done)
        articles_failed.set(failed)

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

        pipeline_last_run_success.set(1)
    except Exception:
        pipeline_last_run_success.set(0)
        raise
    finally:
        pipeline_duration_seconds.set(time.time() - start_time)
        pipeline_last_run_timestamp.set(time.time())
        push_metrics()


if __name__ == "__main__":
    run_pipeline()
