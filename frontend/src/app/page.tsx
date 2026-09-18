"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { roleHome, useAuth } from "@/lib/auth";

const demoAccounts = [
  { role: "Student", email: "student@yuwa.edu" },
  { role: "Evaluator", email: "evaluator@yuwa.edu" },
  { role: "Coordinator", email: "coordinator@yuwa.edu" },
  { role: "Admin", email: "admin@yuwa.edu" },
  { role: "CSR / Donor", email: "donor@yuwa.edu" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("student@yuwa.edu");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const user = await login(email, password);
      router.push(roleHome(user.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-5xl items-center gap-10 px-4 py-10 md:grid-cols-2">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">YUWA Ecolympics</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">EcoPulse</h1>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            A verification-first climate action platform. Students submit evidence, AI assists review, evaluators
            decide, and only approved work counts toward live scores and impact.
          </p>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <p>Action → Evidence → Verification → Evaluation → Score → Impact</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <p className="text-sm text-muted-foreground">Use a demo account to walk the Phase 1 workflow.</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button className="w-full" disabled={submitting}>
                {submitting ? "Signing in..." : "Continue"}
              </Button>
            </form>
            <div className="mt-5 grid gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Demo accounts</p>
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword("password123");
                  }}
                >
                  <span>{account.role}</span>
                  <span className="text-muted-foreground">{account.email}</span>
                </button>
              ))}
              <p className="text-xs text-muted-foreground">Password for all demo users: password123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
