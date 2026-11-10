"use client";

import {
  Alert,
  Button,
  Card,
  Badge as FlowbiteBadge,
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
  TextInput,
} from "flowbite-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Feedback } from "@/components/ui/feedback";
import { useSession } from "../../auth/auth.hooks.ts";
import { useJobsMutation, useJobsWorkspace } from "../jobs.hooks.ts";
import type { Application, ApplicationStatus, Job } from "../jobs.types.ts";

const statusLabels: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  review: "Under review",
  interview: "Interview",
  offer: "Offer",
  closed: "Closed",
};

export function JobsWorkspace() {
  const { data: session } = useSession();
  const workspace = useJobsWorkspace();
  const mutation = useJobsMutation();
  const [view, setView] = useState<"jobs" | "applications">("jobs");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [status, setStatus] = useState<ApplicationStatus>("review");

  if (workspace.isPending)
    return (
      <Feedback kind="loading" title="Loading opportunities">
        Jobs and application records are loading.
      </Feedback>
    );
  if (workspace.isError)
    return (
      <Feedback
        kind="error"
        title="We couldn't load opportunities"
        action={
          <Button color="dark" onClick={() => workspace.refetch()}>
            Try again
          </Button>
        }
      >
        {workspace.error.message}
      </Feedback>
    );
  if (!workspace.data || !session)
    return (
      <Feedback title="Choose a perspective">
        Return to the perspective chooser to open this workflow.
      </Feedback>
    );

  const data = workspace.data;
  const isStaff = session.user.workspace === "staff";
  const ownApplications = data.applications.filter(
    (item) => item.candidateId === session.user.id,
  );
  const applicationFor = (jobId: string) =>
    data.applications.find(
      (item) => item.jobId === jobId && item.candidateId === session.user.id,
    );
  const apply = () => {
    if (!selectedJob) return;
    mutation.mutate(
      { type: "apply", session, jobId: selectedJob.id },
      { onSuccess: () => setSelectedJob(null) },
    );
  };
  const updateStatus = (application: Application) =>
    mutation.mutate({
      type: "status",
      session,
      applicationId: application.id,
      status,
    });

  return (
    <div className="jobs-workspace">
      <section className="staff-heading">
        <div>
          <p className="eyebrow">
            {isStaff ? "APPLICATION PIPELINE" : "OPPORTUNITIES"}
          </p>
          <h1>
            {isStaff
              ? "Keep applications moving."
              : "Find your next opportunity."}
          </h1>
          <p>
            {isStaff
              ? "Review candidate applications and update the next step for the team."
              : "Explore roles that match your profile and track every application in one place."}
          </p>
        </div>
        <Badge tone="accent">{session.agency.name}</Badge>
      </section>
      {!isStaff && (
        <nav className="staff-tabs" aria-label="Jobs sections">
          <Button color="light" onClick={() => setView("jobs")}>
            Find jobs
          </Button>
          <Button color="light" onClick={() => setView("applications")}>
            My applications{" "}
            <FlowbiteBadge color="gray">{ownApplications.length}</FlowbiteBadge>
          </Button>
        </nav>
      )}
      {mutation.isError && (
        <Alert color="failure">{mutation.error.message}</Alert>
      )}
      {mutation.isSuccess && (
        <Alert color="success">The application workflow was updated.</Alert>
      )}

      {!isStaff && view === "jobs" && (
        <Card>
          <div className="staff-card-heading">
            <div>
              <p className="eyebrow">RECOMMENDED FOR YOU</p>
              <h2>Roles worth a closer look</h2>
            </div>
            <Badge>{data.jobs.length} open roles</Badge>
          </div>
          <div className="staff-filters">
            <TextInput
              placeholder="Search jobs, skills or companies"
              aria-label="Search jobs"
            />
            <Select aria-label="Filter by work type">
              <option>All work types</option>
              <option>Remote</option>
              <option>Hybrid</option>
            </Select>
          </div>
          <div className="job-list">
            {data.jobs.map((job) => {
              const application = applicationFor(job.id);
              return (
                <Card key={job.id}>
                  <div className="staff-card-heading">
                    <div>
                      <h3>{job.title}</h3>
                      <p>
                        {job.company} · {job.location} · {job.workType}
                      </p>
                    </div>
                    <Badge tone={application ? "accent" : "neutral"}>
                      {application
                        ? statusLabels[application.status]
                        : job.salary}
                    </Badge>
                  </div>
                  <div className="skill-list">
                    {job.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                  <p>
                    {job.salary} · Posted {job.posted}
                  </p>
                  <Button
                    color="dark"
                    disabled={!!application}
                    onClick={() => setSelectedJob(job)}
                  >
                    {application ? "Already applied" : "View and apply"}
                  </Button>
                </Card>
              );
            })}
          </div>
        </Card>
      )}

      {!isStaff && view === "applications" && (
        <Card>
          <div className="staff-card-heading">
            <div>
              <p className="eyebrow">YOUR APPLICATIONS</p>
              <h2>Track what happens next</h2>
            </div>
            <Badge>{ownApplications.length} applications</Badge>
          </div>
          <ApplicationTable applications={ownApplications} jobs={data.jobs} />
        </Card>
      )}

      {isStaff && (
        <Card>
          <div className="staff-card-heading">
            <div>
              <p className="eyebrow">SHARED APPLICATIONS</p>
              <h2>Candidate progress</h2>
              <p>
                These updates are visible to the candidate in the shared mock
                record.
              </p>
            </div>
            <Badge>{data.applications.length} applications</Badge>
          </div>
          <ApplicationTable
            applications={data.applications}
            jobs={data.jobs}
            onStatusChange={(application) => {
              setStatus(application.status);
              setSelectedJob(
                data.jobs.find((job) => job.id === application.jobId) ?? null,
              );
            }}
          />
        </Card>
      )}

      <Modal
        show={!!selectedJob && !isStaff}
        onClose={() => setSelectedJob(null)}
      >
        <ModalHeader>{selectedJob?.title}</ModalHeader>
        <ModalBody>
          {selectedJob && (
            <div className="assignment-modal">
              <h3>{selectedJob.company}</h3>
              <p>
                {selectedJob.location} · {selectedJob.workType} ·{" "}
                {selectedJob.salary}
              </p>
              <div className="skill-list">
                {selectedJob.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <Alert color="info">
                This is a simulated application. No external employer will
                receive your information.
              </Alert>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setSelectedJob(null)}>
            Cancel
          </Button>
          <Button color="dark" onClick={apply} disabled={mutation.isPending}>
            {mutation.isPending ? "Applying..." : "Apply now"}
          </Button>
        </ModalFooter>
      </Modal>
      <Modal
        show={!!selectedJob && isStaff}
        onClose={() => setSelectedJob(null)}
      >
        <ModalHeader>Update application status</ModalHeader>
        <ModalBody>
          <LabelledStatus status={status} onChange={setStatus} />
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setSelectedJob(null)}>
            Cancel
          </Button>
          <Button
            color="dark"
            onClick={() => {
              const application = data.applications.find(
                (item) =>
                  data.jobs.find((job) => job.id === item.jobId)?.id ===
                  selectedJob?.id,
              );
              if (application) updateStatus(application);
              setSelectedJob(null);
            }}
          >
            Save status
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

function LabelledStatus({
  status,
  onChange,
}: {
  status: ApplicationStatus;
  onChange: (value: ApplicationStatus) => void;
}) {
  return (
    <label htmlFor="application-status">
      New status
      <Select
        id="application-status"
        value={status}
        onChange={(event) => onChange(event.target.value as ApplicationStatus)}
      >
        {Object.entries(statusLabels).map(([value, label]) => (
          <option value={value} key={value}>
            {label}
          </option>
        ))}
      </Select>
    </label>
  );
}

function ApplicationTable({
  applications,
  jobs,
  onStatusChange,
}: {
  applications: Application[];
  jobs: Job[];
  onStatusChange?: (application: Application) => void;
}) {
  if (applications.length === 0)
    return (
      <Feedback title="No applications yet">
        Apply to an opportunity and the shared progress will appear here.
      </Feedback>
    );
  return (
    <Table hoverable>
      <TableHead>
        <TableHeadCell>Role</TableHeadCell>
        <TableHeadCell>Submitted</TableHeadCell>
        <TableHeadCell>Status</TableHeadCell>
        <TableHeadCell>Next step</TableHeadCell>
        {onStatusChange && <TableHeadCell>Action</TableHeadCell>}
      </TableHead>
      <TableBody>
        {applications.map((application) => {
          const job = jobs.find((item) => item.id === application.jobId);
          return (
            <TableRow key={application.id}>
              <TableCell>
                <strong>{job?.title}</strong>
                <small>{job?.company}</small>
              </TableCell>
              <TableCell>{application.submittedAt}</TableCell>
              <TableCell>
                <Badge
                  tone={
                    application.status === "closed"
                      ? "warning"
                      : application.status === "offer"
                        ? "accent"
                        : "neutral"
                  }
                >
                  {statusLabels[application.status]}
                </Badge>
              </TableCell>
              <TableCell>{application.nextStep}</TableCell>
              {onStatusChange && (
                <TableCell>
                  <Button
                    color="light"
                    size="sm"
                    onClick={() => onStatusChange(application)}
                  >
                    Update
                  </Button>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
