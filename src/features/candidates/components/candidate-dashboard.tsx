"use client";

import { Button } from "flowbite-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Feedback } from "@/components/ui/feedback";
import {
  IconArrowRight,
  IconBriefcase,
  IconCheck,
  IconChecklist,
  IconClock,
  IconLayers,
  IconMapPin,
  IconSparkle,
  IconUser,
} from "@/components/ui/icons";
import { MetricStrip } from "@/components/ui/metric-strip";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { formatRelative, initials } from "@/lib/format";
import { ApplicationStatusBadge } from "../../jobs/components/application-status";
import { useJobsWorkspace } from "../../jobs/jobs.hooks";
import type { ApplicationStatus } from "../../jobs/jobs.types";
import { useCandidateWorkspace } from "../candidate.hooks";

const stepTone = {
  complete: "accent",
  next: "warning",
  upcoming: "neutral",
} as const;

const pipelineStages: {
  status: ApplicationStatus;
  label: string;
  className: string;
}[] = [
  { status: "submitted", label: "Submitted", className: "bg-slate-300" },
  { status: "review", label: "In review", className: "bg-amber" },
  { status: "interview", label: "Interview", className: "bg-emerald-400" },
  { status: "offer", label: "Offer", className: "bg-lime" },
];

export function CandidateDashboard() {
  const workspace = useCandidateWorkspace();
  const jobs = useJobsWorkspace();

  if (workspace.isPending) {
    return <PageSkeleton />;
  }

  if (workspace.isError) {
    return (
      <Feedback
        kind="error"
        title="We could not load your dashboard"
        action={<Button onClick={() => workspace.refetch()}>Try again</Button>}
      >
        {workspace.error instanceof Error ? workspace.error.message : undefined}
      </Feedback>
    );
  }

  const data = workspace.data;
  const completed = data.onboarding.filter(
    (step) => step.status === "complete",
  ).length;
  const applications = jobs.data?.applications ?? [];
  const activeApplications = applications.filter(
    (item) => item.status !== "closed",
  ).length;
  const inConversation = applications.filter(
    (item) => item.status === "interview" || item.status === "offer",
  ).length;
  const jobsById = new Map((jobs.data?.jobs ?? []).map((job) => [job.id, job]));
  const nextStep = data.onboarding.find((step) => step.status === "next");
  const firstName = data.profile.name.split(" ")[0];
  const allComplete = data.onboarding.every(
    (step) => step.status === "complete",
  );

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Candidate workspace"
        title={`Welcome back, ${firstName}.`}
        description="Your profile, pipeline, and next move — in one place."
        actions={
          <>
            <Button color="light" as={Link} href="/candidate/profile">
              Edit profile
            </Button>
            <Button color="green" as={Link} href="/candidate/jobs">
              Browse open roles
            </Button>
          </>
        }
      />

      <section className="enter-delayed relative overflow-hidden rounded-2xl bg-forest-deep p-6 text-white sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-lime/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 h-px w-[70%] bg-gradient-to-r from-transparent via-lime/40 to-transparent"
        />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime/80">
              {allComplete ? "Profile ready" : "Next best action"}
            </p>
            <h2 className="display-title mt-3 max-w-xl text-[32px] leading-[1.05] sm:text-[40px]">
              {allComplete
                ? "You’re ready for the right role."
                : (nextStep?.title ?? "Finish your profile.")}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/65">
              {allComplete
                ? "Your profile and documents are in order. Keep an eye on your applications or explore the roles your agency has published."
                : (nextStep?.description ??
                  "Complete the remaining onboarding steps so your team can match you with the right opportunities.")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button
                color="light"
                as={Link}
                href={allComplete ? "/candidate/jobs" : "/candidate/onboarding"}
                className="!border-transparent !bg-lime !text-forest-deep hover:!bg-[#e4fa87] focus:!ring-lime/30"
              >
                {allComplete ? "Explore open roles" : "Continue onboarding"}
                <IconArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link
                href="/candidate/profile"
                className="inline-flex items-center rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/75 transition-colors hover:border-white/30 hover:text-white"
              >
                Review profile
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative grid h-36 w-36 place-items-center sm:h-44 sm:w-44">
              <svg
                viewBox="0 0 120 120"
                aria-hidden="true"
                className="h-full w-full -rotate-90"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="7"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#d8f36c"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${(data.profile.completion / 100) * 326.7} 326.7`}
                />
              </svg>
              <div className="absolute text-center">
                <p className="metric-value text-4xl font-semibold text-white">
                  {data.profile.completion}%
                </p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">
                  Profile strength
                </p>
                <p className="mt-2 text-[11px] text-white/60">
                  {completed} of {data.onboarding.length} steps
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MetricStrip
        metrics={[
          {
            label: "Profile strength",
            value: `${data.profile.completion}%`,
            hint: `${completed} of ${data.onboarding.length} onboarding steps complete`,
            icon: <IconUser className="h-3.5 w-3.5" />,
            tone: "accent",
          },
          {
            label: "Open roles",
            value: jobs.data?.jobs.length ?? "—",
            hint: "Published by your agency",
            icon: <IconBriefcase className="h-3.5 w-3.5" />,
          },
          {
            label: "Active applications",
            value: activeApplications,
            hint:
              applications.length === 0
                ? "Apply to start your pipeline"
                : `${applications.length} total applications`,
            icon: <IconLayers className="h-3.5 w-3.5" />,
          },
          {
            label: "In conversation",
            value: inConversation,
            hint: "Interviews and offers",
            icon: <IconChecklist className="h-3.5 w-3.5" />,
          },
        ]}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="panel overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">
                Application pipeline
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Where every active role stands right now.
              </p>
            </div>
            <Button
              color="light"
              size="sm"
              as={Link}
              href="/candidate/applications"
            >
              View all
            </Button>
          </div>

          {applications.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<IconBriefcase className="h-5 w-5" />}
                title="No applications yet"
                description="Browse the roles your agency has published and apply when something fits."
                action={
                  <Button color="green" as={Link} href="/candidate/jobs">
                    Browse open roles
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-4">
                {pipelineStages.map((stage) => {
                  const count = applications.filter(
                    (application) => application.status === stage.status,
                  ).length;
                  return (
                    <div key={stage.status} className="bg-surface px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${stage.className}`}
                        />
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">
                          {stage.label}
                        </p>
                      </div>
                      <p className="metric-value mt-2 text-xl font-semibold text-ink">
                        {count}
                      </p>
                    </div>
                  );
                })}
              </div>
              <ul className="divide-y divide-slate-200">
                {applications.slice(0, 4).map((application) => {
                  const job = jobsById.get(application.jobId);
                  return (
                    <li
                      key={application.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-slate-50/70"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 font-mono text-[11px] font-semibold text-emerald-800">
                          {(job?.company ?? "—").slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            {job?.title ?? "Role unavailable"}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {job?.company ?? "—"} · updated{" "}
                            {formatRelative(application.updatedAt)}
                          </p>
                        </div>
                      </div>
                      <ApplicationStatusBadge status={application.status} />
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>

        <div className="space-y-6">
          <section className="panel p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-forest text-sm font-semibold text-lime">
                  {initials(data.profile.name)}
                </span>
                <div>
                  <h2 className="text-[15px] font-semibold text-ink">
                    {data.profile.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {data.profile.headline || "Add a headline"}
                  </p>
                </div>
              </div>
              <Link
                href="/candidate/profile"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Edit
              </Link>
            </div>
            <dl className="mt-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <IconMapPin className="h-4 w-4 text-slate-400" />
                <dt className="sr-only">Location</dt>
                <dd>{data.profile.location || "Location not set"}</dd>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <IconBriefcase className="h-4 w-4 text-slate-400" />
                <dt className="sr-only">Work preference</dt>
                <dd>{data.profile.preferredWorkType || "Not set"}</dd>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <IconClock className="h-4 w-4 text-slate-400" />
                <dt className="sr-only">Salary expectation</dt>
                <dd>{data.profile.salaryExpectation || "Not set"}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {data.profile.skills.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Add skills to improve matching.
                </p>
              ) : (
                data.profile.skills.map((skill) => (
                  <Badge key={skill} tone="neutral">
                    {skill}
                  </Badge>
                ))
              )}
            </div>
          </section>

          <section className="panel p-6">
            <h2 className="text-[15px] font-semibold text-ink">
              Suggested next steps
            </h2>
            <ul className="mt-4 space-y-3">
              {data.nextSteps.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-3 text-sm leading-relaxed text-slate-600"
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-100 font-mono text-[9px] font-semibold text-emerald-800">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">
              Onboarding checklist
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Each step unlocks the next. Your team sees progress as you go.
            </p>
          </div>
          <Button
            color="light"
            size="sm"
            as={Link}
            href="/candidate/onboarding"
          >
            Open checklist
          </Button>
        </div>
        <ol className="grid gap-px bg-slate-200 md:grid-cols-3">
          {data.onboarding.map((step, index) => (
            <li key={step.id} className="bg-surface p-5">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${
                    step.status === "complete"
                      ? "bg-forest text-lime"
                      : step.status === "next"
                        ? "bg-lime text-forest-deep"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {step.status === "complete" ? (
                    <IconCheck className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <Badge tone={stepTone[step.status]}>
                  {step.status === "complete"
                    ? "Complete"
                    : step.status === "next"
                      ? "Next"
                      : "Upcoming"}
                </Badge>
              </div>
              <p className="mt-4 text-sm font-semibold text-ink">
                {step.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <IconSparkle className="h-4 w-4 text-emerald-700" />
        Tip: keep your profile current — agencies see updates as soon as you
        save them.
      </div>
    </div>
  );
}
