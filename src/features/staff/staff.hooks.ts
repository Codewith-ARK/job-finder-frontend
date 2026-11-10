"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isMockMode } from "../../lib/mock-mode.ts";
import { useSession } from "../auth/auth.hooks.ts";
import type { Session } from "../auth/auth.types.ts";
import {
  addTeamMember,
  assignCandidate,
  getStaffWorkspace,
} from "./staff.api.ts";
import { staffKeys } from "./staff.keys.ts";
import type { AssignmentPatch, NewTeamMember } from "./staff.types.ts";

export function useStaffWorkspace() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: staffKeys.workspace(session ?? null),
    queryFn: ({ signal }) => {
      if (!session) throw new Error("Choose the staff perspective first.");
      return getStaffWorkspace(session, signal);
    },
    enabled: isMockMode() && !!session && session.user.workspace === "staff",
    staleTime: 60_000,
  });
}

export function useStaffMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["staff-workspace-change"],
    scope: { id: "staff-workspace" },
    mutationFn: async (
      change:
        | { type: "assignment"; session: Session; patch: AssignmentPatch }
        | { type: "member"; session: Session; member: NewTeamMember },
    ) =>
      change.type === "assignment"
        ? assignCandidate(change.session, change.patch)
        : addTeamMember(change.session, change.member),
    onSuccess: (data) =>
      client.setQueryData(staffKeys.workspace(data.session as Session), data),
  });
}
