import type { Session } from "../auth/auth.types.ts";

export interface CandidateProfile {
  name: string;
  headline: string;
  location: string;
  email: string;
  skills: string[];
  completion: number;
}

export interface OnboardingStep {
  id: "profile" | "preferences" | "documents";
  title: string;
  description: string;
  status: "complete" | "next" | "upcoming";
}

export interface CandidateWorkspaceData {
  session: Pick<Session, "user" | "agency">;
  profile: CandidateProfile;
  onboarding: OnboardingStep[];
  nextSteps: string[];
}

export type CandidateProfilePatch = Pick<
  CandidateProfile,
  "headline" | "location" | "skills"
>;
