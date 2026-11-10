import { mockRequest } from "../../../lib/mocks/request.ts";
import { readMockSession } from "../../../lib/mocks/state.ts";
import type { Session } from "../../auth/auth.types.ts";
import type {
  CandidateProfilePatch,
  CandidateWorkspaceData,
  OnboardingStep,
} from "../candidate.types.ts";

const workspaceByUser = new Map<string, CandidateWorkspaceData>();

function ensureCandidate(session: Session): CandidateWorkspaceData {
  const current = readMockSession();
  if (
    current?.user.id !== session.user.id ||
    current.agency.id !== session.agency.id ||
    current.user.workspace !== "candidate"
  ) {
    throw new Error(
      "The candidate context changed. Choose the candidate perspective again.",
    );
  }

  const existing = workspaceByUser.get(session.user.id);
  if (existing && existing.session.agency.id === session.agency.id)
    return existing;

  const data: CandidateWorkspaceData = {
    session: {
      user: session.user,
      agency: session.agency,
    },
    profile: {
      name: session.user.name,
      headline: "Aspiring product designer",
      location: "Lahore, Pakistan",
      email: "aya.khan@example.test",
      skills: ["Research", "Figma", "Communication"],
      completion: 68,
    },
    onboarding: [
      {
        id: "profile",
        title: "Complete your profile",
        description: "Help your team understand where you want to go next.",
        status: "next",
      },
      {
        id: "preferences",
        title: "Set your preferences",
        description: "Tell us what kind of opportunity feels right.",
        status: "upcoming",
      },
      {
        id: "documents",
        title: "Add your documents",
        description: "Keep your CV and supporting documents in one place.",
        status: "upcoming",
      },
    ],
    nextSteps: [
      "Finish the profile details your team can review.",
      "Share the kind of roles and work environment you prefer.",
      "Review opportunities with your assigned team.",
    ],
  };
  workspaceByUser.set(session.user.id, data);
  return data;
}

function updateCompletion(data: CandidateWorkspaceData): void {
  const complete = data.onboarding.filter(
    (step) => step.status === "complete",
  ).length;
  data.profile.completion = Math.min(100, 68 + complete * 10);
  let next = false;
  data.onboarding = data.onboarding.map((step) => {
    if (step.status === "complete") return step;
    if (!next) {
      next = true;
      return { ...step, status: "next" };
    }
    return { ...step, status: "upcoming" };
  });
}

export function getCandidateWorkspace(
  session: Session,
  signal?: AbortSignal,
): Promise<CandidateWorkspaceData> {
  return mockRequest(() => ensureCandidate(session), signal);
}

export function updateCandidateProfile(
  session: Session,
  patch: CandidateProfilePatch,
  signal?: AbortSignal,
): Promise<CandidateWorkspaceData> {
  return mockRequest(() => {
    const data = ensureCandidate(session);
    data.profile = { ...data.profile, ...patch };
    return data;
  }, signal);
}

export function completeOnboardingStep(
  session: Session,
  stepId: OnboardingStep["id"],
): Promise<CandidateWorkspaceData> {
  return mockRequest(() => {
    const data = ensureCandidate(session);
    const step = data.onboarding.find((item) => item.id === stepId);
    if (!step) throw new Error("That onboarding step is not available.");
    if (step.status === "upcoming") {
      throw new Error("Complete the current onboarding step first.");
    }
    step.status = "complete";
    updateCompletion(data);
    return data;
  });
}

export function resetCandidateMockState(): void {
  workspaceByUser.clear();
}
