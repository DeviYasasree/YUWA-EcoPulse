"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { api, type Challenge } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

export default function ChallengesPage() {
  const { token, loading } = useRequireAuth(["STUDENT"]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api<Challenge[]>("/challenges", { token })
      .then(setChallenges)
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
          <h1 className="text-2xl font-semibold tracking-tight">Challenges</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start with Clean-up Drive to complete the Phase 1 loop.</p>
        </div>
        {error ? <ErrorState message={error} /> : null}
        {challenges.length === 0 ? (
          <EmptyState title="No active challenges" description="New climate actions will appear here." />
        ) : (
          <div className="grid gap-3">
            {challenges.map((challenge) => (
              <Link
                key={challenge.id}
                href={`/student/challenges/${challenge.id}`}
                className="rounded-lg border border-border bg-white p-5 hover:bg-muted"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">{challenge.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{challenge.summary}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{challenge.max_points} pts</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
