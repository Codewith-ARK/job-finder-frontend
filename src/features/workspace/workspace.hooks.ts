"use client";

import { useIsMutating, useQuery } from "@tanstack/react-query";
import { isMockMode } from "../../lib/mock-mode.ts";
import { useSession } from "../auth/auth.hooks.ts";
import type { Workspace } from "../auth/auth.types.ts";
import { getWorkspaceOverview } from "./workspace.api.ts";
import { workspaceKeys } from "./workspace.keys.ts";
import type { PreviewState } from "./workspace.types.ts";

export function useWorkspaceOverview(
  workspace: Workspace,
  state: PreviewState,
) {
  const { data: session } = useSession();
  const switching = useIsMutating({ mutationKey: ["session-change"] }) > 0;
  return useQuery({
    queryKey: workspaceKeys.overview(session, workspace, state),
    queryFn: ({ signal }) => {
      if (!session) throw new Error("Select a demo perspective first.");
      return getWorkspaceOverview(session, workspace, state, signal);
    },
    enabled:
      isMockMode() &&
      !!session &&
      session.user.workspace === workspace &&
      !switching,
    staleTime: state === "loading" ? 0 : 60_000,
  });
}
