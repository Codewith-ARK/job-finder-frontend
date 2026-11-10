"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "../auth/auth.hooks.ts";
import { jobsKeys } from "../jobs/jobs.keys.ts";
import {
  assignCandidate,
  createTeamMember,
  getStaffWorkspace,
  updateCandidateStage,
  updateTeamMember,
} from "./staff.api.ts";
import { staffKeys } from "./staff.keys.ts";
import type {
  NewTeamMember,
  StaffWorkspaceData,
  TeamMemberPatch,
} from "./staff.types.ts";

export type StaffAction =
  | { type: "assign"; candidateId: string; memberId: string | null }
  | { type: "stage"; candidateId: string; stage: string }
  | { type: "create-member"; payload: NewTeamMember }
  | { type: "update-member"; memberId: string; patch: TeamMemberPatch };

export interface StaffMutationResult {
  workspace: StaffWorkspaceData;
  temporaryPassword?: string;
}

export function useStaffWorkspace() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: staffKeys.workspace(session ?? null),
    queryFn: ({ signal }) => getStaffWorkspace(signal),
    enabled: session?.user.workspace === "staff",
    staleTime: 30_000,
  });
}

async function runStaffAction(
  action: StaffAction,
): Promise<StaffMutationResult> {
  switch (action.type) {
    case "assign":
      return {
        workspace: await assignCandidate(action.candidateId, action.memberId),
      };
    case "stage":
      return {
        workspace: await updateCandidateStage(action.candidateId, action.stage),
      };
    case "create-member": {
      const created = await createTeamMember(action.payload);
      return {
        workspace: created.workspace,
        temporaryPassword: created.temporaryPassword,
      };
    }
    case "update-member":
      return {
        workspace: await updateTeamMember(action.memberId, action.patch),
      };
  }
}

export function useStaffMutation() {
  const client = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: runStaffAction,
    onSuccess: async (result) => {
      client.setQueryData(
        staffKeys.workspace(session ?? null),
        result.workspace,
      );
      await client.invalidateQueries({ queryKey: jobsKeys.all });
    },
  });
}
