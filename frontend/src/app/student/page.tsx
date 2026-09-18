"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type Challenge, type StudentStats, type Submission } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

export default function StudentDashboardPage() {
  const { token, loading } = useRequireAuth(["STUDENT"]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    Promise.all([
      api<StudentStats>("/me/stats", { token }),
      api<Challenge[]>("/challenges", { token }),
      api<Submission[]>("/submissions", { token }),
    ])
      .then(([nextStats, nextChallenges, nextSubmissions]) => {
        setStats(nextStats);
        setChallenges(nextChallenges);
        setSubmissions(nextSubmissions);
      })
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Student dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Submit evidence. Only approved work becomes official score.</p>
        </div>
        {error ? <ErrorState message={error} /> : null}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Official points", stats?.official_points ?? 0],
            ["Approved", stats?.approved_count ?? 0],
            ["Pending", stats?.pending_count ?? 0],
            ["Waste (kg)", stats?.waste_collected_kg ?? 0],
          ].map(([label, value]) => (
            <Card key={String(label)}>
              <CardContent className="py-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Active challenges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {challenges.length === 0 ? (
              <EmptyState title="No challenges yet" description="Check back when the next Ecolympics round opens." />
            ) : (
              challenges.map((challenge) => (
                <Link
                  key={challenge.id}
                  href={`/student/challenges/${challenge.id}`}
                  className="block rounded-md border border-border px-4 py-3 hover:bg-muted"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{challenge.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{challenge.summary}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{challenge.max_points} pts</span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {submissions.length === 0 ? (
              <EmptyState title="No evidence yet" description="Open Clean-up Drive and submit your first activity." />
            ) : (
              submissions.slice(0, 5).map((submission) => (
                <div key={submission.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-3">
                  <div>
                    <p className="font-medium">{submission.title}</p>
                    <p className="text-sm text-muted-foreground">{submission.challenge_title}</p>
                  </div>
                  <StatusBadge status={submission.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
