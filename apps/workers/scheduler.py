"""
Pipeline entry point: fetch new articles from all sources, then process them with AI.
This is the single command the GitHub Actions cron job runs twice daily.

Run from the project root:
    python -m apps.workers.scheduler
"""

from apps.workers.news_fetcher import fetch_all
from apps.workers.ai_processor import process_all


def run_pipeline():
    print("========================= CruxAffairs Pipeline: Fetch ===========================================================\n")
    fetch_all()

    print("===================== CruxAffairs Pipeline: AI Processing ===================\n")
    done, failed = process_all()

    print(f"\n=================== Pipeline complete: {done} processed, {failed} failed =====================")


if __name__ == "__main__":
    run_pipeline()
