import type { Metadata } from "next";
import { JobsWorkspace } from "@/features/jobs/components/jobs-workspace";

export const metadata: Metadata = { title: "Application pipeline" };

export default function StaffApplicationsPage() {
  return <JobsWorkspace />;
}
