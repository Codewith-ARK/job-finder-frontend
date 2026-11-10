import type { Session } from "../auth/auth.types.ts";

export const platformKeys = {
  all: ["private", "platform"] as const,
  workspace: (session: Session | null) =>
    [
      "private",
      "platform",
      "workspace",
      session?.user.id ?? "anonymous",
      session?.agency?.id ?? "none",
    ] as const,
};
