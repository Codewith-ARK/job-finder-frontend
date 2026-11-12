export type ExperienceLevel =
  | "Entry"
  | "Junior"
  | "Mid"
  | "Senior"
  | "Lead"
  | "Executive";

export type WorkType = "Remote" | "Hybrid" | "On-site" | "Flexible";

export type OnboardingStepId =
  | "personal"
  | "professional"
  | "academic"
  | "documents";

export type OnboardingStepStatus = "complete" | "next" | "upcoming";

export interface CandidateProfile {
  name: string;
  email: string;
  headline: string;
  summary: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  currentTitle: string;
  experienceLevel: string;
  completion: number;
  stage: string;
}

export interface CandidatePreferences {
  workType: string;
  preferredLocation: string;
  salaryExpectation: string;
  availability: string;
  willingToRelocate: boolean;
}

export interface CandidateExperience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
}

export interface CandidateEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number | null;
  grade: string;
}

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  description: string;
  status: OnboardingStepStatus;
}

export interface CandidateDocument {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
}

export interface ReferralContext {
  agencyName: string;
  referrerName: string;
  label: string;
}

export interface CandidateWorkspaceData {
  profile: CandidateProfile;
  preferences: CandidatePreferences | null;
  experiences: CandidateExperience[];
  education: CandidateEducation[];
  skills: string[];
  onboarding: OnboardingStep[];
  nextSteps: string[];
  documents: CandidateDocument[];
  onboardingComplete: boolean;
  referral: ReferralContext | null;
}

export interface PersonalStepInput {
  phone: string;
  location: string;
  headline: string;
  summary: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

export interface ExperienceInput {
  id?: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  description: string;
}

export interface PreferenceInput {
  workType: WorkType;
  preferredLocation: string;
  salaryExpectation: string;
  availability: string;
  willingToRelocate: boolean;
}

export interface ProfessionalStepInput {
  currentTitle: string;
  experienceLevel: ExperienceLevel;
  skills: string[];
  experiences: ExperienceInput[];
  preferences: PreferenceInput;
}

export interface EducationInput {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number | null;
  grade: string;
}

export interface AcademicStepInput {
  education: EducationInput[];
}
