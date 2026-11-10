"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "../auth/auth.hooks.ts";
import { staffKeys } from "../staff/staff.keys.ts";
import {
  applyToJob,
  createJob,
  getJobsWorkspace,
  updateApplicationStatus,
  updateJob,
} from "./jobs.api.ts";
import { jobsKeys } from "./jobs.keys.ts";
import type {
  ApplicationStatus,
  JobInput,
  JobPatch,
  JobsWorkspaceData,
} from "./jobs.types.ts";

export type JobsAction =
  | { type: "apply"; jobId: string }
  | { type: "create"; payload: JobInput }
  | { type: "update-job"; jobId: string; patch: JobPatch }
  | { type: "status"; applicationId: string; status: ApplicationStatus };

export function useJobsWorkspace() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: jobsKeys.workspace(session ?? null),
    queryFn: ({ signal }) => getJobsWorkspace(signal),
    enabled:
      session?.user.workspace === "candidate" ||
      session?.user.workspace === "staff",
    staleTime: 20_000,
  });
}

function runJobsAction(action: JobsAction): Promise<JobsWorkspaceData> {
  switch (action.type) {
    case "apply":
      return applyToJob(action.jobId);
    case "create":
      return createJob(action.payload);
    case "update-job":
      return updateJob(action.jobId, action.patch);
    case "status":
      return updateApplicationStatus(action.applicationId, action.status);
  }
}

export function useJobsMutation() {
  const client = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: runJobsAction,
    onSuccess: async (data) => {
      client.setQueryData(jobsKeys.workspace(session ?? null), data);
      await client.invalidateQueries({ queryKey: staffKeys.all });
    },
  });
}
