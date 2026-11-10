import type { Metadata } from "next";
import { CandidateJobs } from "@/features/candidates/components/candidate-jobs";
import { WorkspaceGuard } from "@/features/workspace/components/workspace-guard";

export const metadata: Metadata = { title: "Open roles" };

export default function CandidateJobsPage() {
  return (
    <WorkspaceGuard workspace="candidate">
      <CandidateJobs />
    </WorkspaceGuard>
  );
}
