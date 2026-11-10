"use client";

import { Button } from "flowbite-react";
import Link from "next/link";
import { Feedback } from "@/components/ui/feedback";
import {
  IconArrowRight,
  IconBriefcase,
  IconChecklist,
  IconLayers,
  IconSparkle,
  IconUsers,
} from "@/components/ui/icons";
import { MetricStrip } from "@/components/ui/metric-strip";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { formatRelative, initials } from "@/lib/format";
import { apiErrorMessage } from "@/lib/http.client";
import { useSession } from "../../auth/auth.hooks";
import { useStaffWorkspace } from "../staff.hooks";
import type { CandidateStatus } from "../staff.types";

const stages: {
  status: CandidateStatus;
  label: string;
  description: string;
}[] = [
  {
    status: "onboarding",
    label: "Onboarding",
    description: "Building profile",
  },
  { status: "review", label: "Review", description: "Ready to assess" },
  { status: "interview", label: "Interview", description: "In conversation" },
  { status: "ready", label: "Ready", description: "Ready to place" },
];

export function StaffDashboard() {
  const workspace = useStaffWorkspace();
  const { data: session } = useSession();

  if (workspace.isPending) {
    return <PageSkeleton />;
  }

  if (workspace.isError) {
    return (
      <Feedback
        kind="error"
        title="We could not load the agency overview"
        action={<Button onClick={() => workspace.refetch()}>Try again</Button>}
      >
        {apiErrorMessage(workspace.error)}
      </Feedback>
    );
  }

  const data = workspace.data;
  const isSupervisor = session?.user.role === "supervisor";
  const unassigned = data.candidates.filter(
    (candidate) => !candidate.assignedTo,
  );
  const activeMembers = data.teamMembers.filter((member) => member.active);
  const maxWorkload = Math.max(
    ...activeMembers.map((item) => item.workload),
    1,
  );

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={isSupervisor ? "Supervisor workspace" : "Agency workspace"}
        title="Agency overview"
        description={`${session?.agency?.name ?? "Your agency"} — candidates, assignments, and the week ahead.`}
        actions={
          <Button color="green" as={Link} href="/staff/candidates">
            Open candidate directory
          </Button>
        }
      />

      <section className="enter-delayed relative overflow-hidden rounded-2xl bg-forest-deep p-6 text-white sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lime/15 blur-3xl"
        />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime/80">
              Needs attention
            </p>
            <h2 className="display-title mt-3 max-w-md text-[32px] leading-[1.05] sm:text-[38px]">
              {unassigned.length === 0
                ? "Every candidate has an owner."
                : `${unassigned.length} candidate${unassigned.length === 1 ? "" : "s"} need${unassigned.length === 1 ? "s" : ""} an owner.`}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">
              {unassigned.length === 0
                ? "Assignments are up to date. Keep the pipeline moving by reviewing the candidates in conversation."
                : "Unassigned candidates wait longer for feedback. Pick an owner before the next review cycle."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button
                color="light"
                as={Link}
                href="/staff/candidates"
                className="!border-transparent !bg-lime !text-forest-deep hover:!bg-[#e4fa87]"
              >
                {unassigned.length === 0
                  ? "Review pipeline"
                  : "Assign candidates"}
                <IconArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link
                href="/staff/applications"
                className="inline-flex items-center rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/75 transition-colors hover:border-white/30 hover:text-white"
              >
                Open applications
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-4">
            {stages.map((stage) => {
              const count = data.candidates.filter(
                (candidate) => candidate.status === stage.status,
              ).length;
              return (
                <div key={stage.status} className="bg-forest-deep/80 p-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                    {stage.label}
                  </p>
                  <p className="metric-value mt-2 text-2xl font-semibold text-lime">
                    {count}
                  </p>
                  <p className="mt-1 text-[10px] text-white/45">
                    {stage.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <MetricStrip
        metrics={[
          {
            label: "Active candidates",
            value: data.stats.activeCandidates,
            hint: `${data.stats.onboardingInProgress} still onboarding`,
            icon: <IconUsers className="h-3.5 w-3.5" />,
            tone: "accent",
          },
          {
            label: "Open assignments",
            value: data.stats.openAssignments,
            hint: `${unassigned.length} unassigned`,
            icon: <IconChecklist className="h-3.5 w-3.5" />,
          },
          {
            label: "Application activity",
            value: data.stats.applicationActivity,
            hint: "Updates in the last 7 days",
            icon: <IconLayers className="h-3.5 w-3.5" />,
          },
          {
            label: "Team",
            value: activeMembers.length,
            hint: `${data.teams.length} team${data.teams.length === 1 ? "" : "s"} across the agency`,
            icon: <IconBriefcase className="h-3.5 w-3.5" />,
          },
        ]}
      />

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">
              Hiring pipeline
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              A live view of where every candidate sits.
            </p>
          </div>
          <Button color="light" size="sm" as={Link} href="/staff/candidates">
            Manage candidates
          </Button>
        </div>

        <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
          {stages.map((stage) => {
            const candidates = data.candidates.filter(
              (candidate) => candidate.status === stage.status,
            );
            return (
              <div key={stage.status} className="bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">
                    {stage.label}
                  </p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
                    {candidates.length}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {candidates.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-[11px] text-slate-400">
                      Nothing here yet
                    </p>
                  ) : (
                    candidates.slice(0, 3).map((candidate) => (
                      <Link
                        key={candidate.id}
                        href="/staff/candidates"
                        className="block rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
                      >
                        <div className="flex items-center gap-2">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-[9px] font-bold text-emerald-800">
                            {initials(candidate.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-semibold text-ink">
                              {candidate.name}
                            </p>
                            <p className="truncate text-[10px] text-slate-500">
                              {candidate.location || "Location not set"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${candidate.onboarding}%` }}
                          />
                        </div>
                      </Link>
                    ))
                  )}
                  {candidates.length > 3 && (
                    <p className="px-1 pt-1 text-[10px] text-slate-400">
                      +{candidates.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="panel overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-[15px] font-semibold text-ink">
              Recent activity
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              What changed across your agency.
            </p>
          </div>
          {data.activity.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-600">
              Activity appears here as the team works.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {data.activity.slice(0, 6).map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 px-6 py-3.5"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      item.tone === "success"
                        ? "bg-emerald-500"
                        : item.tone === "warning"
                          ? "bg-amber"
                          : "bg-slate-300"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-ink">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {item.detail} · {formatRelative(item.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="panel p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-ink">
                Team workload
              </h2>
              <Link
                href="/staff/team"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                View team
              </Link>
            </div>
            <ul className="mt-4 space-y-4">
              {activeMembers.slice(0, 4).map((member) => (
                <li key={member.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-[9px] font-bold text-emerald-800">
                        {initials(member.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-ink">
                          {member.name}
                        </p>
                        <p className="truncate text-[10px] text-slate-500">
                          {member.team}
                        </p>
                      </div>
                    </div>
                    <span className="metric-value text-[11px] font-semibold text-slate-600">
                      {member.workload}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-forest/80"
                      style={{
                        width: `${Math.min(100, (member.workload / maxWorkload) * 100)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime text-forest-deep">
                <IconSparkle className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-[13px] font-semibold text-ink">
                  {unassigned.length === 0
                    ? "Assignments are healthy"
                    : "Assign before Friday"}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {unassigned.length === 0
                    ? "Every active candidate has an owner. Keep an eye on the review column."
                    : `${unassigned
                        .slice(0, 2)
                        .map((candidate) => candidate.name.split(" ")[0])
                        .join(
                          " and ",
                        )}${unassigned.length > 2 ? ` +${unassigned.length - 2}` : ""} are waiting for an owner.`}
                </p>
                {unassigned.length > 0 && (
                  <Link
                    href="/staff/candidates"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Assign now
                    <IconArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
