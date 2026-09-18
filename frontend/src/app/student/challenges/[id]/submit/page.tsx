"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { EvidenceImage } from "@/components/evidence-image";
import { ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { api, ApiError, type Challenge, type Submission } from "@/lib/api";
import { DEMO_CLEANUP_EVIDENCE_URL } from "@/lib/evidence";
import { useRequireAuth } from "@/lib/auth";

export default function SubmitEvidencePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, loading } = useRequireAuth(["STUDENT"]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "Campus clean-up near the main gate",
    description:
      "Our student team collected plastic bottles, wrappers, and paper waste around the main campus gate and cycling track. Volunteers sorted recyclables before disposal.",
    location: "YUWA campus, main gate",
    photo_url: DEMO_CLEANUP_EVIDENCE_URL,
    waste_collected_kg: "18.5",
    participants_count: "12",
  });

  useEffect(() => {
    if (!token) return;
    api<Challenge>(`/challenges/${params.id}`, { token })
      .then(setChallenge)
      .catch((err) => setError(err.message));
  }, [params.id, token]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token || !challenge) return;
    setSubmitting(true);
    setError("");
    try {
      const created = await api<Submission>("/submissions", {
        method: "POST",
        token,
        body: JSON.stringify({
          challenge_id: challenge.id,
          title: form.title,
          description: form.description,
          location: form.location,
          photo_url: form.photo_url,
          waste_collected_kg: Number(form.waste_collected_kg),
          participants_count: Number(form.participants_count),
        }),
      });
      router.push(`/student/submissions?created=${created.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create submission");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !token) {
    return (
      <AppShell variant="student">
        <LoadingState />
      </AppShell>
    );
  }

  return (
    <AppShell variant="student">
      <div className="mx-auto max-w-2xl space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Submit evidence</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {challenge ? challenge.title : "Loading challenge..."}
          </p>
        </div>
        {error ? <ErrorState message={error} /> : null}
        <Card>
          <CardHeader>
            <CardTitle>Activity evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">What did you do?</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="photo">Photo URL</Label>
                  <Input
                    id="photo"
                    value={form.photo_url}
                    onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                  />
                  <EvidenceImage src={form.photo_url} alt="Evidence photo preview" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="waste">Waste collected (kg)</Label>
                  <Input
                    id="waste"
                    type="number"
                    step="0.1"
                    value={form.waste_collected_kg}
                    onChange={(e) => setForm({ ...form, waste_collected_kg: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="people">Volunteers</Label>
                  <Input
                    id="people"
                    type="number"
                    value={form.participants_count}
                    onChange={(e) => setForm({ ...form, participants_count: e.target.value })}
                  />
                </div>
              </div>
              <Button className="w-full" disabled={submitting || !challenge}>
                {submitting ? "Submitting..." : "Create submission"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
