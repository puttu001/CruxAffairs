import os
from openai import OpenAI, RateLimitError
from dotenv import load_dotenv

from shared.metrics import openai_tokens_used_last_run, openai_quota_exhausted

load_dotenv()

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])


def create_completion(**kwargs):
    """
    Wrapper around client.chat.completions.create() that records token usage and
    quota-exhaustion metrics. All call sites should use this instead of calling
    client.chat.completions.create() directly, so this stays the single place
    that tracks OpenAI usage for the pipeline metrics.
    """
    try:
        response = client.chat.completions.create(**kwargs)
        openai_tokens_used_last_run.inc(response.usage.total_tokens)
        openai_quota_exhausted.set(0)
        return response
    except RateLimitError:
        openai_quota_exhausted.set(1)
        raise
