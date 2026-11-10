import { mockRequest } from "../../../lib/mocks/request.ts";
import { readMockSession } from "../../../lib/mocks/state.ts";
import type { Session } from "../../auth/auth.types.ts";
import type {
  Application,
  ApplicationStatus,
  Job,
  JobsWorkspaceData,
} from "../jobs.types.ts";

const workspaceByAgency = new Map<string, JobsWorkspaceData>();

const jobs: Job[] = [
  {
    id: "job-product-designer",
    title: "Product Designer",
    company: "Brightpath",
    location: "San Francisco, CA",
    workType: "Hybrid",
    salary: "$120k – $160k",
    tags: ["Product", "Figma", "Research"],
    status: "open",
    posted: "2 days ago",
  },
  {
    id: "job-senior-researcher",
    title: "Senior UX Researcher",
    company: "Northpeak",
    location: "Remote",
    workType: "Remote",
    salary: "$105k – $140k",
    tags: ["Research", "UX", "Strategy"],
    status: "open",
    posted: "4 days ago",
  },
  {
    id: "job-frontend-engineer",
    title: "Frontend Engineer",
    company: "Vertex",
    location: "New York, NY",
    workType: "Hybrid",
    salary: "$100k – $135k",
    tags: ["React", "TypeScript", "Web"],
    status: "open",
    posted: "5 days ago",
  },
  {
    id: "job-product-manager",
    title: "Product Manager",
    company: "Lumen",
    location: "Remote",
    workType: "Remote",
    salary: "$110k – $150k",
    tags: ["Product", "Roadmaps", "SaaS"],
    status: "open",
    posted: "1 week ago",
  },
];

const applications: Application[] = [
  {
    id: "application-aya-product",
    jobId: "job-product-designer",
    candidateId: "mock-candidate-aya",
    status: "review",
    submittedAt: "Mar 8, 2026",
    nextStep: "Usually responds in 1–2 weeks",
    updatedAt: "2 days ago",
  },
  {
    id: "application-aya-research",
    jobId: "job-senior-researcher",
    candidateId: "mock-candidate-aya",
    status: "interview",
    submittedAt: "Mar 2, 2026",
    nextStep: "Interview scheduled",
    updatedAt: "Yesterday",
  },
  {
    id: "application-liam-frontend",
    jobId: "job-frontend-engineer",
    candidateId: "mock-candidate-liam",
    status: "submitted",
    submittedAt: "Mar 6, 2026",
    nextStep: "The team will review your application",
    updatedAt: "3 days ago",
  },
];

function ensureJobs(session: Session): JobsWorkspaceData {
  const current = readMockSession();
  if (
    current?.user.id !== session.user.id ||
    current.agency.id !== session.agency.id ||
    !["candidate", "staff"].includes(current.user.workspace)
  )
    throw new Error("The jobs context changed. Choose a perspective again.");
  const existing = workspaceByAgency.get(session.agency.id);
  if (existing) return existing;
  const data = {
    session: { user: session.user, agency: session.agency },
    jobs: structuredClone(jobs),
    applications: structuredClone(applications),
  };
  workspaceByAgency.set(session.agency.id, data);
  return data;
}

export function getJobsWorkspace(session: Session, signal?: AbortSignal) {
  return mockRequest(() => ensureJobs(session), signal);
}

export function applyToJob(session: Session, jobId: string) {
  return mockRequest(() => {
    const data = ensureJobs(session);
    const job = data.jobs.find(
      (item) => item.id === jobId && item.status === "open",
    );
    if (!job) throw new Error("That job is no longer available.");
    if (
      data.applications.some(
        (item) => item.jobId === jobId && item.candidateId === session.user.id,
      )
    )
      throw new Error("You have already applied to this job.");
    data.applications.unshift({
      id: `application-${Date.now()}`,
      jobId,
      candidateId: session.user.id,
      status: "submitted",
      submittedAt: "Just now",
      nextStep: "The team will review your application",
      updatedAt: "Just now",
    });
    return data;
  });
}

export function updateApplicationStatus(
  session: Session,
  applicationId: string,
  status: ApplicationStatus,
) {
  return mockRequest(() => {
    const data = ensureJobs(session);
    const application = data.applications.find(
      (item) => item.id === applicationId,
    );
    if (!application)
      throw new Error("That application is no longer available.");
    application.status = status;
    application.updatedAt = "Just now";
    application.nextStep =
      status === "interview"
        ? "Interview scheduled"
        : status === "offer"
          ? "Review your offer"
          : status === "closed"
            ? "Application closed"
            : "The team will review your application";
    return data;
  });
}

export function resetJobsMockState(): void {
  workspaceByAgency.clear();
}
