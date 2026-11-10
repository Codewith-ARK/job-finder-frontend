import { Badge as FlowbiteBadge } from "flowbite-react";

export function Badge({
  children,
  tone: _tone,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "warning";
}) {
  return <FlowbiteBadge>{children}</FlowbiteBadge>;
}
