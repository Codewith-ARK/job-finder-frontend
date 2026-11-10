import { requireMockMode } from "../../lib/mock-mode.ts";
import type { Session } from "../auth/auth.types.ts";
import type { ApplicationStatus } from "./jobs.types.ts";
import {
  applyToJob as applyMockToJob,
  getJobsWorkspace as getMockWorkspace,
  updateApplicationStatus as updateMockApplicationStatus,
} from "./mocks/jobs.mock.ts";

export function getJobsWorkspace(session: Session, signal?: AbortSignal) {
  requireMockMode();
  return getMockWorkspace(session, signal);
}

export function applyToJob(session: Session, jobId: string) {
  requireMockMode();
  return applyMockToJob(session, jobId);
}

export function updateApplicationStatus(
  session: Session,
  applicationId: string,
  status: ApplicationStatus,
) {
  requireMockMode();
  return updateMockApplicationStatus(session, applicationId, status);
}
