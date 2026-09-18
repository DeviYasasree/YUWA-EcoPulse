export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let detail = "Request failed";
    try {
      const body = await response.json();
      detail = body.detail ?? detail;
      if (Array.isArray(detail)) {
        detail = detail.map((item) => item.msg ?? item).join(", ");
      }
    } catch {
      detail = response.statusText;
    }
    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: "STUDENT" | "COLLEGE_COORDINATOR" | "EVALUATOR" | "ADMIN" | "CSR_DONOR";
  college_id: number | null;
  college_name: string | null;
};

export type Challenge = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  evidence_requirements: string;
  max_points: number;
  impact_unit: string;
  is_active: boolean;
};

export type AIAnalysis = {
  relevance_score: number;
  quality_score: number;
  duplicate_risk: string;
  missing_evidence: string;
  suggested_score: number;
  confidence: number;
  summary: string;
};

export type Submission = {
  id: number;
  student_id: number;
  student_name: string | null;
  college_name: string | null;
  challenge_id: number;
  challenge_title: string | null;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  title: string;
  description: string;
  location: string | null;
  photo_url: string | null;
  waste_collected_kg: number | null;
  participants_count: number | null;
  awarded_points: number;
  created_at: string;
  ai_analysis: AIAnalysis | null;
  evaluation: {
    evaluator_id: number;
    decision: string;
    awarded_points: number;
    rubric_notes: string;
    created_at: string;
  } | null;
};

export type LeaderboardEntry = {
  rank: number;
  student_id: number;
  student_name: string;
  college_name: string;
  approved_submissions: number;
  total_points: number;
  waste_collected_kg: number;
};

export type ImpactSummary = {
  approved_actions: number;
  participating_students: number;
  waste_diverted_kg: number;
  official_points_awarded: number;
  pending_reviews: number;
  colleges_active: number;
};

export type StudentStats = {
  official_points: number;
  approved_count: number;
  pending_count: number;
  waste_collected_kg: number;
};
