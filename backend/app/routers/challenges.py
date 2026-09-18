from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.challenge import Challenge
from app.models.user import User
from app.schemas import ChallengeOut

router = APIRouter(prefix="/challenges", tags=["challenges"])


@router.get("", response_model=list[ChallengeOut])
def list_challenges(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Challenge).filter(Challenge.is_active.is_(True)).order_by(Challenge.id).all()


@router.get("/{challenge_id}", response_model=ChallengeOut)
def get_challenge(challenge_id: int, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge
