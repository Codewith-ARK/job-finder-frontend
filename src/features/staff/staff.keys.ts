import type { Session } from "../auth/auth.types.ts";

export const staffKeys = {
  workspace: (session: Session | null) =>
    [
      "private",
      session?.user.id,
      session?.agency.id,
      "staff-workspace",
    ] as const,
};
