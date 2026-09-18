"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { ErrorState, LoadingState } from "@/components/states";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { api, ApiError, type Submission } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

export default function EvaluatorReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, loading } = useRequireAuth(["EVALUATOR", "ADMIN"]);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("Evidence matches the clean-up challenge. Impact numbers are plausible.");
  const [points, setPoints] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    api<Submission>(`/submissions/${params.id}`, { token })
      .then((item) => {
        setSubmission(item);
        setPoints(String(item.ai_analysis?.suggested_score ?? 0));
      })
      .catch((err) => setError(err.message));
  }, [params.id, token]);

  async function decide(decision: "APPROVED" | "REJECTED") {
    if (!token || !submission) return;
    setSaving(true);
    setError("");
    try {
      await api(`/submissions/${submission.id}/evaluate`, {
        method: "POST",
        token,
        body: JSON.stringify({
          decision,
          awarded_points: Number(points),
          rubric_notes: notes,
        }),
      });
      router.push("/evaluator");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save evaluation");
    } finally {
      setSaving(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await decide("APPROVED");
  }

  if (loading || !token) {
    return (
      <AppShell variant="evaluator">
        <LoadingState />
      </AppShell>
    );
  }

  const analysis = submission?.ai_analysis;

  return (
    <AppShell variant="evaluator">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          {error ? <ErrorState message={error} /> : null}
          {!submission && !error ? <LoadingState /> : null}
          {submission ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">{submission.title}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {submission.student_name} · {submission.college_name} · {submission.challenge_title}
                  </p>
                </div>
                <StatusBadge status={submission.status} />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Student evidence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>{submission.description}</p>
                  <p className="text-muted-foreground">Location: {submission.location || "Not provided"}</p>
                  <p className="text-muted-foreground">Waste: {submission.waste_collected_kg ?? 0} kg</p>
                  <p className="text-muted-foreground">Volunteers: {submission.participants_count ?? 0}</p>
                  {submission.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={submission.photo_url} alt="Submitted evidence" className="max-h-72 rounded-md border border-border object-cover" />
                  ) : null}
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>AI analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {analysis ? (
                <>
                  <p>Evidence relevance: {analysis.relevance_score}%</p>
                  <p>Evidence quality: {analysis.quality_score}%</p>
                  <p>Duplicate risk: {analysis.duplicate_risk}</p>
                  <p>Missing evidence: {analysis.missing_evidence}</p>
                  <p>Suggested score: {analysis.suggested_score}</p>
                  <p>Confidence: {analysis.confidence}%</p>
                  <p className="text-muted-foreground">{analysis.summary}</p>
                </>
              ) : (
                <p className="text-muted-foreground">No AI analysis available.</p>
              )}
            </CardContent>
          </Card>
          {submission?.status === "PENDING_REVIEW" ? (
            <Card>
              <CardHeader>
                <CardTitle>Evaluator decision</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={onSubmit}>
                  <div className="space-y-1.5">
                    <Label htmlFor="points">Awarded points</Label>
                    <Input id="points" type="number" value={points} onChange={(e) => setPoints(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="notes">Rubric notes</Label>
                    <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button type="submit" disabled={saving}>
                      Approve
                    </Button>
                    <Button type="button" variant="destructive" disabled={saving} onClick={() => decide("REJECTED")}>
                      Reject
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : submission?.evaluation ? (
            <Card>
              <CardHeader>
                <CardTitle>Final evaluation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Decision: {submission.evaluation.decision}</p>
                <p>Official points: {submission.evaluation.awarded_points}</p>
                <p className="text-muted-foreground">{submission.evaluation.rubric_notes}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
