"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type LeaderboardEntry, type User } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

export default function LeaderboardPage() {
  const { user, token, loading } = useRequireAuth();
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api<LeaderboardEntry[]>("/leaderboard", { token })
      .then(setRows)
      .catch((err) => setError(err.message));
  }, [token]);

  const variant = shellVariant(user);

  if (loading || !token) {
    return (
      <AppShell variant={variant}>
        <LoadingState />
      </AppShell>
    );
  }

  return (
    <AppShell variant={variant}>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Live leaderboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Only approved submissions contribute official points.</p>
        </div>
        {error ? <ErrorState message={error} /> : null}
        <Card>
          <CardHeader>
            <CardTitle>Official student scores</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {rows.length === 0 ? (
              <EmptyState title="No official scores yet" description="Approve a submission to update the board." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="student_name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_points" fill="#0f766e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">College</th>
                <th className="px-4 py-3 font-medium">Approved</th>
                <th className="px-4 py-3 font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.student_id} className="border-t border-border">
                  <td className="px-4 py-3">{row.rank}</td>
                  <td className="px-4 py-3">{row.student_name}</td>
                  <td className="px-4 py-3">{row.college_name}</td>
                  <td className="px-4 py-3">{row.approved_submissions}</td>
                  <td className="px-4 py-3 font-medium">{row.total_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

function shellVariant(user: User | null): "student" | "evaluator" {
  return user?.role === "STUDENT" ? "student" : "evaluator";
}
