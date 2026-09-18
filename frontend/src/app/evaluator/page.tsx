"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { StatusBadge } from "@/components/status-badge";
import { api, type Submission } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

export default function EvaluatorQueuePage() {
  const { token, loading } = useRequireAuth(["EVALUATOR", "ADMIN"]);
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
      <AppShell variant="evaluator">
        <LoadingState />
      </AppShell>
    );
  }

  const pending = submissions.filter((item) => item.status === "PENDING_REVIEW");
  const reviewed = submissions.filter((item) => item.status !== "PENDING_REVIEW");

  return (
    <AppShell variant="evaluator">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Evaluation queue</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review AI analysis and rubric. The human evaluator always makes the final decision.
          </p>
        </div>
        {error ? <ErrorState message={error} /> : null}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Pending</h2>
          {pending.length === 0 ? (
            <EmptyState title="Queue is clear" description="New student evidence will appear here." />
          ) : (
            pending.map((submission) => (
              <Link
                key={submission.id}
                href={`/evaluator/submissions/${submission.id}`}
                className="block rounded-lg border border-border bg-white p-4 hover:bg-muted"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{submission.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {submission.student_name} · {submission.college_name} · {submission.challenge_title}
                    </p>
                  </div>
                  <StatusBadge status={submission.status} />
                </div>
              </Link>
            ))
          )}
        </section>
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Reviewed</h2>
          {reviewed.length === 0 ? (
            <EmptyState title="No reviewed submissions" description="Approved and rejected items will collect here." />
          ) : (
            reviewed.map((submission) => (
              <Link
                key={submission.id}
                href={`/evaluator/submissions/${submission.id}`}
                className="block rounded-lg border border-border bg-white p-4 hover:bg-muted"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{submission.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {submission.student_name} · {submission.awarded_points} pts
                    </p>
                  </div>
                  <StatusBadge status={submission.status} />
                </div>
              </Link>
            ))
          )}
        </section>
      </div>
    </AppShell>
  );
}
