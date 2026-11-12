import type { Session } from "../auth/auth.types.ts";

export const referralKeys = {
  all: ["private", "referrals"] as const,
  links: (session: Session | null) =>
    [
      "private",
      "referrals",
      "links",
      session?.user.id ?? "anonymous",
      session?.agency?.id ?? "none",
    ] as const,
  resolve: (token: string) => ["referral", "resolve", token] as const,
};
