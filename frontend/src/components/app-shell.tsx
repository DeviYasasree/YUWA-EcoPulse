"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Award, ClipboardCheck, LayoutDashboard, Leaf, LogOut, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const studentLinks = [
  { href: "/student", label: "Home", icon: LayoutDashboard },
  { href: "/student/challenges", label: "Challenges", icon: Leaf },
  { href: "/student/submissions", label: "Submissions", icon: ClipboardCheck },
  { href: "/leaderboard", label: "Board", icon: Trophy },
];

const evaluatorLinks = [
  { href: "/evaluator", label: "Queue", icon: ClipboardCheck },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/impact", label: "Impact", icon: Award },
];

export function AppShell({ children, variant }: { children: React.ReactNode; variant: "student" | "evaluator" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const links = variant === "student" ? studentLinks : evaluatorLinks;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href={variant === "student" ? "/student" : "/evaluator"} className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-semibold text-white">
              Y
            </span>
            <span className="text-sm font-semibold tracking-tight">YUWA EcoPulse</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm",
                  pathname === link.href ? "bg-accent text-primary" : "text-muted-foreground hover:bg-muted",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-none">{user?.full_name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{user?.role.replaceAll("_", " ")}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                logout();
                router.replace("/");
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-8">{children}</main>
      {variant === "student" && (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-white md:hidden">
          <div className="grid grid-cols-4">
            {studentLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 text-[11px]",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
