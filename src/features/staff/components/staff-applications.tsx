"use client";

import {
  Alert,
  Button,
  Card,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
} from "flowbite-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Feedback } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { formatRelative } from "@/lib/format";
import { apiErrorMessage } from "@/lib/http.client";
import { applicationStatusOptions } from "../../jobs/components/application-status";
import { useJobsMutation, useJobsWorkspace } from "../../jobs/jobs.hooks";
import type { ApplicationStatus } from "../../jobs/jobs.types";

export function StaffApplications() {
  const workspace = useJobsWorkspace();
  const mutation = useJobsMutation();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  const jobsById = useMemo(
    () => new Map((workspace.data?.jobs ?? []).map((job) => [job.id, job])),
    [workspace.data],
  );

  const applications = useMemo(() => {
    const list = workspace.data?.applications ?? [];
    return list.filter((application) => {
      const job = jobsById.get(application.jobId);
      const matchesQuery =
        `${application.candidateName} ${job?.title ?? ""} ${job?.company ?? ""}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
      const matchesStatus = status === "all" || application.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [workspace.data, jobsById, query, status]);

  if (workspace.isPending) {
    return (
      <Feedback kind="loading" title="Loading applications">
        Fetching the agency application pipeline.
      </Feedback>
    );
  }

  if (workspace.isError) {
    return (
      <Feedback
        kind="error"
        title="We could not load applications"
        action={<Button onClick={() => workspace.refetch()}>Try again</Button>}
      >
        {apiErrorMessage(workspace.error)}
      </Feedback>
    );
  }

  function update(applicationId: string, next: ApplicationStatus) {
    setError(undefined);
    setNotice(undefined);
    mutation.mutate(
      { type: "status", applicationId, status: next },
      {
        onSuccess: () => setNotice("Application status updated."),
        onError: (cause) => setError(apiErrorMessage(cause)),
      },
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Agency workspace"
        title="Applications"
        description="The shared pipeline. Status changes are visible to the candidate immediately."
      />

      {notice && <Alert color="green">{notice}</Alert>}
      {error && (
        <Alert color="failure" role="alert">
          {error}
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <TextInput
            placeholder="Search by candidate, role, or company"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search applications"
          />
        </div>
        <div className="sm:w-52">
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {applicationStatusOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No applications match this view"
          description="Applications appear as candidates apply to published roles."
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell>Candidate</TableHeadCell>
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
                        {application.candidateName}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-700">
                        {job?.title ?? "Role unavailable"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {job?.company ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          sizing="sm"
                          value={application.status}
                          onChange={(event) =>
                            update(
                              application.id,
                              event.target.value as ApplicationStatus,
                            )
                          }
                          disabled={mutation.isPending}
                          aria-label={`Status for ${application.candidateName}`}
                        >
                          {applicationStatusOptions.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-700">
                        {application.nextStep || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="whitespace-nowrap text-sm text-slate-600">
                        {formatRelative(application.submittedAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="whitespace-nowrap text-sm text-slate-600">
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
