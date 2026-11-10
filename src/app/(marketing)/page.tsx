import Link from "next/link";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import {
  IconArrowUpRight,
  IconBriefcase,
  IconChecklist,
  IconShield,
  IconUsers,
} from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";

const features = [
  {
    icon: IconChecklist,
    title: "Guided onboarding",
    body: "Candidates complete profile, preferences, and documents in order — with completion that both sides can see.",
  },
  {
    icon: IconBriefcase,
    title: "One shared pipeline",
    body: "Roles, applications, and status updates stay in sync for candidates and the agency team working with them.",
  },
  {
    icon: IconUsers,
    title: "Agency-scoped teams",
    body: "Supervisors assign candidates and manage their team. Employees see exactly the records their agency owns.",
  },
  {
    icon: IconShield,
    title: "Server-enforced access",
    body: "Sessions, roles, record ownership, and agency boundaries are validated by the API on every request.",
  },
];

const pipeline = [
  { name: "Aya Khan", role: "Product designer", status: "Interview" },
  { name: "Noah Kim", role: "Product specialist", status: "Offer" },
  { name: "Liam Patel", role: "Data analyst", status: "Review" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Brand />
          <nav className="flex items-center gap-2 sm:gap-5">
            <Link
              href="/demo"
              className="hidden text-sm font-medium text-slate-600 transition-colors hover:text-ink sm:block"
            >
              Demo
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-ink"
            >
              Sign in
            </Link>
            <LinkButton color="green" size="sm" href="/register">
              Get started
            </LinkButton>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="relative overflow-hidden border-b border-slate-200">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-emerald-200/35 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-48 left-1/3 h-[26rem] w-[26rem] rounded-full bg-lime/30 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-24">
            <div className="enter">
              <Badge tone="accent">Hiring, without the noise</Badge>
              <h1 className="display-title mt-6 max-w-2xl text-[52px] leading-[0.98] text-ink sm:text-[66px] lg:text-[72px]">
                The whole picture, from first hello to{" "}
                <span className="italic text-emerald-700">offer.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
                Job Finder gives candidates, agency teams, and platform admins
                one shared workspace — with less chasing, fewer blind spots, and
                every update in the right hands.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <LinkButton color="green" size="lg" href="/register">
                  Create your account
                </LinkButton>
                <LinkButton color="light" size="lg" href="/demo">
                  Explore the live demo
                </LinkButton>
              </div>
              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200 pt-6">
                {[
                  ["4", "Seeded roles"],
                  ["3", "Onboarding stages"],
                  ["1", "Shared pipeline"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="metric-value text-2xl font-semibold text-ink">
                      {value}
                    </dt>
                    <dd className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">
                      {label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="enter-delayed relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-emerald-200/40 via-transparent to-lime/30 blur-2xl"
              />
              <div className="relative overflow-hidden rounded-2xl border border-forest-deep/20 bg-[#0a241d] p-2.5 shadow-[0_30px_60px_-30px_rgba(7,46,37,0.55)]">
                <div className="overflow-hidden rounded-xl bg-canvas">
                  <div className="flex items-center gap-2 border-b border-slate-200 bg-surface px-4 py-2.5">
                    <span className="h-2 w-2 rounded-full bg-coral/70" />
                    <span className="h-2 w-2 rounded-full bg-amber/80" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                    <span className="ml-3 truncate rounded bg-slate-100 px-3 py-1 font-mono text-[9px] text-slate-500">
                      app.jobfinder.example/candidate
                    </span>
                  </div>
                  <div className="grid grid-cols-[104px_1fr]">
                    <div className="border-r border-white/10 bg-forest-deep p-3 text-white">
                      <div className="flex items-center gap-1.5">
                        <span className="grid h-5 w-5 place-items-center rounded-[6px] bg-lime text-[10px] font-bold text-forest-deep">
                          ↗
                        </span>
                        <span className="text-[9px] font-semibold">
                          Job Finder
                        </span>
                      </div>
                      <div className="mt-4 space-y-1">
                        <div className="rounded bg-lime px-2 py-1 text-[8px] font-semibold text-forest-deep">
                          Overview
                        </div>
                        {[
                          "Profile",
                          "Onboarding",
                          "Open roles",
                          "Applications",
                        ].map((item) => (
                          <div
                            key={item}
                            className="px-2 py-1 text-[8px] text-white/50"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-[7px] uppercase tracking-[0.16em] text-slate-400">
                          Candidate workspace
                        </p>
                        <span className="rounded-full bg-lime px-2 py-0.5 text-[7px] font-semibold text-forest-deep">
                          70% profile
                        </span>
                      </div>
                      <h2 className="display-title mt-2 text-[22px] leading-none text-ink">
                        Welcome back, Aya.
                      </h2>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {[
                          ["Open roles", "4"],
                          ["Applied", "4"],
                          ["Interview", "1"],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-lg border border-slate-200 bg-surface p-2"
                          >
                            <p className="font-mono text-[6px] uppercase tracking-[0.12em] text-slate-400">
                              {label}
                            </p>
                            <p className="metric-value mt-1 text-base font-semibold text-ink">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2.5 rounded-lg border border-slate-200 bg-surface p-2.5">
                        <p className="text-[8px] font-semibold text-ink">
                          Application pipeline
                        </p>
                        <div className="mt-2 space-y-1.5">
                          {pipeline.map((row) => (
                            <div
                              key={row.name}
                              className="flex items-center justify-between gap-2"
                            >
                              <div className="flex min-w-0 items-center gap-1.5">
                                <span className="grid h-4 w-4 place-items-center rounded-full bg-slate-100 text-[6px] font-bold text-emerald-800">
                                  {row.name
                                    .split(" ")
                                    .map((part) => part[0])
                                    .join("")}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-[7px] font-medium text-ink">
                                    {row.name}
                                  </p>
                                  <p className="truncate text-[6px] text-slate-400">
                                    {row.role}
                                  </p>
                                </div>
                              </div>
                              <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[6px] font-semibold text-emerald-800">
                                {row.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-3 rounded-xl border border-slate-200 bg-surface px-4 py-3 shadow-lg sm:-left-6">
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-slate-400">
                  Next best action
                </p>
                <p className="mt-1 text-xs font-semibold text-ink">
                  Add your documents
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">Built around the work</p>
              <h2 className="display-title mt-3 text-[38px] leading-[1.04] text-ink sm:text-[44px]">
                Everything a placement needs, in one place.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-600">
              Each role gets the surface it needs — and nothing it doesn't.
              Permissions are part of the product, not an afterthought.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="panel panel-hover group p-6"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-emerald-700 transition-colors group-hover:bg-lime group-hover:text-forest-deep">
                      <Icon className="h-5 w-5" />
                    </span>
                    <IconArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-emerald-700" />
                  </div>
                  <h3 className="mt-5 text-[15px] font-semibold text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {feature.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="relative overflow-hidden bg-forest-deep py-16 text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime/15 blur-3xl"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime/80">
                See it with real data
              </p>
              <h2 className="display-title mt-3 text-[34px] leading-[1.04]">
                Four perspectives. One source of truth.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
                Sign in as a candidate, employee, supervisor, or platform
                administrator. Every perspective shares the same seeded agency
                data.
              </p>
            </div>
            <LinkButton color="green" size="lg" href="/demo">
              Open the demo
            </LinkButton>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-canvas">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
          <Brand />
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400">
            Prototype build · FastAPI + Next.js
          </p>
        </div>
      </footer>
    </div>
  );
}
