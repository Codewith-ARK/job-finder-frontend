import { Badge as FlowbiteBadge } from "flowbite-react";

const tones = {
  neutral: "gray",
  accent: "success",
  warning: "warning",
  danger: "failure",
  info: "info",
} as const;

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <FlowbiteBadge color={tones[tone]} className="w-fit font-medium">
      {children}
    </FlowbiteBadge>
  );
}
