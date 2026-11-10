import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "../jobs.types";

const labels: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  review: "Under review",
  interview: "Interview",
  offer: "Offer",
  closed: "Closed",
};

const tones: Record<
  ApplicationStatus,
  "neutral" | "accent" | "warning" | "danger" | "info"
> = {
  submitted: "info",
  review: "warning",
  interview: "accent",
  offer: "accent",
  closed: "neutral",
};

export function ApplicationStatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  return <Badge tone={tones[status]}>{labels[status]}</Badge>;
}

export const applicationStatusOptions: {
  value: ApplicationStatus;
  label: string;
}[] = (
  ["submitted", "review", "interview", "offer", "closed"] as ApplicationStatus[]
).map((value) => ({ value, label: labels[value] }));
