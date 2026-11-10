import Link from "next/link";
import { Brand } from "@/components/brand";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"
        />
        <Brand light />
        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Job Finder
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
            One shared space for people, opportunities, and progress.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Candidates, agency teams, and platform administrators work from the
            same source of truth — with clear ownership at every step.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-200">
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              Structured onboarding with visible progress
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              One application pipeline for candidates and teams
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              Agency-scoped access enforced by the API
            </li>
          </ul>
        </div>
        <p className="relative text-xs text-slate-400">
          Job Finder prototype · {new Date().getFullYear()}
        </p>
      </div>

      <div className="flex flex-col">
        <header className="flex items-center justify-between px-6 py-5 lg:px-10">
          <div className="lg:hidden">
            <Brand />
          </div>
          <Link
            href="/"
            className="ml-auto text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back to home
          </Link>
        </header>
        <main
          id="main-content"
          className="flex flex-1 items-center justify-center px-6 pb-12 lg:px-10"
        >
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && (
              <div className="mt-6 text-sm text-slate-600">{footer}</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
