import type { Metadata } from "next";
import { CandidateOnboarding } from "@/features/candidates/components/candidate-onboarding";
import { WorkspaceGuard } from "@/features/workspace/components/workspace-guard";

export const metadata: Metadata = { title: "Onboarding" };

export default function CandidateOnboardingPage() {
  return (
    <WorkspaceGuard workspace="candidate">
      <CandidateOnboarding />
    </WorkspaceGuard>
  );
}
