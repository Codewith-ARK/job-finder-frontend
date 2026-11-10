import { requireMockMode } from "../../lib/mock-mode.ts";
import type { Session } from "../auth/auth.types.ts";
import type {
  CandidateProfilePatch,
  OnboardingStep,
} from "./candidate.types.ts";
import {
  completeOnboardingStep as completeMockStep,
  getCandidateWorkspace as getMockWorkspace,
  updateCandidateProfile as updateMockProfile,
} from "./mocks/candidate.mock.ts";

export function getCandidateWorkspace(session: Session, signal?: AbortSignal) {
  requireMockMode();
  return getMockWorkspace(session, signal);
}

export function updateCandidateProfile(
  session: Session,
  patch: CandidateProfilePatch,
  signal?: AbortSignal,
) {
  requireMockMode();
  return updateMockProfile(session, patch, signal);
}

export function completeCandidateStep(
  session: Session,
  stepId: OnboardingStep["id"],
) {
  requireMockMode();
  return completeMockStep(session, stepId);
}
