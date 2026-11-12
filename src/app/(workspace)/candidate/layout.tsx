import { CandidateGate } from "@/features/candidates/components/candidate-gate";
import { WorkspaceGuard } from "@/features/workspace/components/workspace-guard";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceGuard workspace="candidate">
      <CandidateGate>{children}</CandidateGate>
    </WorkspaceGuard>
  );
}
