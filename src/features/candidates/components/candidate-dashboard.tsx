"use client";

import { Button, Card, Progress } from "flowbite-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Feedback } from "@/components/ui/feedback";
import {
  IconBriefcase,
  IconChecklist,
  IconLayers,
  IconUser,
} from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { formatRelative } from "@/lib/format";
import { ApplicationStatusBadge } from "../../jobs/components/application-status";
import { useJobsWorkspace } from "../../jobs/jobs.hooks";
import { useCandidateWorkspace } from "../candidate.hooks";

const stepTone = {
  complete: "accent",
  next: "warning",
  upcoming: "neutral",
} as const;

export function CandidateDashboard() {
  const workspace = useCandidateWorkspace();
  const jobs = useJobsWorkspace();

  if (workspace.isPending) {
    return (
      <Feedback kind="loading" title="Loading your dashboard">
        Collecting your profile, onboarding, and application activity.
      </Feedback>
    );
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
  const jobsById = new Map((jobs.data?.jobs ?? []).map((job) => [job.id, job]));
  const nextStep = data.onboarding.find((step) => step.status === "next");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Candidate workspace"
        title={`Welcome back, ${data.profile.name.split(" ")[0]}`}
        description="Your profile, onboarding, and applications in one place."
        actions={
          <Button color="green" as={Link} href="/candidate/jobs">
            Browse open roles
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Profile completion"
          value={`${data.profile.completion}%`}
          hint={`${completed} of ${data.onboarding.length} onboarding steps complete`}
          icon={<IconUser />}
        />
        <StatCard
          label="Open roles"
          value={jobs.data?.jobs.length ?? "—"}
          hint="Roles published by your agency"
          icon={<IconBriefcase />}
        />
        <StatCard
          label="Active applications"
          value={jobCount(activeApplications, applications.length)}
          hint="Everything not yet closed"
          icon={<IconLayers />}
        />
        <StatCard
          label="Next step"
          value={
            nextStep
              ? nextStep.id === "documents"
                ? "Documents"
                : nextStep.title
              : "All set"
          }
          hint={
            data.onboarding.every((step) => step.status === "complete")
              ? "Keep an eye on application updates"
              : "Continue onboarding to stand out"
          }
          icon={<IconChecklist />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Onboarding progress
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Complete each step in order so your team can start matching you.
              </p>
            </div>
            <Button
              color="light"
              size="sm"
              as={Link}
              href="/candidate/onboarding"
            >
              Continue
            </Button>
          </div>
          <Progress
            progress={data.profile.completion}
            color="green"
            size="sm"
            className="mt-5"
          />
          <ul className="mt-5 space-y-3">
            {data.onboarding.map((step, index) => (
              <li
                key={step.id}
                className="flex items-start gap-3 rounded-lg border border-slate-200 p-3"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {step.description}
                  </p>
                </div>
                <Badge tone={stepTone[step.status]}>
                  {step.status === "complete"
                    ? "Complete"
                    : step.status === "next"
                      ? "Next"
                      : "Upcoming"}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-base font-semibold text-slate-900">
              Suggested next steps
            </h2>
            <ul className="mt-4 space-y-3">
              {data.nextSteps.map((step) => (
                <li key={step} className="flex gap-3 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {step}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Profile snapshot
              </h2>
              <Button
                color="light"
                size="xs"
                as={Link}
                href="/candidate/profile"
              >
                Edit
              </Button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Headline</dt>
                <dd className="text-right font-medium text-slate-900">
                  {data.profile.headline || "Not set"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Location</dt>
                <dd className="text-right font-medium text-slate-900">
                  {data.profile.location || "Not set"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Work preference</dt>
                <dd className="text-right font-medium text-slate-900">
                  {data.profile.preferredWorkType || "Not set"}
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.profile.skills.length === 0 && (
                <p className="text-xs text-slate-500">No skills added yet.</p>
              )}
              {data.profile.skills.map((skill) => (
                <Badge key={skill} tone="neutral">
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Recent applications
          </h2>
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
          <div className="mt-4">
            <EmptyState
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
          <ul className="mt-4 divide-y divide-slate-200">
            {applications.slice(0, 3).map((application) => {
              const job = jobsById.get(application.jobId);
              return (
                <li
                  key={application.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {job?.title ?? "Role unavailable"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {job?.company ?? "—"} · updated{" "}
                      {formatRelative(application.updatedAt)}
                    </p>
                  </div>
                  <ApplicationStatusBadge status={application.status} />
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function jobCount(active: number, total: number) {
  if (total === 0) return 0;
  return `${active} / ${total}`;
}
