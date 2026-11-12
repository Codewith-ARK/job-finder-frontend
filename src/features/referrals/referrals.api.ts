import { httpClient } from "../../lib/http.client.ts";
import type {
  ReferralCreated,
  ReferralCreateInput,
  ReferralLink,
  ReferralResolve,
} from "./referrals.types.ts";

export async function getReferralLinks(
  signal?: AbortSignal,
): Promise<ReferralLink[]> {
  const { data } = await httpClient.get<ReferralLink[]>("/referrals", {
    signal,
  });
  return data;
}

export async function createReferral(
  input: ReferralCreateInput,
): Promise<ReferralCreated> {
  const { data } = await httpClient.post<ReferralCreated>("/referrals", input);
  return data;
}

export async function revokeReferral(linkId: string): Promise<ReferralLink[]> {
  const { data } = await httpClient.delete<ReferralLink[]>(
    `/referrals/${linkId}`,
  );
  return data;
}

/** Public: describes a link without consuming it. */
export async function resolveReferral(
  token: string,
  signal?: AbortSignal,
): Promise<ReferralResolve> {
  const { data } = await httpClient.get<ReferralResolve>(
    `/referrals/${encodeURIComponent(token)}`,
    { signal },
  );
  return data;
}
