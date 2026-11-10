import type { Session } from "../auth/auth.types.ts";

export type JobStatus = "open" | "closed";
export type ApplicationStatus =
  | "submitted"
  | "review"
  | "interview"
  | "offer"
  | "closed";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  workType: "Remote" | "Hybrid" | "On-site";
  salary: string;
  tags: string[];
  status: JobStatus;
  posted: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  submittedAt: string;
  nextStep: string;
  updatedAt: string;
}

export interface JobsWorkspaceData {
  session: Pick<Session, "user" | "agency">;
  jobs: Job[];
  applications: Application[];
}
