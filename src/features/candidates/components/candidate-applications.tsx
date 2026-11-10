"use client";

import {
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import Link from "next/link";
import { useMemo } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Feedback } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { formatRelative } from "@/lib/format";
import { ApplicationStatusBadge } from "../../jobs/components/application-status";
import { useJobsWorkspace } from "../../jobs/jobs.hooks";

export function CandidateApplications() {
  const workspace = useJobsWorkspace();

  const jobsById = useMemo(
    () => new Map((workspace.data?.jobs ?? []).map((job) => [job.id, job])),
    [workspace.data],
  );

  if (workspace.isPending) {
    return (
      <Feedback kind="loading" title="Loading applications">
        Fetching your application history.
      </Feedback>
    );
  }

  if (workspace.isError) {
    return (
      <Feedback
        kind="error"
        title="We could not load your applications"
        action={<Button onClick={() => workspace.refetch()}>Try again</Button>}
      >
        {workspace.error instanceof Error ? workspace.error.message : undefined}
      </Feedback>
    );
  }

  const applications = workspace.data.applications;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Candidate workspace"
        title="Applications"
        description="Every application you have submitted, with the latest status from your agency team."
        actions={
          <Button color="green" as={Link} href="/candidate/jobs">
            Browse roles
          </Button>
        }
      />

      {applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Once you apply to a role, it appears here with its current status and next step."
          action={
            <Button color="green" as={Link} href="/candidate/jobs">
              Find a role
            </Button>
          }
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell>Role</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Next step</TableHeadCell>
                <TableHeadCell>Submitted</TableHeadCell>
                <TableHeadCell>Updated</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {applications.map((application) => {
                const job = jobsById.get(application.jobId);
                return (
                  <TableRow key={application.id}>
                    <TableCell>
                      <p className="font-medium text-slate-900">
                        {job?.title ?? "Role unavailable"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {job?.company ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <ApplicationStatusBadge status={application.status} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-700">
                        {application.nextStep || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {formatRelative(application.submittedAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {formatRelative(application.updatedAt)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
