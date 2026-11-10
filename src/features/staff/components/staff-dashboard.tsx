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
  IconUsers,
} from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { formatRelative } from "@/lib/format";
import { apiErrorMessage } from "@/lib/http.client";
import { useSession } from "../../auth/auth.hooks";
import { useStaffWorkspace } from "../staff.hooks";
import type { CandidateStatus } from "../staff.types";

const stageTone: Record<
  string,
  "neutral" | "accent" | "warning" | "danger" | "info"
> = {
  onboarding: "warning",
  review: "info",
  interview: "accent",
  ready: "accent",
};

const stageLabel: Record<string, string> = {
  onboarding: "Onboarding",
  review: "Under review",
  interview: "Interview",
  ready: "Ready",
};

export function StaffDashboard() {
  const workspace = useStaffWorkspace();
  const { data: session } = useSession();

  if (workspace.isPending) {
    return (
      <Feedback kind="loading" title="Loading the agency overview">
        Collecting candidates, assignments, and activity.
      </Feedback>
    );
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
  const onboarding = data.candidates.filter(
    (candidate) => candidate.status === "onboarding",
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={isSupervisor ? "Supervisor workspace" : "Agency workspace"}
        title="Agency overview"
        description={`${session?.agency?.name ?? "Your agency"} · candidates, assignments, and application activity.`}
        actions={
          <Button color="green" as={Link} href="/staff/candidates">
            Open candidate directory
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active candidates"
          value={data.stats.activeCandidates}
          hint={`${onboarding.length} still onboarding`}
          icon={<IconUsers />}
        />
        <StatCard
          label="Open assignments"
          value={data.stats.openAssignments}
          hint={`${unassigned.length} candidate${unassigned.length === 1 ? "" : "s"} unassigned`}
          icon={<IconChecklist />}
        />
        <StatCard
          label="Application activity"
          value={data.stats.applicationActivity}
          hint="Updates in the last 7 days"
          icon={<IconLayers />}
        />
        <StatCard
          label="Team members"
          value={data.teamMembers.filter((member) => member.active).length}
          hint={`${data.teams.length} team${data.teams.length === 1 ? "" : "s"}`}
          icon={<IconBriefcase />}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Onboarding in progress
            </h2>
            <Button color="light" size="sm" as={Link} href="/staff/candidates">
              View directory
            </Button>
          </div>
          {onboarding.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-600">
              No candidates are currently onboarding.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {onboarding.map((candidate) => (
                <li key={candidate.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {candidate.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {candidate.headline} · {candidate.location}
                      </p>
                    </div>
                    <Badge tone={stageTone[candidate.status] ?? "neutral"}>
                      {stageLabel[candidate.status] ?? candidate.status}
                    </Badge>
                  </div>
                  <Progress
                    progress={candidate.onboarding}
                    color="green"
                    size="sm"
                    className="mt-2"
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">
            Recent activity
          </h2>
          {data.activity.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              Activity appears here as the team works.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {data.activity.slice(0, 6).map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      item.tone === "success"
                        ? "bg-emerald-500"
                        : item.tone === "warning"
                          ? "bg-amber-500"
                          : "bg-slate-300"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.detail} · {formatRelative(item.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Assignments that need attention
          </h2>
          {isSupervisor && (
            <Button color="light" size="sm" as={Link} href="/staff/candidates">
              Assign candidates
            </Button>
          )}
        </div>
        {unassigned.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Every candidate has an owner"
              description="Assignments are up to date. Reassignments stay visible in activity."
            />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200">
            {unassigned.map((candidate) => (
              <li
                key={candidate.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {candidate.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {candidate.headline} · updated{" "}
                    {formatRelative(candidate.updatedAt)}
                  </p>
                </div>
                <Badge
                  tone={
                    stageTone[candidate.status as CandidateStatus] ?? "neutral"
                  }
                >
                  {stageLabel[candidate.status] ?? candidate.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
