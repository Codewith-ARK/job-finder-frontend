"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isMockMode } from "../../lib/mock-mode.ts";
import { useSession } from "../auth/auth.hooks.ts";
import type { Session } from "../auth/auth.types.ts";
import {
  applyToJob,
  getJobsWorkspace,
  updateApplicationStatus,
} from "./jobs.api.ts";
import { jobsKeys } from "./jobs.keys.ts";
import type { ApplicationStatus } from "./jobs.types.ts";

export function useJobsWorkspace() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: jobsKeys.workspace(session),
    queryFn: ({ signal }) => {
      if (!session) throw new Error("Choose a perspective first.");
      return getJobsWorkspace(session, signal);
    },
    enabled:
      isMockMode() &&
      !!session &&
      ["candidate", "staff"].includes(session.user.workspace),
    staleTime: 30_000,
  });
}

export function useJobsMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["jobs-workspace-change"],
    scope: { id: "jobs-workspace" },
    mutationFn: async (
      change:
        | { type: "apply"; session: Session; jobId: string }
        | {
            type: "status";
            session: Session;
            applicationId: string;
            status: ApplicationStatus;
          },
    ) =>
      change.type === "apply"
        ? applyToJob(change.session, change.jobId)
        : updateApplicationStatus(
            change.session,
            change.applicationId,
            change.status,
          ),
    onSuccess: (data) =>
      client.setQueryData(jobsKeys.workspace(data.session), data),
  });
}
