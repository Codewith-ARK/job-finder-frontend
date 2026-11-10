import type { Session } from "../auth/auth.types.ts";

export const jobsKeys = {
  all: ["private", "jobs"] as const,
  workspace: (session: Session | null) =>
    [
      "private",
      "jobs",
      "workspace",
      session?.user.id ?? "anonymous",
      session?.agency?.id ?? "none",
      session?.user.role ?? "anonymous",
    ] as const,
};
