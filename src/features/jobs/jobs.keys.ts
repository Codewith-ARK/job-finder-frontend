import type { Session } from "../auth/auth.types.ts";

export const jobsKeys = {
  workspace: (session: Session | null | undefined) =>
    [
      "private",
      session?.user.id,
      session?.agency.id,
      "jobs-workspace",
    ] as const,
};
