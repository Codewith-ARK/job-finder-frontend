import type { Metadata } from "next";
import { CandidateWorkspace } from "@/features/candidates/components/candidate-workspace";

export const metadata: Metadata = { title: "Candidate workspace" };

export default function CandidatePage() {
  return <CandidateWorkspace />;
}
