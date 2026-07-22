"""
Shared Prometheus metrics for the batch pipeline (scheduler + AI processing + quiz generation).

The pipeline runs as a one-shot GitHub Actions job, not a long-running service, so it can't be
scraped by Prometheus directly. Instead it pushes these metrics to the Pushgateway once, right
before exiting, and Prometheus scrapes the gateway on its normal schedule.
"""

import os

from prometheus_client import CollectorRegistry, Gauge, push_to_gateway

registry = CollectorRegistry()

pipeline_last_run_timestamp = Gauge(
    "pipeline_last_run_timestamp",
    "Unix timestamp when the last pipeline run finished",
    registry=registry,
)
pipeline_last_run_success = Gauge(
    "pipeline_last_run_success",
    "1 if the last pipeline run completed successfully, 0 otherwise",
    registry=registry,
)
pipeline_duration_seconds = Gauge(
    "pipeline_duration_seconds",
    "How long the last pipeline run took, in seconds",
    registry=registry,
)
articles_processed = Gauge(
    "articles_processed",
    "Number of articles successfully processed in the last run",
    registry=registry,
)
articles_failed = Gauge(
    "articles_failed",
    "Number of articles that failed AI processing in the last run",
    registry=registry,
)
openai_tokens_used_last_run = Gauge(
    "openai_tokens_used_last_run",
    "Total OpenAI tokens used across all calls in the last run",
    registry=registry,
)
openai_quota_exhausted = Gauge(
    "openai_quota_exhausted",
    "1 if an OpenAI call in the last run failed due to rate limit/quota, 0 otherwise",
    registry=registry,
)


def push_metrics():
    """Push all metrics in this registry to the Pushgateway. Called once, at the end of a run."""
    gateway_url = os.environ["PUSHGATEWAY_URL"]
    push_to_gateway(gateway_url, job="cruxaffairs_pipeline", registry=registry)