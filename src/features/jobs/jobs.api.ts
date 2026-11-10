import { httpClient } from "../../lib/http.client.ts";
import type {
  ApplicationStatus,
  JobInput,
  JobPatch,
  JobsWorkspaceData,
} from "./jobs.types.ts";

export async function getJobsWorkspace(
  signal?: AbortSignal,
): Promise<JobsWorkspaceData> {
  const { data } = await httpClient.get<JobsWorkspaceData>("/jobs/workspace", {
    signal,
  });
  return data;
}

export async function createJob(payload: JobInput): Promise<JobsWorkspaceData> {
  const { data } = await httpClient.post<JobsWorkspaceData>("/jobs", payload);
  return data;
}

export async function updateJob(
  jobId: string,
  patch: JobPatch,
): Promise<JobsWorkspaceData> {
  const { data } = await httpClient.patch<JobsWorkspaceData>(
    `/jobs/${jobId}`,
    patch,
  );
  return data;
}

export async function applyToJob(jobId: string): Promise<JobsWorkspaceData> {
  const { data } = await httpClient.post<JobsWorkspaceData>(
    `/jobs/${jobId}/apply`,
  );
  return data;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
): Promise<JobsWorkspaceData> {
  const { data } = await httpClient.patch<JobsWorkspaceData>(
    `/applications/${applicationId}`,
    { status },
  );
  return data;
}
