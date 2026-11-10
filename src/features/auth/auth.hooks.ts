"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isMockMode } from "../../lib/mock-mode.ts";
import { clearPrivateQueries } from "../../lib/query.client.ts";
import {
  getDemoPersonas,
  getSession,
  logout,
  selectDemoSession,
} from "./auth.api.ts";
import { authKeys } from "./auth.keys.ts";
import type { Session } from "./auth.types.ts";

export function useSession() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: ({ signal }) => getSession(signal),
    enabled: isMockMode(),
    staleTime: Infinity,
  });
}

export function useDemoPersonas() {
  return useQuery({
    queryKey: authKeys.personas,
    queryFn: ({ signal }) => getDemoPersonas(signal),
    enabled: isMockMode(),
    staleTime: Infinity,
  });
}

export function useDemoSessionChange() {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["session-change"],
    scope: { id: "demo-session" },
    mutationFn: async (
      selection: { personaId: string; agencyId?: string } | null,
    ) => {
      await client.cancelQueries();
      return selection
        ? selectDemoSession(selection.personaId, selection.agencyId)
        : logout();
    },
    onSuccess: async (session: Session | null) => {
      await clearPrivateQueries(client);
      client.setQueryData(authKeys.session, session);
    },
  });
}
