export type ReferralStatus = "active" | "used" | "expired" | "revoked";
export type ReferralResolveStatus = ReferralStatus | "unknown";

export interface ReferralLink {
  id: string;
  label: string;
  tokenHint: string;
  agencyName: string;
  createdByName: string;
  status: ReferralStatus;
  expiresAt: string;
  createdAt: string;
  usedAt: string | null;
  revokedAt: string | null;
}

export interface ReferralCreated {
  link: ReferralLink;
  token: string;
  path: string;
}

export interface ReferralCreateInput {
  label: string;
  expiresInDays: number;
}

export interface ReferralResolve {
  valid: boolean;
  status: ReferralResolveStatus;
  agencyName: string;
  referrerName: string;
  label: string;
  expiresAt: string | null;
  reason: string;
}
