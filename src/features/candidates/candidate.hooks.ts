"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isMockMode } from "../../lib/mock-mode.ts";
import { useSession } from "../auth/auth.hooks.ts";
import type { Session } from "../auth/auth.types.ts";
import {
  completeCandidateStep,
  getCandidateWorkspace,
  updateCandidateProfile,
} from "./candidate.api.ts";
import { candidateKeys } from "./candidate.keys.ts";
import type {
  CandidateProfilePatch,
  OnboardingStep,
} from "./candidate.types.ts";

export function useCandidateWorkspace() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: candidateKeys.workspace(session),
    queryFn: ({ signal }) => {
      if (!session) throw new Error("Choose the candidate perspective first.");
      return getCandidateWorkspace(session, signal);
    },
    enabled:
      isMockMode() && !!session && session.user.workspace === "candidate",
    staleTime: 60_000,
  });
}

export function useCandidateMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["candidate-workspace-change"],
    scope: { id: "candidate-workspace" },
    mutationFn: async (
      change:
        | { type: "profile"; session: Session; patch: CandidateProfilePatch }
        | {
            type: "onboarding";
            session: Session;
            stepId: OnboardingStep["id"];
          },
    ) => {
      if (change.type === "profile") {
        return updateCandidateProfile(change.session, change.patch);
      }
      return completeCandidateStep(change.session, change.stepId);
    },
    onSuccess: (data) => {
      client.setQueryData(candidateKeys.workspace(data.session), data);
    },
  });
}
