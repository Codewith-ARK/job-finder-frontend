"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "../auth/auth.hooks.ts";
import { getPlatformWorkspace, updateAgencyStatus } from "./platform.api.ts";
import { platformKeys } from "./platform.keys.ts";
import type { AgencyStatus, PlatformData } from "./platform.types.ts";

export function usePlatformWorkspace() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: platformKeys.workspace(session ?? null),
    queryFn: ({ signal }) => getPlatformWorkspace(signal),
    enabled: session?.user.workspace === "platform",
    staleTime: 30_000,
  });
}

export function usePlatformMutation() {
  const client = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: ({
      agencyId,
      status,
    }: {
      agencyId: string;
      status: AgencyStatus;
    }) => updateAgencyStatus(agencyId, status),
    onSuccess: (data: PlatformData) => {
      client.setQueryData(platformKeys.workspace(session ?? null), data);
    },
  });
}
