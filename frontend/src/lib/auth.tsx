"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { api, type User } from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = "ecopulse_token";

export function roleHome(role: User["role"]) {
  if (role === "STUDENT") return "/student";
  if (role === "EVALUATOR" || role === "ADMIN") return "/evaluator";
  return "/leaderboard";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const stored = window.localStorage.getItem(TOKEN_KEY);
      if (!stored) return;
      try {
        const current = await api<User>("/auth/me", { token: stored });
        if (cancelled) return;
        setToken(stored);
        setUser(current);
      } catch {
        window.localStorage.removeItem(TOKEN_KEY);
      }
    }

    void restoreSession().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login: async (email, password) => {
        const result = await api<{ access_token: string }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        const current = await api<User>("/auth/me", { token: result.access_token });
        window.localStorage.setItem(TOKEN_KEY, result.access_token);
        setToken(result.access_token);
        setUser(current);
        return current;
      },
      logout: () => {
        window.localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      },
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function useRequireAuth(allowed?: User["role"][]) {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (allowed && !allowed.includes(user.role)) {
      router.replace(roleHome(user.role));
    }
  }, [allowed, loading, router, user]);

  return { user, token, loading };
}
