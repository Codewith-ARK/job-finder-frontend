import type { Metadata } from "next";
import { CandidateDashboard } from "@/features/candidates/components/candidate-dashboard";
import { WorkspaceGuard } from "@/features/workspace/components/workspace-guard";

export const metadata: Metadata = { title: "Candidate overview" };

export default function CandidatePage() {
  return (
    <WorkspaceGuard workspace="candidate">
      <CandidateDashboard />
    </WorkspaceGuard>
  );
}
