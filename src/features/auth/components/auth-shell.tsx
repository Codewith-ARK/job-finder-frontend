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
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden flex-col overflow-hidden bg-forest-deep p-12 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-lime/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-lime/30 to-transparent"
        />
        <Brand light />
        <div className="relative my-auto max-w-md py-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-lime/80">
            Job Finder
          </p>
          <h2 className="display-title mt-5 text-[44px] leading-[1.02]">
            One shared space for people, opportunities, and progress.
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-white/60">
            Candidates, agency teams, and platform administrators work from the
            same source of truth — with clear ownership at every step.
          </p>
          <ul className="mt-9 space-y-3 text-[13px] text-white/75">
            {[
              "Structured onboarding with visible progress",
              "One application pipeline for candidates and teams",
              "Agency-scoped access enforced by the API",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col">
        <header className="flex items-center justify-between px-6 py-5 lg:px-10">
          <div className="lg:hidden">
            <Brand />
          </div>
          <Link
            href="/"
            className="ml-auto text-sm font-medium text-slate-600 transition-colors hover:text-ink"
          >
            ← Back to home
          </Link>
        </header>
        <main
          id="main-content"
          className="flex flex-1 items-center justify-center px-6 pb-12 lg:px-10"
        >
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-lime ring-4 ring-lime/25"
              />
              <p className="eyebrow">Secure sign in</p>
            </div>
            <h1 className="display-title text-[40px] leading-[1.02] text-ink">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {subtitle}
            </p>
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
