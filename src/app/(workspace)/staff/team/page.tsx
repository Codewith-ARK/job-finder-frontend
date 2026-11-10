import type { Metadata } from "next";
import { StaffTeam } from "@/features/staff/components/staff-team";
import { WorkspaceGuard } from "@/features/workspace/components/workspace-guard";

export const metadata: Metadata = { title: "Team" };

export default function StaffTeamPage() {
  return (
    <WorkspaceGuard workspace="staff">
      <StaffTeam />
    </WorkspaceGuard>
  );
}
