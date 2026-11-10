import type { Metadata } from "next";
import { StaffJobs } from "@/features/staff/components/staff-jobs";
import { WorkspaceGuard } from "@/features/workspace/components/workspace-guard";

export const metadata: Metadata = { title: "Job board" };

export default function StaffJobsPage() {
  return (
    <WorkspaceGuard workspace="staff">
      <StaffJobs />
    </WorkspaceGuard>
  );
}
