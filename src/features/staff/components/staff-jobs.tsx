"use client";

import {
  Alert,
  Button,
  Card,
  Badge as FlowbiteBadge,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Textarea,
  TextInput,
} from "flowbite-react";
import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Feedback } from "@/components/ui/feedback";
import { IconPlus } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { formatRelative } from "@/lib/format";
import { apiErrorMessage } from "@/lib/http.client";
import { useSession } from "../../auth/auth.hooks";
import { useJobsMutation, useJobsWorkspace } from "../../jobs/jobs.hooks";
import type { Job, WorkType } from "../../jobs/jobs.types";

const emptyForm = {
  title: "",
  company: "",
  location: "",
  workType: "Hybrid" as WorkType,
  salary: "",
  tags: "",
  description: "",
};

export function StaffJobs() {
  const workspace = useJobsWorkspace();
  const mutation = useJobsMutation();
  const { data: session } = useSession();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Job>();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  const isSupervisor = session?.user.role === "supervisor";

  if (workspace.isPending) {
    return (
      <Feedback kind="loading" title="Loading jobs">
        Fetching the agency job board.
      </Feedback>
    );
  }

  if (workspace.isError) {
    return (
      <Feedback
        kind="error"
        title="We could not load the job board"
        action={<Button onClick={() => workspace.refetch()}>Try again</Button>}
      >
        {apiErrorMessage(workspace.error)}
      </Feedback>
    );
  }

  function openCreate() {
    setError(undefined);
    setEditing(undefined);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(job: Job) {
    setError(undefined);
    setEditing(job);
    setForm({
      title: job.title,
      company: job.company,
      location: job.location,
      workType: job.workType,
      salary: job.salary,
      tags: job.tags.join(", "),
      description: job.description,
    });
    setFormOpen(true);
  }

  function submit() {
    setError(undefined);
    setNotice(undefined);
    const payload = {
      title: form.title,
      company: form.company,
      location: form.location,
      workType: form.workType,
      salary: form.salary,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      description: form.description,
    };
    mutation.mutate(
      editing
        ? { type: "update-job", jobId: editing.id, patch: payload }
        : { type: "create", payload },
      {
        onSuccess: () => {
          setFormOpen(false);
          setNotice(editing ? "Role updated." : "Role published.");
        },
        onError: (cause) => setError(apiErrorMessage(cause)),
      },
    );
  }

  function toggleStatus(job: Job) {
    setError(undefined);
    setNotice(undefined);
    mutation.mutate(
      {
        type: "update-job",
        jobId: job.id,
        patch: { status: job.status === "open" ? "closed" : "open" },
      },
      {
        onSuccess: () =>
          setNotice(
            job.status === "open"
              ? `${job.title} closed to new applications.`
              : `${job.title} reopened.`,
          ),
        onError: (cause) => setError(apiErrorMessage(cause)),
      },
    );
  }

  const jobs = workspace.data.jobs;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={isSupervisor ? "Supervisor workspace" : "Agency workspace"}
        title="Job board"
        description={
          isSupervisor
            ? "Publish roles, update details, and control what candidates can apply to."
            : "Roles published by your agency. Only supervisors can change them."
        }
        actions={
          isSupervisor ? (
            <Button color="success" onClick={openCreate}>
              <IconPlus className="mr-2 h-4 w-4" /> New role
            </Button>
          ) : undefined
        }
      />

      {notice && <Alert color="success">{notice}</Alert>}
      {error && (
        <Alert color="failure" role="alert">
          {error}
        </Alert>
      )}

      {jobs.length === 0 ? (
        <EmptyState
          title="No roles published"
          description="Supervisors can publish the first role; candidates in this agency will see it immediately."
          action={
            isSupervisor ? (
              <Button color="success" onClick={openCreate}>
                Publish a role
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell>Role</TableHeadCell>
                <TableHeadCell>Location</TableHeadCell>
                <TableHeadCell>Work type</TableHeadCell>
                <TableHeadCell>Salary</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Posted</TableHeadCell>
                {isSupervisor && <TableHeadCell>Actions</TableHeadCell>}
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">{job.title}</p>
                    <p className="text-xs text-slate-500">{job.company}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {job.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} tone="neutral">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-700">
                      {job.location}
                    </span>
                  </TableCell>
                  <TableCell>
                    <FlowbiteBadge color="gray" className="w-fit">
                      {job.workType}
                    </FlowbiteBadge>
                  </TableCell>
                  <TableCell>
                    <span className="whitespace-nowrap text-sm text-slate-700">
                      {job.salary || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge tone={job.status === "open" ? "accent" : "neutral"}>
                      {job.status === "open" ? "Open" : "Closed"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="whitespace-nowrap text-sm text-slate-600">
                      {formatRelative(job.posted)}
                    </span>
                  </TableCell>
                  {isSupervisor && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="xs"
                          color="light"
                          onClick={() => openEdit(job)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          color={job.status === "open" ? "failure" : "success"}
                          outline
                          onClick={() => toggleStatus(job)}
                          disabled={mutation.isPending}
                        >
                          {job.status === "open" ? "Close" : "Reopen"}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Modal show={formOpen} size="xl" onClose={() => setFormOpen(false)}>
        <ModalHeader>{editing ? "Edit role" : "Publish a role"}</ModalHeader>
        <ModalBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="job-title">Job title</Label>
              </div>
              <TextInput
                id="job-title"
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="job-company">Company</Label>
              </div>
              <TextInput
                id="job-company"
                value={form.company}
                onChange={(event) =>
                  setForm({ ...form, company: event.target.value })
                }
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="job-location">Location</Label>
              </div>
              <TextInput
                id="job-location"
                value={form.location}
                onChange={(event) =>
                  setForm({ ...form, location: event.target.value })
                }
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="job-work-type">Work type</Label>
              </div>
              <Select
                id="job-work-type"
                value={form.workType}
                onChange={(event) =>
                  setForm({ ...form, workType: event.target.value as WorkType })
                }
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </Select>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="job-salary">Salary range</Label>
              </div>
              <TextInput
                id="job-salary"
                placeholder="$90k – $120k"
                value={form.salary}
                onChange={(event) =>
                  setForm({ ...form, salary: event.target.value })
                }
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="job-tags">Tags</Label>
              </div>
              <TextInput
                id="job-tags"
                placeholder="Product, Research"
                value={form.tags}
                onChange={(event) =>
                  setForm({ ...form, tags: event.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <div className="mb-2 block">
                <Label htmlFor="job-description">Description</Label>
              </div>
              <Textarea
                id="job-description"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </div>
          </div>
          {error && (
            <Alert color="failure" className="mt-4" role="alert">
              {error}
            </Alert>
          )}
        </ModalBody>
        <ModalFooter>
          <ActionButton
            color="success"
            onClick={submit}
            disabled={
              mutation.isPending ||
              !form.title.trim() ||
              !form.company.trim() ||
              !form.location.trim()
            }
            pending={mutation.isPending}
          >
            {editing ? "Save changes" : "Publish role"}
          </ActionButton>
          <Button color="light" onClick={() => setFormOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
