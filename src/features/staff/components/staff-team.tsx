"use client";

import {
  Alert,
  Button,
  Card,
  Badge as FlowbiteBadge,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
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
import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Feedback } from "@/components/ui/feedback";
import { IconPlus } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { apiErrorMessage } from "@/lib/http.client";
import { useSession } from "../../auth/auth.hooks";
import { useStaffMutation, useStaffWorkspace } from "../staff.hooks";

const NEW_TEAM = "__new__";

export function StaffTeam() {
  const workspace = useStaffWorkspace();
  const mutation = useStaffMutation();
  const { data: session } = useSession();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"employee" | "supervisor">("employee");
  const [team, setTeam] = useState("");
  const [customTeam, setCustomTeam] = useState("");
  const [credentials, setCredentials] = useState<{
    name: string;
    email: string;
    password: string;
  }>();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>();

  const isSupervisor = session?.user.role === "supervisor";

  if (workspace.isPending) {
    return (
      <Feedback kind="loading" title="Loading the team">
        Fetching members, teams, and workload.
      </Feedback>
    );
  }

  if (workspace.isError) {
    return (
      <Feedback
        kind="error"
        title="We could not load the team"
        action={<Button onClick={() => workspace.refetch()}>Try again</Button>}
      >
        {apiErrorMessage(workspace.error)}
      </Feedback>
    );
  }

  const data = workspace.data;
  const resolvedTeam = team === NEW_TEAM ? customTeam : team;

  function openCreate() {
    setError(undefined);
    setCopied(false);
    setName("");
    setEmail("");
    setRole("employee");
    setTeam(data.teams[0] ?? NEW_TEAM);
    setCustomTeam("");
    setCreateOpen(true);
  }

  function create() {
    setError(undefined);
    mutation.mutate(
      {
        type: "create-member",
        payload: { name, email, role, team: resolvedTeam },
      },
      {
        onSuccess: (result) => {
          setCreateOpen(false);
          setCredentials({
            name,
            email,
            password: result.temporaryPassword ?? "",
          });
        },
        onError: (cause) => setError(apiErrorMessage(cause)),
      },
    );
  }

  function toggle(memberId: string, active: boolean) {
    setError(undefined);
    mutation.mutate(
      { type: "update-member", memberId, patch: { active } },
      { onError: (cause) => setError(apiErrorMessage(cause)) },
    );
  }

  async function copyPassword() {
    if (!credentials) return;
    try {
      await navigator.clipboard.writeText(credentials.password);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={isSupervisor ? "Supervisor workspace" : "Agency workspace"}
        title="Team"
        description={
          isSupervisor
            ? "Add members, adjust roles and teams, and control access."
            : "Members of your agency and their current workload."
        }
        actions={
          isSupervisor ? (
            <Button
              color="success"
              onClick={openCreate}
              disabled={!data.teams.length}
            >
              <IconPlus className="mr-2 h-4 w-4" /> Add team member
            </Button>
          ) : undefined
        }
      />

      {error && (
        <Alert color="failure" role="alert">
          {error}
        </Alert>
      )}

      {data.teamMembers.length === 0 ? (
        <EmptyState
          title="No team members yet"
          description="Supervisors can add the first member; new accounts receive a one-time temporary password."
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell>Member</TableHeadCell>
                <TableHeadCell>Role</TableHeadCell>
                <TableHeadCell>Team</TableHeadCell>
                <TableHeadCell>Workload</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                {isSupervisor && <TableHeadCell>Actions</TableHeadCell>}
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {data.teamMembers.map((member) => {
                const self = member.id === session?.user.id;
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <p className="font-medium text-slate-900">
                        {member.name}
                      </p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        tone={member.role === "supervisor" ? "accent" : "info"}
                      >
                        {member.role === "supervisor"
                          ? "Supervisor"
                          : "Employee"}
                      </Badge>
                      {self && (
                        <span className="ml-2 text-xs text-slate-500">You</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-700">
                        {member.team}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="w-32">
                        <Progress
                          progress={member.workload}
                          color="success"
                          size="sm"
                        />
                        <span className="mt-1 block text-xs text-slate-500">
                          {member.workload}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge tone={member.active ? "accent" : "danger"}>
                        {member.active ? "Active" : "Deactivated"}
                      </Badge>
                    </TableCell>
                    {isSupervisor && (
                      <TableCell>
                        <Button
                          size="xs"
                          color={member.active ? "failure" : "success"}
                          outline
                          onClick={() => toggle(member.id, !member.active)}
                          disabled={self || mutation.isPending}
                          title={
                            self
                              ? "You cannot deactivate your own account"
                              : undefined
                          }
                        >
                          {member.active ? "Deactivate" : "Reactivate"}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Modal show={createOpen} size="lg" onClose={() => setCreateOpen(false)}>
        <ModalHeader>Add a team member</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              The member joins this agency immediately. Store the temporary
              password somewhere safe — it is shown once.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="member-name">Full name</Label>
                </div>
                <TextInput
                  id="member-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="member-email">Email</Label>
                </div>
                <TextInput
                  id="member-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="member-role">Role</Label>
                </div>
                <Select
                  id="member-role"
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value as "employee" | "supervisor")
                  }
                >
                  <option value="employee">Employee</option>
                  <option value="supervisor">Supervisor</option>
                </Select>
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="member-team">Team</Label>
                </div>
                <Select
                  id="member-team"
                  value={team}
                  onChange={(event) => setTeam(event.target.value)}
                >
                  {data.teams.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value={NEW_TEAM}>New team…</option>
                </Select>
                {team === NEW_TEAM && (
                  <TextInput
                    className="mt-2"
                    placeholder="Team name"
                    value={customTeam}
                    onChange={(event) => setCustomTeam(event.target.value)}
                  />
                )}
              </div>
            </div>
            {error && (
              <Alert color="failure" role="alert">
                {error}
              </Alert>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <ActionButton
            color="success"
            onClick={create}
            disabled={
              mutation.isPending ||
              !name.trim() ||
              !email.trim() ||
              !resolvedTeam.trim()
            }
            pending={mutation.isPending}
          >
            Create member
          </ActionButton>
          <Button color="light" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        show={Boolean(credentials)}
        size="md"
        onClose={() => setCredentials(undefined)}
      >
        <ModalHeader>Temporary password</ModalHeader>
        <ModalBody>
          {credentials && (
            <div className="space-y-4">
              <Alert color="warning">
                Share this password with {credentials.name} through a secure
                channel. It is not shown again.
              </Alert>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <p className="text-sm text-slate-900">{credentials.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Password
                </p>
                <p className="mt-1 rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm text-slate-900">
                  {credentials.password}
                </p>
              </div>
              <Button color="light" size="sm" onClick={copyPassword}>
                {copied ? "Copied" : "Copy password"}
              </Button>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={() => setCredentials(undefined)}>
            Done
          </Button>
        </ModalFooter>
      </Modal>

      {!isSupervisor && (
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <FlowbiteBadge color="gray">Read only</FlowbiteBadge>
          Team changes require a supervisor account.
        </p>
      )}
    </div>
  );
}
