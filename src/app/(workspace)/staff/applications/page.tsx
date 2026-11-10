import type { Metadata } from "next";
import { StaffApplications } from "@/features/staff/components/staff-applications";
import { WorkspaceGuard } from "@/features/workspace/components/workspace-guard";

export const metadata: Metadata = { title: "Applications" };

export default function StaffApplicationsPage() {
  return (
    <WorkspaceGuard workspace="staff">
      <StaffApplications />
    </WorkspaceGuard>
  );
}
