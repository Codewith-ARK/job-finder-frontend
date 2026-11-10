"use client";

import {
  Alert,
  Button,
  Card,
  Badge as FlowbiteBadge,
  Progress,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
} from "flowbite-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Feedback } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { formatRelative } from "@/lib/format";
import { apiErrorMessage } from "@/lib/http.client";
import { useSession } from "../../auth/auth.hooks";
import { useStaffMutation, useStaffWorkspace } from "../staff.hooks";

const stages = [
  { value: "onboarding", label: "Onboarding" },
  { value: "review", label: "Under review" },
  { value: "interview", label: "Interview" },
  { value: "ready", label: "Ready" },
];

const stageTone: Record<
  string,
  "neutral" | "accent" | "warning" | "danger" | "info"
> = {
  onboarding: "warning",
  review: "info",
  interview: "accent",
  ready: "accent",
};

export function StaffCandidates() {
  const workspace = useStaffWorkspace();
  const mutation = useStaffMutation();
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const [error, setError] = useState<string>();

  const isSupervisor = session?.user.role === "supervisor";
  const members = useMemo(
    () => (workspace.data?.teamMembers ?? []).filter((member) => member.active),
    [workspace.data],
  );
  const membersById = useMemo(
    () => new Map(members.map((member) => [member.id, member])),
    [members],
  );

  const candidates = useMemo(() => {
    const list = workspace.data?.candidates ?? [];
    return list.filter((candidate) => {
      const matchesQuery =
        `${candidate.name} ${candidate.headline} ${candidate.location} ${candidate.skills.join(" ")}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
      const matchesStage = stage === "all" || candidate.status === stage;
      return matchesQuery && matchesStage;
    });
  }, [workspace.data, query, stage]);

  if (workspace.isPending) {
    return (
      <Feedback kind="loading" title="Loading candidates">
        Fetching the agency candidate directory.
      </Feedback>
    );
  }

  if (workspace.isError) {
    return (
      <Feedback
        kind="error"
        title="We could not load the candidate directory"
        action={<Button onClick={() => workspace.refetch()}>Try again</Button>}
      >
        {apiErrorMessage(workspace.error)}
      </Feedback>
    );
  }

  function assign(candidateId: string, memberId: string) {
    setError(undefined);
    mutation.mutate(
      { type: "assign", candidateId, memberId: memberId || null },
      { onError: (cause) => setError(apiErrorMessage(cause)) },
    );
  }

  function moveStage(candidateId: string, nextStage: string) {
    setError(undefined);
    mutation.mutate(
      { type: "stage", candidateId, stage: nextStage },
      { onError: (cause) => setError(apiErrorMessage(cause)) },
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={isSupervisor ? "Supervisor workspace" : "Agency workspace"}
        title="Candidates"
        description={
          isSupervisor
            ? "Assign owners and move candidates through the pipeline."
            : "Read-only view of the candidates your agency supports."
        }
      />

      {error && (
        <Alert color="failure" role="alert">
          {error}
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <TextInput
            placeholder="Search candidates, skills, or locations"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search candidates"
          />
        </div>
        <div className="sm:w-52">
          <Select
            value={stage}
            onChange={(event) => setStage(event.target.value)}
            aria-label="Filter by stage"
          >
            <option value="all">All stages</option>
            {stages.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {candidates.length === 0 ? (
        <EmptyState
          title="No candidates match this view"
          description="Adjust the search or stage filter to see more of the directory."
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell>Candidate</TableHeadCell>
                <TableHeadCell>Stage</TableHeadCell>
                <TableHeadCell>Onboarding</TableHeadCell>
                <TableHeadCell>Assigned to</TableHeadCell>
                <TableHeadCell>Updated</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">
                      {candidate.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {candidate.headline} · {candidate.location}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} tone="neutral">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isSupervisor ? (
                      <Select
                        sizing="sm"
                        value={candidate.status}
                        onChange={(event) =>
                          moveStage(candidate.id, event.target.value)
                        }
                        disabled={mutation.isPending}
                        aria-label={`Stage for ${candidate.name}`}
                      >
                        {stages.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Badge tone={stageTone[candidate.status] ?? "neutral"}>
                        {stages.find((item) => item.value === candidate.status)
                          ?.label ?? candidate.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="w-32">
                      <Progress
                        progress={candidate.onboarding}
                        color="success"
                        size="sm"
                      />
                      <span className="mt-1 block text-xs text-slate-500">
                        {candidate.onboarding}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isSupervisor ? (
                      <Select
                        sizing="sm"
                        value={candidate.assignedTo ?? ""}
                        onChange={(event) =>
                          assign(candidate.id, event.target.value)
                        }
                        disabled={mutation.isPending}
                        aria-label={`Assignment for ${candidate.name}`}
                      >
                        <option value="">Unassigned</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <span className="text-sm text-slate-700">
                        {candidate.assignedTo
                          ? (membersById.get(candidate.assignedTo)?.name ??
                            "Team member")
                          : "Unassigned"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="whitespace-nowrap text-sm text-slate-600">
                      {formatRelative(candidate.updatedAt)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {!isSupervisor && (
        <p className="text-xs text-slate-500">
          Stage and assignment changes require a supervisor account.
        </p>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <FlowbiteBadge color="gray">Agency scoped</FlowbiteBadge>
        Candidates outside this agency are never returned by the API.
      </div>
    </div>
  );
}
