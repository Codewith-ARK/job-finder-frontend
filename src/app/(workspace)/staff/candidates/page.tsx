import type { Metadata } from "next";
import { StaffCandidates } from "@/features/staff/components/staff-candidates";
import { WorkspaceGuard } from "@/features/workspace/components/workspace-guard";

export const metadata: Metadata = { title: "Candidates" };

export default function StaffCandidatesPage() {
  return (
    <WorkspaceGuard workspace="staff">
      <StaffCandidates />
    </WorkspaceGuard>
  );
}
