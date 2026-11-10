export type JobStatus = "open" | "closed";
export type ApplicationStatus =
  | "submitted"
  | "review"
  | "interview"
  | "offer"
  | "closed";
export type WorkType = "Remote" | "Hybrid" | "On-site";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  workType: WorkType;
  salary: string;
  tags: string[];
  status: JobStatus;
  posted: string;
  description: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  status: ApplicationStatus;
  submittedAt: string;
  nextStep: string;
  updatedAt: string;
}

export interface JobsWorkspaceData {
  jobs: Job[];
  applications: Application[];
}

export interface JobInput {
  title: string;
  company: string;
  location: string;
  workType: WorkType;
  salary: string;
  tags: string[];
  description: string;
}

export type JobPatch = Partial<JobInput & { status: JobStatus }>;
