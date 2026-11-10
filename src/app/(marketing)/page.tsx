import Link from "next/link";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import {
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

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Brand />
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/demo"
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block"
            >
              Demo
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Sign in
            </Link>
            <LinkButton color="success" size="sm" href="/register">
              Get started
            </LinkButton>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-emerald-200/50 blur-3xl"
          />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
            <Badge tone="accent">
              For candidates and the teams supporting them
            </Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              A clearer path to the{" "}
              <span className="text-emerald-700">next chapter.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Job Finder brings candidates, agency teams, and platform
              administrators into one workspace. Less chasing updates. More
              decisions made with the full picture.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton color="success" size="lg" href="/register">
                Create your account
              </LinkButton>
              <LinkButton color="light" size="lg" href="/demo">
                Explore the live demo
              </LinkButton>
            </div>
            <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-6 border-t border-slate-200 pt-8 sm:grid-cols-4">
              {[
                ["4", "Seeded perspectives"],
                ["3", "Onboarding stages"],
                ["1", "Application pipeline"],
                ["0", "Mock fallbacks"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-semibold text-slate-900">
                    {value}
                  </dt>
                  <dd className="mt-1 text-xs text-slate-600">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Built around the work
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Everything a placement needs, in one place
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Each role gets the surface it needs — and nothing it doesn't.
              Permissions are part of the product, not an afterthought.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">
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

        <section className="border-t border-slate-200 bg-slate-900 py-16 text-white">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                See it with real data
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-300">
                Sign in as a candidate, employee, supervisor, or platform
                administrator. Every perspective shares the same seeded agency
                data.
              </p>
            </div>
            <LinkButton color="success" size="lg" href="/demo">
              Open the demo
            </LinkButton>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6">
          <Brand />
          <p>Prototype build · FastAPI + Next.js</p>
        </div>
      </footer>
    </div>
  );
}
