"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { ErrorState, LoadingState } from "@/components/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type Challenge } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

export default function ChallengeDetailPage() {
  const params = useParams<{ id: string }>();
  const { token, loading } = useRequireAuth(["STUDENT"]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api<Challenge>(`/challenges/${params.id}`, { token })
      .then(setChallenge)
      .catch((err) => setError(err.message));
  }, [params.id, token]);

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
        {error ? <ErrorState message={error} /> : null}
        {!challenge && !error ? <LoadingState /> : null}
        {challenge ? (
          <>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">Challenge</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">{challenge.title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{challenge.description}</p>
              <Link
                href={`/student/challenges/${challenge.id}/submit`}
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground sm:w-auto"
              >
                Submit evidence
              </Link>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Evidence required</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{challenge.evidence_requirements}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Scoring</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Maximum official score is {challenge.max_points} points. AI will suggest a score. An evaluator makes the
                final decision. Rejected or pending work does not count on the leaderboard.
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
