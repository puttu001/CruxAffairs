"""
AI processor: takes a raw article, sends it to GPT, returns structured data.

Flow:
  article (title + content)
       ↓
  system prompt (summarize.txt)
       ↓
  GPT-4o-mini
       ↓
  ProcessedArticleOut (category, relevance_score, summary, keywords)
"""

import json
from pathlib import Path

from modules.ai.llm_client import create_completion
from modules.ai.schemas import ProcessedArticleOut

PROMPT_PATH = Path(__file__).parent / "prompts" / "summarize.txt"
SYSTEM_PROMPT = PROMPT_PATH.read_text(encoding="utf-8")


def process_article(title: str, content: str) -> ProcessedArticleOut | None:
    """
    Send one article to GPT and return structured ProcessedArticleOut.
    Returns None if GPT response can't be parsed.
    """
    user_message = f"TITLE: {title}\n\nCONTENT:\n{content[:4000]}"

    try:
        response = create_completion(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
        )

        raw_json = response.choices[0].message.content
        data = json.loads(raw_json)
        return ProcessedArticleOut(**data)

    except Exception as e:
        print(f"[AI] Failed to process '{title[:50]}': {e}")
        return None
