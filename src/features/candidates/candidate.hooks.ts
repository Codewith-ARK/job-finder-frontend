"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "../auth/auth.hooks.ts";
import {
  completeOnboardingStep,
  deleteCandidateDocument,
  getCandidateWorkspace,
  saveAcademicStep,
  savePersonalStep,
  saveProfessionalStep,
  uploadCandidateDocument,
} from "./candidate.api.ts";
import { candidateKeys } from "./candidate.keys.ts";
import type {
  AcademicStepInput,
  CandidateWorkspaceData,
  PersonalStepInput,
  ProfessionalStepInput,
} from "./candidate.types.ts";

export type CandidateAction =
  | { type: "personal"; input: PersonalStepInput }
  | { type: "professional"; input: ProfessionalStepInput }
  | { type: "academic"; input: AcademicStepInput }
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
    case "personal":
      return savePersonalStep(action.input);
    case "professional":
      return saveProfessionalStep(action.input);
    case "academic":
      return saveAcademicStep(action.input);
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
