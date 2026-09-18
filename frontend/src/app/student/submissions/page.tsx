"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { api, type Submission } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

function SubmissionsList() {
  const searchParams = useSearchParams();
  const created = searchParams.get("created");
  const { token, loading } = useRequireAuth(["STUDENT"]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api<Submission[]>("/submissions", { token })
      .then(setSubmissions)
      .catch((err) => setError(err.message));
  }, [token]);

  if (loading || !token) {
    return (
      <AppShell variant="student">
        <LoadingState />
      </AppShell>
    );
  }

  return (
    <AppShell variant="student">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your submissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">AI analysis is attached. Official score appears only after approval.</p>
        </div>
        {created ? (
          <div className="rounded-lg border border-[#cde8d6] bg-[#ecf8f1] px-4 py-3 text-sm text-[#17663a]">
            Submission #{created} created. An evaluator will review the AI analysis and make the final decision.
          </div>
        ) : null}
        {error ? <ErrorState message={error} /> : null}
        {submissions.length === 0 ? (
          <EmptyState title="No submissions" description="Open Clean-up Drive and submit evidence to start." />
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <CardContent className="space-y-3 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{submission.title}</p>
                      <p className="text-sm text-muted-foreground">{submission.challenge_title}</p>
                    </div>
                    <StatusBadge status={submission.status} />
                  </div>
                  {submission.ai_analysis ? (
                    <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                      <p>Relevance {submission.ai_analysis.relevance_score}%</p>
                      <p>Quality {submission.ai_analysis.quality_score}%</p>
                      <p>Suggested {submission.ai_analysis.suggested_score}</p>
                      <p>Confidence {submission.ai_analysis.confidence}%</p>
                    </div>
                  ) : null}
                  <p className="text-sm text-muted-foreground">
                    Official points: {submission.status === "APPROVED" ? submission.awarded_points : 0}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function StudentSubmissionsPage() {
  return (
    <Suspense
      fallback={
        <AppShell variant="student">
          <LoadingState />
        </AppShell>
      }
    >
      <SubmissionsList />
    </Suspense>
  );
}
