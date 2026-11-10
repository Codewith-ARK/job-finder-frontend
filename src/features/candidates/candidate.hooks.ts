"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "../auth/auth.hooks.ts";
import {
  completeOnboardingStep,
  deleteCandidateDocument,
  getCandidateWorkspace,
  updateCandidatePreferences,
  updateCandidateProfile,
  uploadCandidateDocument,
} from "./candidate.api.ts";
import { candidateKeys } from "./candidate.keys.ts";
import type {
  CandidatePreferencesPatch,
  CandidateProfilePatch,
  CandidateWorkspaceData,
} from "./candidate.types.ts";

export type CandidateAction =
  | { type: "profile"; patch: CandidateProfilePatch }
  | { type: "preferences"; patch: CandidatePreferencesPatch }
  | { type: "step"; stepId: string }
  | { type: "upload"; file: File }
  | { type: "delete-document"; documentId: string };

export function useCandidateWorkspace() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: candidateKeys.workspace(session ?? null),
    queryFn: ({ signal }) => getCandidateWorkspace(signal),
    enabled: session?.user.workspace === "candidate",
    staleTime: 30_000,
  });
}

function runCandidateAction(action: CandidateAction) {
  switch (action.type) {
    case "profile":
      return updateCandidateProfile(action.patch);
    case "preferences":
      return updateCandidatePreferences(action.patch);
    case "step":
      return completeOnboardingStep(action.stepId);
    case "upload":
      return uploadCandidateDocument(action.file);
    case "delete-document":
      return deleteCandidateDocument(action.documentId);
  }
}

export function useCandidateMutation() {
  const client = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: runCandidateAction,
    onSuccess: (data: CandidateWorkspaceData) => {
      client.setQueryData(candidateKeys.workspace(session ?? null), data);
    },
  });
}
