"use client";

import {
  Alert,
  Button,
  Card,
  Badge as FlowbiteBadge,
  Select,
  TextInput,
} from "flowbite-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Feedback } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { formatRelative } from "@/lib/format";
import { apiErrorMessage } from "@/lib/http.client";
import { ApplicationStatusBadge } from "../../jobs/components/application-status";
import { useJobsMutation, useJobsWorkspace } from "../../jobs/jobs.hooks";

export function CandidateJobs() {
  const workspace = useJobsWorkspace();
  const mutation = useJobsMutation();
  const [query, setQuery] = useState("");
  const [workType, setWorkType] = useState("all");
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();

  const applicationsByJob = useMemo(
    () =>
      new Map(
        (workspace.data?.applications ?? []).map((item) => [item.jobId, item]),
      ),
    [workspace.data],
  );

  const jobs = useMemo(() => {
    const list = workspace.data?.jobs ?? [];
    return list.filter((job) => {
      const matchesQuery = `${job.title} ${job.company} ${job.tags.join(" ")}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesType = workType === "all" || job.workType === workType;
      return matchesQuery && matchesType;
    });
  }, [workspace.data, query, workType]);

  if (workspace.isPending) {
    return (
      <Feedback kind="loading" title="Loading open roles">
        Fetching the roles published to your agency.
      </Feedback>
    );
  }

  if (workspace.isError) {
    return (
      <Feedback
        kind="error"
        title="We could not load open roles"
        action={<Button onClick={() => workspace.refetch()}>Try again</Button>}
      >
        {apiErrorMessage(workspace.error)}
      </Feedback>
    );
  }

  function apply(jobId: string, title: string) {
    setNotice(undefined);
    setError(undefined);
    mutation.mutate(
      { type: "apply", jobId },
      {
        onSuccess: () => setNotice(`Application submitted for ${title}.`),
        onError: (cause) => setError(apiErrorMessage(cause)),
      },
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Candidate workspace"
        title="Open roles"
        description="Roles published by your agency. Apply once — updates appear in your applications."
        actions={
          <Button color="light" as={Link} href="/candidate/applications">
            My applications
          </Button>
        }
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
            placeholder="Search by title, company, or tag"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search roles"
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={workType}
            onChange={(event) => setWorkType(event.target.value)}
            aria-label="Filter by work type"
          >
            <option value="all">All work types</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </Select>
        </div>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          title="No roles match this view"
          description="Try a different search or work type. New roles appear here as soon as your agency publishes them."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {jobs.map((job) => {
            const application = applicationsByJob.get(job.id);
            return (
              <Card key={job.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-slate-900">
                      {job.title}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {job.company} · {job.location}
                    </p>
                  </div>
                  <FlowbiteBadge color="gray" className="w-fit shrink-0">
                    {job.workType}
                  </FlowbiteBadge>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {job.description || "No description provided."}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.tags.map((tag) => (
                    <Badge key={tag} tone="neutral">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {job.salary || "Salary not listed"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Posted {formatRelative(job.posted)}
                    </p>
                  </div>
                  {application ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Applied</span>
                      <ApplicationStatusBadge status={application.status} />
                    </div>
                  ) : (
                    <ActionButton
                      color="green"
                      size="sm"
                      onClick={() => apply(job.id, job.title)}
                      disabled={mutation.isPending}
                      pending={
                        mutation.isPending &&
                        mutation.variables?.type === "apply" &&
                        mutation.variables.jobId === job.id
                      }
                    >
                      Apply
                    </ActionButton>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
