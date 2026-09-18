import enum
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    COLLEGE_COORDINATOR = "COLLEGE_COORDINATOR"
    EVALUATOR = "EVALUATOR"
    ADMIN = "ADMIN"
    CSR_DONOR = "CSR_DONOR"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(String(32), index=True)
    college_id: Mapped[int | None] = mapped_column(ForeignKey("colleges.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    college = relationship("College", back_populates="users")
    submissions = relationship("Submission", back_populates="student", foreign_keys="Submission.student_id")
