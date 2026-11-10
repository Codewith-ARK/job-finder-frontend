import type { Metadata } from "next";
import { CandidateProfile } from "@/features/candidates/components/candidate-profile";
import { WorkspaceGuard } from "@/features/workspace/components/workspace-guard";

export const metadata: Metadata = { title: "Profile" };

export default function CandidateProfilePage() {
  return (
    <WorkspaceGuard workspace="candidate">
      <CandidateProfile />
    </WorkspaceGuard>
  );
}
