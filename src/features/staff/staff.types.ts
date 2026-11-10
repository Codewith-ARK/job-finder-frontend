import type { Session } from "../auth/auth.types.ts";

export type StaffTab = "overview" | "candidates" | "team";
export type CandidateStatus = "onboarding" | "review" | "interview" | "ready";

export interface StaffCandidate {
  id: string;
  name: string;
  headline: string;
  location: string;
  status: CandidateStatus;
  onboarding: number;
  assignedTo: string | null;
  skills: string[];
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: "employee" | "supervisor";
  team: string;
  workload: number;
  active: boolean;
}

export interface StaffActivity {
  id: string;
  title: string;
  detail: string;
  age: string;
  tone: "success" | "info" | "warning";
}

export interface StaffWorkspaceData {
  session: Pick<Session, "user" | "agency">;
  stats: {
    activeCandidates: number;
    openAssignments: number;
    onboardingInProgress: number;
    applicationActivity: number;
  };
  candidates: StaffCandidate[];
  teamMembers: TeamMember[];
  teams: string[];
  activity: StaffActivity[];
}

export interface AssignmentPatch {
  candidateId: string;
  memberId: string;
}

export interface NewTeamMember {
  name: string;
  role: "employee" | "supervisor";
  team: string;
}
