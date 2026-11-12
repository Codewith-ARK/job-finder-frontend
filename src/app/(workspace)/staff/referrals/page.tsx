import type { Metadata } from "next";
import { StaffReferrals } from "@/features/staff/components/staff-referrals";
import { WorkspaceGuard } from "@/features/workspace/components/workspace-guard";

export const metadata: Metadata = { title: "Referral links" };

export default function StaffReferralsPage() {
  return (
    <WorkspaceGuard workspace="staff">
      <StaffReferrals />
    </WorkspaceGuard>
  );
}
