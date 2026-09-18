from app.models.challenge import Challenge
from app.models.submission import Submission


def analyze_submission(submission: Submission, challenge: Challenge) -> dict:
    description = (submission.description or "").strip()
    has_photo = bool(submission.photo_url)
    has_location = bool(submission.location)
    has_waste = submission.waste_collected_kg is not None and submission.waste_collected_kg > 0

    missing: list[str] = []
    if not has_photo:
        missing.append("photo evidence")
    if not has_location:
        missing.append("location")
    if not has_waste:
        missing.append("quantified impact")

    relevance = 70
    if any(word in description.lower() for word in ["clean", "waste", "plastic", "campus", "drive"]):
        relevance += 16
    if challenge.slug == "cleanup-drive":
        relevance += 6
    relevance = min(relevance, 96)

    quality = 62
    if len(description) > 80:
        quality += 12
    if has_photo:
        quality += 10
    if has_location:
        quality += 6
    if has_waste:
        quality += 7
    quality = min(quality, 94)

    duplicate_risk = "Low"
    if len(description) < 40:
        duplicate_risk = "Medium"

    suggested = round(challenge.max_points * ((relevance + quality) / 200))
    if missing:
        suggested = max(20, suggested - (8 * len(missing)))
    suggested = min(challenge.max_points, suggested)

    confidence = 78 + (4 if has_photo else 0) + (3 if has_waste else 0) + (2 if has_location else 0)
    confidence = min(confidence, 93)

    summary = (
        f"The submission is {relevance}% aligned with {challenge.title}. "
        f"Evidence quality is estimated at {quality}%. Duplicate risk is {duplicate_risk.lower()}. "
        f"Suggested score is {suggested}/{challenge.max_points} with {confidence}% confidence. "
        "A human evaluator must make the final decision."
    )

    return {
        "relevance_score": relevance,
        "quality_score": quality,
        "duplicate_risk": duplicate_risk,
        "missing_evidence": ", ".join(missing) if missing else "None detected",
        "suggested_score": suggested,
        "confidence": confidence,
        "summary": summary,
    }
