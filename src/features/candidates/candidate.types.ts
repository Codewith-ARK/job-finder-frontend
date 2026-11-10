export interface CandidateProfile {
  name: string;
  email: string;
  headline: string;
  location: string;
  skills: string[];
  completion: number;
  preferredWorkType: string;
  preferredLocation: string;
  salaryExpectation: string;
}

export interface OnboardingStep {
  id: "profile" | "preferences" | "documents";
  title: string;
  description: string;
  status: "complete" | "next" | "upcoming";
}

export interface CandidateDocument {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
}

export interface CandidateWorkspaceData {
  profile: CandidateProfile;
  onboarding: OnboardingStep[];
  nextSteps: string[];
  documents: CandidateDocument[];
}

export type CandidateProfilePatch = Pick<
  CandidateProfile,
  "headline" | "location" | "skills"
>;

export type CandidatePreferencesPatch = Pick<
  CandidateProfile,
  "preferredWorkType" | "preferredLocation" | "salaryExpectation"
>;
