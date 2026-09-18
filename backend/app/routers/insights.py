from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_user
from app.models.college import College
from app.models.submission import Submission, SubmissionStatus
from app.models.user import User
from app.schemas import CollegeLeaderboardEntry, ImpactSummary, LeaderboardEntry
from app.services.scoring import student_stats

router = APIRouter(tags=["insights"])


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def leaderboard(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(
            User.id,
            User.full_name,
            College.name,
            func.count(Submission.id),
            func.coalesce(func.sum(Submission.awarded_points), 0),
            func.coalesce(func.sum(Submission.waste_collected_kg), 0),
        )
        .join(Submission, Submission.student_id == User.id)
        .outerjoin(College, College.id == User.college_id)
        .filter(Submission.status == SubmissionStatus.APPROVED.value)
        .group_by(User.id, User.full_name, College.name)
        .order_by(func.coalesce(func.sum(Submission.awarded_points), 0).desc())
        .all()
    )
    return [
        LeaderboardEntry(
            rank=index + 1,
            student_id=row[0],
            student_name=row[1],
            college_name=row[2] or "Independent",
            approved_submissions=int(row[3]),
            total_points=int(row[4]),
            waste_collected_kg=float(row[5] or 0),
        )
        for index, row in enumerate(rows)
    ]


@router.get("/leaderboard/colleges", response_model=list[CollegeLeaderboardEntry])
def college_leaderboard(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(
            College.id,
            College.name,
            func.coalesce(func.sum(Submission.awarded_points), 0),
            func.count(Submission.id),
            func.coalesce(func.sum(Submission.waste_collected_kg), 0),
        )
        .join(User, User.college_id == College.id)
        .join(Submission, Submission.student_id == User.id)
        .filter(Submission.status == SubmissionStatus.APPROVED.value)
        .group_by(College.id, College.name)
        .order_by(func.coalesce(func.sum(Submission.awarded_points), 0).desc())
        .all()
    )
    return [
        CollegeLeaderboardEntry(
            rank=index + 1,
            college_id=row[0],
            college_name=row[1],
            total_points=int(row[2]),
            approved_submissions=int(row[3]),
            waste_collected_kg=float(row[4] or 0),
        )
        for index, row in enumerate(rows)
    ]


@router.get("/impact", response_model=ImpactSummary)
def impact(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    approved = (
        db.query(Submission)
        .options(joinedload(Submission.student))
        .filter(Submission.status == SubmissionStatus.APPROVED.value)
        .all()
    )
    pending = db.query(Submission).filter(Submission.status == SubmissionStatus.PENDING_REVIEW.value).count()
    student_ids = {item.student_id for item in approved}
    college_ids = {item.student.college_id for item in approved if item.student and item.student.college_id}
    return ImpactSummary(
        approved_actions=len(approved),
        participating_students=len(student_ids),
        waste_diverted_kg=round(sum((item.waste_collected_kg or 0) for item in approved), 1),
        official_points_awarded=sum(item.awarded_points for item in approved),
        pending_reviews=pending,
        colleges_active=len(college_ids),
    )


@router.get("/me/stats")
def my_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return student_stats(db, user)
