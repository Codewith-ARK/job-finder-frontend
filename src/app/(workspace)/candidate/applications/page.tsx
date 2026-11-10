import type { Metadata } from "next";
import { CandidateApplications } from "@/features/candidates/components/candidate-applications";
import { WorkspaceGuard } from "@/features/workspace/components/workspace-guard";

export const metadata: Metadata = { title: "Applications" };

export default function CandidateApplicationsPage() {
  return (
    <WorkspaceGuard workspace="candidate">
      <CandidateApplications />
    </WorkspaceGuard>
  );
}
