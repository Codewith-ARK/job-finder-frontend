import type { Session } from "../auth/auth.types.ts";

export const candidateKeys = {
  workspace: (session: Session | null | undefined) =>
    [
      "private",
      session?.user.id,
      session?.agency.id,
      "candidate-workspace",
    ] as const,
};
