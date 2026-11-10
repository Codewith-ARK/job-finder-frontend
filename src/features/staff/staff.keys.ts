import type { Session } from "../auth/auth.types.ts";

export const staffKeys = {
  all: ["private", "staff"] as const,
  workspace: (session: Session | null) =>
    [
      "private",
      "staff",
      "workspace",
      session?.user.id ?? "anonymous",
      session?.agency?.id ?? "none",
    ] as const,
};
