export type CandidateStatus =
  | "onboarding"
  | "review"
  | "interview"
  | "ready"
  | string;

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
  email: string;
  role: "employee" | "supervisor";
  team: string;
  workload: number;
  active: boolean;
}

export interface StaffActivity {
  id: string;
  title: string;
  detail: string;
  tone: "success" | "info" | "warning";
  createdAt: string;
}

export interface StaffStats {
  activeCandidates: number;
  openAssignments: number;
  onboardingInProgress: number;
  applicationActivity: number;
}

export interface StaffWorkspaceData {
  stats: StaffStats;
  candidates: StaffCandidate[];
  teamMembers: TeamMember[];
  teams: string[];
  activity: StaffActivity[];
}

export interface NewTeamMember {
  name: string;
  email: string;
  role: "employee" | "supervisor";
  team: string;
}

export interface TeamMemberPatch {
  role?: "employee" | "supervisor";
  team?: string;
  active?: boolean;
}
