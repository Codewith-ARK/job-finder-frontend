import type { Metadata } from "next";
import { StaffDashboard } from "@/features/staff/components/staff-dashboard";
import { WorkspaceGuard } from "@/features/workspace/components/workspace-guard";

export const metadata: Metadata = { title: "Agency overview" };

export default function StaffPage() {
  return (
    <WorkspaceGuard workspace="staff">
      <StaffDashboard />
    </WorkspaceGuard>
  );
}
