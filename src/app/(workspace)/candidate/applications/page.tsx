import type { Metadata } from "next";
import { JobsWorkspace } from "@/features/jobs/components/jobs-workspace";

export const metadata: Metadata = { title: "Applications" };

export default function CandidateApplicationsPage() {
  return <JobsWorkspace />;
}
