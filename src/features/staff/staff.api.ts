import { httpClient } from "../../lib/http.client.ts";
import type {
  NewTeamMember,
  StaffWorkspaceData,
  TeamMemberPatch,
} from "./staff.types.ts";

export async function getStaffWorkspace(
  signal?: AbortSignal,
): Promise<StaffWorkspaceData> {
  const { data } = await httpClient.get<StaffWorkspaceData>(
    "/staff/workspace",
    {
      signal,
    },
  );
  return data;
}

export async function assignCandidate(
  candidateId: string,
  memberId: string | null,
): Promise<StaffWorkspaceData> {
  const { data } = await httpClient.post<StaffWorkspaceData>(
    `/staff/candidates/${candidateId}/assignment`,
    { memberId },
  );
  return data;
}

export async function updateCandidateStage(
  candidateId: string,
  stage: string,
): Promise<StaffWorkspaceData> {
  const { data } = await httpClient.patch<StaffWorkspaceData>(
    `/staff/candidates/${candidateId}/stage`,
    { stage },
  );
  return data;
}

export interface MemberCreated {
  workspace: StaffWorkspaceData;
  temporaryPassword: string;
}

export async function createTeamMember(
  payload: NewTeamMember,
): Promise<MemberCreated> {
  const { data } = await httpClient.post<MemberCreated>(
    "/staff/members",
    payload,
  );
  return data;
}

export async function updateTeamMember(
  memberId: string,
  patch: TeamMemberPatch,
): Promise<StaffWorkspaceData> {
  const { data } = await httpClient.patch<StaffWorkspaceData>(
    `/staff/members/${memberId}`,
    patch,
  );
  return data;
}
