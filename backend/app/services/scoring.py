from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.submission import Submission, SubmissionStatus
from app.models.user import User


def official_points_for_student(db: Session, student_id: int) -> int:
    total = (
        db.query(func.coalesce(func.sum(Submission.awarded_points), 0))
        .filter(
            Submission.student_id == student_id,
            Submission.status == SubmissionStatus.APPROVED.value,
        )
        .scalar()
    )
    return int(total or 0)


def student_stats(db: Session, student: User) -> dict:
    approved = (
        db.query(Submission)
        .filter(Submission.student_id == student.id, Submission.status == SubmissionStatus.APPROVED.value)
        .all()
    )
    pending = (
        db.query(Submission)
        .filter(Submission.student_id == student.id, Submission.status == SubmissionStatus.PENDING_REVIEW.value)
        .count()
    )
    waste = sum((item.waste_collected_kg or 0) for item in approved)
    return {
        "official_points": sum(item.awarded_points for item in approved),
        "approved_count": len(approved),
        "pending_count": pending,
        "waste_collected_kg": round(waste, 1),
    }
