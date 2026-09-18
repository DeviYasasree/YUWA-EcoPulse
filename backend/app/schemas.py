from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    college_id: int | None
    college_name: str | None = None

    model_config = {"from_attributes": True}


class ChallengeOut(BaseModel):
    id: int
    slug: str
    title: str
    summary: str
    description: str
    evidence_requirements: str
    max_points: int
    impact_unit: str
    is_active: bool

    model_config = {"from_attributes": True}


class SubmissionCreate(BaseModel):
    challenge_id: int
    title: str = Field(min_length=4, max_length=255)
    description: str = Field(min_length=20)
    location: str | None = None
    photo_url: str | None = None
    waste_collected_kg: float | None = Field(default=None, ge=0)
    participants_count: int | None = Field(default=None, ge=1)


class AIAnalysisOut(BaseModel):
    relevance_score: int
    quality_score: int
    duplicate_risk: str
    missing_evidence: str
    suggested_score: int
    confidence: int
    summary: str

    model_config = {"from_attributes": True}


class EvaluationOut(BaseModel):
    evaluator_id: int
    decision: str
    awarded_points: int
    rubric_notes: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SubmissionOut(BaseModel):
    id: int
    student_id: int
    student_name: str | None = None
    college_name: str | None = None
    challenge_id: int
    challenge_title: str | None = None
    status: str
    title: str
    description: str
    location: str | None
    photo_url: str | None
    waste_collected_kg: float | None
    participants_count: int | None
    awarded_points: int
    created_at: datetime
    ai_analysis: AIAnalysisOut | None = None
    evaluation: EvaluationOut | None = None

    model_config = {"from_attributes": True}


class EvaluationRequest(BaseModel):
    decision: Literal["APPROVED", "REJECTED"]
    awarded_points: int | None = Field(default=None, ge=0)
    rubric_notes: str = Field(min_length=8)


class LeaderboardEntry(BaseModel):
    rank: int
    student_id: int
    student_name: str
    college_name: str
    approved_submissions: int
    total_points: int
    waste_collected_kg: float


class CollegeLeaderboardEntry(BaseModel):
    rank: int
    college_id: int
    college_name: str
    total_points: int
    approved_submissions: int
    waste_collected_kg: float


class ImpactSummary(BaseModel):
    approved_actions: int
    participating_students: int
    waste_diverted_kg: float
    official_points_awarded: int
    pending_reviews: int
    colleges_active: int
