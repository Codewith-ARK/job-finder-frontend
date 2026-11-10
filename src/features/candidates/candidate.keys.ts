import type { Session } from "../auth/auth.types.ts";

export const candidateKeys = {
  all: ["private", "candidate"] as const,
  workspace: (session: Session | null) =>
    [
      "private",
      "candidate",
      "workspace",
      session?.user.id ?? "anonymous",
      session?.agency?.id ?? "none",
    ] as const,
};
