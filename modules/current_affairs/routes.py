from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database.session import get_db
from modules.current_affairs.schemas import CurrentAffairItem
from modules.current_affairs.service import get_current_affairs, search_current_affairs

router = APIRouter(prefix="/current-affairs", tags=["Current Affairs"])


@router.get("/", response_model=list[CurrentAffairItem])
def current_affairs(
    date: date | None = Query(None, description="Filter by date (YYYY-MM-DD)"),
    source: str | None = Query(None, description="Filter by source: PIB, RBI, PRS, TheHindu"),
    category: str | None = Query(None, description="Filter by broad category: Economy, Polity, etc."),
    sub_category: str | None = Query(None, description="Filter by topic: Bills & Acts, RBI Circulars, Banking Awareness, etc."),
    db: Session = Depends(get_db),
):
    return get_current_affairs(db, target_date=date, source=source, category=category, sub_category=sub_category)


@router.get("/today", response_model=list[CurrentAffairItem])
def today_current_affairs(
    source: str | None = Query(None),
    category: str | None = Query(None),
    sub_category: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """Shortcut: returns only today's current affairs."""
    return get_current_affairs(db, target_date=date.today(), source=source, category=category, sub_category=sub_category)


@router.get("/search", response_model=list[CurrentAffairItem])
def search(
    q: str = Query(..., min_length=2, description="Search keyword (e.g. RBI, ISRO, Delimitation)"),
    db: Session = Depends(get_db),
):
    """Search across article titles, content, and keywords."""
    return search_current_affairs(db, q)
