"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { ErrorState, LoadingState } from "@/components/states";
import { Card, CardContent } from "@/components/ui/card";
import { api, type ImpactSummary } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

export default function ImpactPage() {
  const { user, token, loading } = useRequireAuth();
  const [impact, setImpact] = useState<ImpactSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api<ImpactSummary>("/impact", { token })
      .then(setImpact)
      .catch((err) => setError(err.message));
  }, [token]);

  const variant = user?.role === "STUDENT" ? "student" : "evaluator";

  if (loading || !token) {
    return (
      <AppShell variant={variant}>
        <LoadingState />
      </AppShell>
    );
  }

  const tiles: [string, string | number][] = [
    ["Approved actions", impact?.approved_actions ?? 0],
    ["Students counted", impact?.participating_students ?? 0],
    ["Waste diverted (kg)", impact?.waste_diverted_kg ?? 0],
    ["Official points", impact?.official_points_awarded ?? 0],
    ["Pending reviews", impact?.pending_reviews ?? 0],
    ["Colleges active", impact?.colleges_active ?? 0],
  ];

  return (
    <AppShell variant={variant}>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Impact dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Impact metrics are calculated from approved submissions only.
          </p>
        </div>
        {error ? <ErrorState message={error} /> : null}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {tiles.map(([label, value]) => (
            <Card key={label}>
              <CardContent className="py-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}


