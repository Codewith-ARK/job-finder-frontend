import { httpClient } from "../../lib/http.client.ts";
import type {
  CandidatePreferencesPatch,
  CandidateProfilePatch,
  CandidateWorkspaceData,
} from "./candidate.types.ts";

export async function getCandidateWorkspace(
  signal?: AbortSignal,
): Promise<CandidateWorkspaceData> {
  const { data } = await httpClient.get<CandidateWorkspaceData>(
    "/candidates/me",
    {
      signal,
    },
  );
  return data;
}

export async function updateCandidateProfile(
  patch: CandidateProfilePatch,
): Promise<CandidateWorkspaceData> {
  const { data } = await httpClient.patch<CandidateWorkspaceData>(
    "/candidates/me/profile",
    patch,
  );
  return data;
}

export async function updateCandidatePreferences(
  patch: CandidatePreferencesPatch,
): Promise<CandidateWorkspaceData> {
  const { data } = await httpClient.patch<CandidateWorkspaceData>(
    "/candidates/me/preferences",
    patch,
  );
  return data;
}

export async function completeOnboardingStep(
  stepId: string,
): Promise<CandidateWorkspaceData> {
  const { data } = await httpClient.post<CandidateWorkspaceData>(
    `/candidates/me/onboarding/${stepId}/complete`,
  );
  return data;
}

export async function uploadCandidateDocument(
  file: File,
): Promise<CandidateWorkspaceData> {
  const body = new FormData();
  body.append("file", file);
  const { data } = await httpClient.post<CandidateWorkspaceData>(
    "/candidates/me/documents",
    body,
  );
  return data;
}

export async function deleteCandidateDocument(
  documentId: string,
): Promise<CandidateWorkspaceData> {
  const { data } = await httpClient.delete<CandidateWorkspaceData>(
    `/candidates/me/documents/${documentId}`,
  );
  return data;
}

export function candidateDocumentUrl(documentId: string): string {
  return `/api/candidates/me/documents/${documentId}`;
}
