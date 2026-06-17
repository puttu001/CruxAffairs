from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.session import get_db
from modules.news.service import ingest_source, COLLECTORS

router = APIRouter(prefix="/ingest", tags=["Ingestion"])


@router.post("/{source}")
def ingest(source: str, limit: int = 10, db: Session = Depends(get_db)):
    """
    Trigger the full pipeline for a source: fetch → save → AI process.

    Sources: pib, rbi, prs
    """
    if source not in COLLECTORS:
        return {"error": f"Unknown source: {source}. Available: {list(COLLECTORS.keys())}"}
    return ingest_source(db, source, limit)


@router.post("/")
def ingest_all(limit: int = 10, db: Session = Depends(get_db)):
    """Run the full pipeline for ALL sources."""
    results = []
    for source in COLLECTORS:
        results.append(ingest_source(db, source, limit))
    return results
