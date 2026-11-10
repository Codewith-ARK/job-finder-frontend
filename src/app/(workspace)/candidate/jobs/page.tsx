import type { Metadata } from "next";
import { JobsWorkspace } from "@/features/jobs/components/jobs-workspace";

export const metadata: Metadata = { title: "Find jobs" };

export default function CandidateJobsPage() {
  return <JobsWorkspace />;
}
