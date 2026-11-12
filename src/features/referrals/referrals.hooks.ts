"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "../auth/auth.hooks.ts";
import {
  createReferral,
  getReferralLinks,
  resolveReferral,
  revokeReferral,
} from "./referrals.api.ts";
import { referralKeys } from "./referrals.keys.ts";
import type {
  ReferralCreated,
  ReferralCreateInput,
  ReferralLink,
} from "./referrals.types.ts";

export function useReferralLinks() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: referralKeys.links(session ?? null),
    queryFn: ({ signal }) => getReferralLinks(signal),
    enabled: session?.user.workspace === "staff",
    staleTime: 30_000,
  });
}

export function useReferralResolve(token: string) {
  return useQuery({
    queryKey: referralKeys.resolve(token),
    queryFn: ({ signal }) => resolveReferral(token, signal),
    enabled: token.trim().length > 0,
    staleTime: 30_000,
    retry: false,
  });
}

export type ReferralAction =
  | { type: "create"; input: ReferralCreateInput }
  | { type: "revoke"; linkId: string };

function runReferralAction(
  action: ReferralAction,
): Promise<ReferralCreated | ReferralLink[]> {
  if (action.type === "create") return createReferral(action.input);
  return revokeReferral(action.linkId);
}

export function useReferralMutation() {
  const client = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: runReferralAction,
    onSuccess: async (result) => {
      if (Array.isArray(result)) {
        client.setQueryData(referralKeys.links(session ?? null), result);
      }
      await client.invalidateQueries({ queryKey: referralKeys.all });
    },
  });
}
