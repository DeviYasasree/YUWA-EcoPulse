from sqlalchemy.orm import Session

from app.models.challenge import Challenge
from app.models.college import College
from app.models.user import User, UserRole
from app.services.auth import hash_password

DEMO_PASSWORD = "password123"


def seed_database(db: Session) -> None:
    if db.query(User).first():
        return

    yuwa = College(name="YUWA Institute of Technology", city="Bengaluru")
    greenfield = College(name="Greenfield College of Engineering", city="Pune")
    db.add_all([yuwa, greenfield])
    db.flush()

    users = [
        User(
            email="student@yuwa.edu",
            hashed_password=hash_password(DEMO_PASSWORD),
            full_name="Aanya Sharma",
            role=UserRole.STUDENT.value,
            college_id=yuwa.id,
        ),
        User(
            email="student2@yuwa.edu",
            hashed_password=hash_password(DEMO_PASSWORD),
            full_name="Rohit Mehta",
            role=UserRole.STUDENT.value,
            college_id=greenfield.id,
        ),
        User(
            email="coordinator@yuwa.edu",
            hashed_password=hash_password(DEMO_PASSWORD),
            full_name="Priya Nair",
            role=UserRole.COLLEGE_COORDINATOR.value,
            college_id=yuwa.id,
        ),
        User(
            email="evaluator@yuwa.edu",
            hashed_password=hash_password(DEMO_PASSWORD),
            full_name="Dr. Kabir Rao",
            role=UserRole.EVALUATOR.value,
            college_id=None,
        ),
        User(
            email="admin@yuwa.edu",
            hashed_password=hash_password(DEMO_PASSWORD),
            full_name="YUWA Admin",
            role=UserRole.ADMIN.value,
            college_id=None,
        ),
        User(
            email="donor@yuwa.edu",
            hashed_password=hash_password(DEMO_PASSWORD),
            full_name="Narmada CSR Desk",
            role=UserRole.CSR_DONOR.value,
            college_id=None,
        ),
    ]
    db.add_all(users)

    db.add(
        Challenge(
            slug="cleanup-drive",
            title="Campus Clean-up Drive",
            summary="Organize or join a campus clean-up and submit evidence of waste collected.",
            description=(
                "Host or participate in a campus clean-up drive. Document the location, volunteers, "
                "and waste collected. This is the Phase 1 flagship challenge for YUWA EcoPulse."
            ),
            evidence_requirements=(
                "Photo of the clean-up in progress or collected waste, short activity description, "
                "location, estimated waste in kg, and volunteer count."
            ),
            max_points=50,
            impact_unit="kg waste diverted",
            is_active=True,
        )
    )
    db.add(
        Challenge(
            slug="plastic-audit",
            title="Single-Use Plastic Audit",
            summary="Audit single-use plastic on campus and propose a reduction action.",
            description=(
                "Map high-use plastic zones, estimate weekly waste, and propose one reduction action "
                "your college can take in the next 14 days."
            ),
            evidence_requirements="Photo of audit notes or hotspot, summary of findings, and proposed action.",
            max_points=40,
            impact_unit="reduction actions logged",
            is_active=True,
        )
    )
    db.commit()
