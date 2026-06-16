from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.session import get_db
from modules.current_affairs.schemas import CurrentAffairItem
from modules.current_affairs.service import get_current_affairs

router = APIRouter(prefix="/current-affairs", tags=["Current Affairs"])


@router.get("/", response_model=list[CurrentAffairItem])
def current_affairs(db: Session = Depends(get_db)):
    return get_current_affairs(db)
