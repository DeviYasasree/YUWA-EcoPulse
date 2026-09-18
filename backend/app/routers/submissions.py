from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models.challenge import Challenge
from app.models.evaluation import Evaluation
from app.models.submission import AIAnalysis, Submission, SubmissionStatus
from app.models.user import User, UserRole
from app.schemas import EvaluationRequest, SubmissionCreate, SubmissionOut
from app.services.ai import analyze_submission

router = APIRouter(prefix="/submissions", tags=["submissions"])

LEGACY_DEMO_PHOTO_URLS = {
    "https://images.unsplash.com/photo-1618477461853-cf6b80e1f6d3",
    "https://example.com/photo.jpg",
    "http://example.com/photo.jpg",
}
STABLE_DEMO_PHOTO_URL = (
    "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=1200&q=80"
)


def normalize_photo_url(url: str | None) -> str | None:
    """Map known-broken demo evidence URLs to a stable public cleanup photo."""
    if not url:
        return url
    stripped = url.strip()
    if stripped.rstrip("/") in LEGACY_DEMO_PHOTO_URLS:
        return STABLE_DEMO_PHOTO_URL
    return stripped


def serialize(submission: Submission) -> SubmissionOut:
    return SubmissionOut(
        id=submission.id,
        student_id=submission.student_id,
        student_name=submission.student.full_name if submission.student else None,
        college_name=submission.student.college.name if submission.student and submission.student.college else None,
        challenge_id=submission.challenge_id,
        challenge_title=submission.challenge.title if submission.challenge else None,
        status=submission.status,
        title=submission.title,
        description=submission.description,
        location=submission.location,
        photo_url=normalize_photo_url(submission.photo_url),
        waste_collected_kg=submission.waste_collected_kg,
        participants_count=submission.participants_count,
        awarded_points=submission.awarded_points,
        created_at=submission.created_at,
        ai_analysis=submission.ai_analysis,
        evaluation=submission.evaluation,
    )


def load_query(db: Session):
    return db.query(Submission).options(
        joinedload(Submission.student).joinedload(User.college),
        joinedload(Submission.challenge),
        joinedload(Submission.ai_analysis),
        joinedload(Submission.evaluation),
    )


@router.post("", response_model=SubmissionOut, status_code=status.HTTP_201_CREATED)
def create_submission(
    payload: SubmissionCreate,
    user: User = Depends(require_roles(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    challenge = db.query(Challenge).filter(Challenge.id == payload.challenge_id, Challenge.is_active.is_(True)).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    submission = Submission(
        student_id=user.id,
        challenge_id=challenge.id,
        status=SubmissionStatus.PENDING_REVIEW.value,
        title=payload.title,
        description=payload.description,
        location=payload.location,
        photo_url=normalize_photo_url(payload.photo_url),
        waste_collected_kg=payload.waste_collected_kg,
        participants_count=payload.participants_count,
        awarded_points=0,
    )
    db.add(submission)
    db.flush()

    analysis = analyze_submission(submission, challenge)
    db.add(AIAnalysis(submission_id=submission.id, **analysis))
    db.commit()
    created = load_query(db).filter(Submission.id == submission.id).first()
    return serialize(created)


@router.get("", response_model=list[SubmissionOut])
def list_submissions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = load_query(db).order_by(Submission.created_at.desc())
    if user.role == UserRole.STUDENT.value:
        query = query.filter(Submission.student_id == user.id)
    elif user.role in {UserRole.EVALUATOR.value, UserRole.ADMIN.value, UserRole.COLLEGE_COORDINATOR.value}:
        pass
    else:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return [serialize(item) for item in query.all()]


@router.get("/{submission_id}", response_model=SubmissionOut)
def get_submission(submission_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    submission = load_query(db).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if user.role == UserRole.STUDENT.value and submission.student_id != user.id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    if user.role == UserRole.CSR_DONOR.value:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return serialize(submission)


@router.post("/{submission_id}/evaluate", response_model=SubmissionOut)
def evaluate_submission(
    submission_id: int,
    payload: EvaluationRequest,
    user: User = Depends(require_roles(UserRole.EVALUATOR, UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    submission = load_query(db).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if submission.status != SubmissionStatus.PENDING_REVIEW.value:
        raise HTTPException(status_code=400, detail="Submission has already been evaluated")

    max_points = submission.challenge.max_points
    suggested = submission.ai_analysis.suggested_score if submission.ai_analysis else 0
    awarded = payload.awarded_points if payload.awarded_points is not None else suggested
    if awarded > max_points:
        raise HTTPException(status_code=400, detail=f"Score cannot exceed {max_points}")

    if payload.decision == "APPROVED":
        submission.status = SubmissionStatus.APPROVED.value
        submission.awarded_points = awarded
    else:
        submission.status = SubmissionStatus.REJECTED.value
        submission.awarded_points = 0
        awarded = 0

    db.add(
        Evaluation(
            submission_id=submission.id,
            evaluator_id=user.id,
            decision=payload.decision,
            awarded_points=awarded,
            rubric_notes=payload.rubric_notes,
        )
    )
    db.commit()
    updated = load_query(db).filter(Submission.id == submission_id).first()
    return serialize(updated)
