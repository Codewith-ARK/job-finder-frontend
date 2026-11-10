import { mockRequest } from "../../../lib/mocks/request.ts";
import { readMockSession } from "../../../lib/mocks/state.ts";
import type { Session } from "../../auth/auth.types.ts";
import type {
  AssignmentPatch,
  NewTeamMember,
  StaffCandidate,
  StaffWorkspaceData,
  TeamMember,
} from "../staff.types.ts";

const workspaceByAgency = new Map<string, StaffWorkspaceData>();

const baseCandidates: StaffCandidate[] = [
  {
    id: "candidate-ava-johnson",
    name: "Ava Johnson",
    headline: "Customer support specialist",
    location: "Austin, Texas",
    status: "onboarding",
    onboarding: 62,
    assignedTo: null,
    skills: ["Communication", "CRM", "Customer success"],
    updatedAt: "Today",
  },
  {
    id: "candidate-liam-patel",
    name: "Liam Patel",
    headline: "Data analyst",
    location: "Remote",
    status: "review",
    onboarding: 86,
    assignedTo: "member-marcus-lee",
    skills: ["SQL", "Python", "Reporting"],
    updatedAt: "Yesterday",
  },
  {
    id: "candidate-noah-kim",
    name: "Noah Kim",
    headline: "Product specialist",
    location: "Seattle, Washington",
    status: "interview",
    onboarding: 100,
    assignedTo: "member-olivia-carter",
    skills: ["Product", "Research", "Enablement"],
    updatedAt: "2 days ago",
  },
  {
    id: "candidate-emma-davis",
    name: "Emma Davis",
    headline: "Operations associate",
    location: "Chicago, Illinois",
    status: "ready",
    onboarding: 100,
    assignedTo: null,
    skills: ["Operations", "Coordination", "Process"],
    updatedAt: "3 days ago",
  },
];

const baseMembers: TeamMember[] = [
  {
    id: "member-olivia-carter",
    name: "Olivia Carter",
    role: "employee",
    team: "Candidate success",
    workload: 75,
    active: true,
  },
  {
    id: "member-marcus-lee",
    name: "Marcus Lee",
    role: "employee",
    team: "Data and operations",
    workload: 50,
    active: true,
  },
  {
    id: "member-priya-shah",
    name: "Priya Shah",
    role: "employee",
    team: "Candidate success",
    workload: 80,
    active: true,
  },
  {
    id: "member-daniel-kim",
    name: "Daniel Kim",
    role: "employee",
    team: "Candidate success",
    workload: 25,
    active: true,
  },
];

function ensureStaff(session: Session): StaffWorkspaceData {
  const current = readMockSession();
  if (
    current?.user.id !== session.user.id ||
    current.agency.id !== session.agency.id ||
    current.user.workspace !== "staff"
  ) {
    throw new Error(
      "The staff context changed. Choose the staff perspective again.",
    );
  }

  const existing = workspaceByAgency.get(session.agency.id);
  if (existing) return existing;

  const data: StaffWorkspaceData = {
    session: { user: session.user, agency: session.agency },
    stats: {
      activeCandidates: 48,
      openAssignments: 8,
      onboardingInProgress: 14,
      applicationActivity: 32,
    },
    candidates: structuredClone(baseCandidates),
    teamMembers: structuredClone(baseMembers),
    teams: ["Candidate success", "Data and operations"],
    activity: [
      {
        id: "activity-1",
        title: "Ava completed onboarding",
        detail: "Ready for assignment",
        age: "12 minutes ago",
        tone: "success",
      },
      {
        id: "activity-2",
        title: "Liam's application moved to review",
        detail: "Updated by Marcus Lee",
        age: "1 hour ago",
        tone: "info",
      },
      {
        id: "activity-3",
        title: "Assignment needs attention",
        detail: "Emma Davis is waiting for a team member",
        age: "2 hours ago",
        tone: "warning",
      },
    ],
  };
  workspaceByAgency.set(session.agency.id, data);
  return data;
}

export function getStaffWorkspace(session: Session, signal?: AbortSignal) {
  return mockRequest(() => ensureStaff(session), signal);
}

export function assignCandidate(session: Session, patch: AssignmentPatch) {
  return mockRequest(() => {
    const data = ensureStaff(session);
    const candidate = data.candidates.find(
      (item) => item.id === patch.candidateId,
    );
    const member = data.teamMembers.find(
      (item) => item.id === patch.memberId && item.active,
    );
    if (!candidate)
      throw new Error("That candidate is not available in this agency.");
    if (!member) throw new Error("Choose an active team member.");
    candidate.assignedTo = member.id;
    candidate.status =
      candidate.status === "onboarding" ? "review" : candidate.status;
    candidate.updatedAt = "Just now";
    data.activity.unshift({
      id: `activity-${Date.now()}`,
      title: `${candidate.name} assigned to ${member.name}`,
      detail: "Assignment updated successfully",
      age: "Just now",
      tone: "success",
    });
    return data;
  });
}

export function addTeamMember(session: Session, member: NewTeamMember) {
  return mockRequest(() => {
    const data = ensureStaff(session);
    if (!member.name.trim()) throw new Error("Enter a team member name.");
    if (!data.teams.includes(member.team)) data.teams.push(member.team);
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      ...member,
      workload: 0,
      active: true,
    };
    data.teamMembers.push(newMember);
    data.activity.unshift({
      id: `activity-${Date.now()}`,
      title: `${member.name} added to the team`,
      detail: `${member.team} · invitation simulated`,
      age: "Just now",
      tone: "info",
    });
    return data;
  });
}

export function resetStaffMockState(): void {
  workspaceByAgency.clear();
}
