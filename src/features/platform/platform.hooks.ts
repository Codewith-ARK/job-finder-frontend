"use client";

import { useQuery } from "@tanstack/react-query";
import { isMockMode } from "../../lib/mock-mode.ts";
import { useSession } from "../auth/auth.hooks.ts";
import { getPlatformWorkspace } from "./platform.api.ts";

export function usePlatformWorkspace() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: [
      "private",
      session?.user.id,
      session?.agency.id,
      "platform-workspace",
    ],
    queryFn: ({ signal }) => {
      if (!session) throw new Error("Choose the platform perspective first.");
      return getPlatformWorkspace(session, signal);
    },
    enabled: isMockMode() && !!session && session.user.workspace === "platform",
    staleTime: 60_000,
  });
}
