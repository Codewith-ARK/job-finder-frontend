"use client";

import {
  Alert,
  Avatar,
  Button,
  Card,
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
import { Badge } from "@/components/ui/badge";
import { Feedback } from "@/components/ui/feedback";
import { useSession } from "../../auth/auth.hooks.ts";
import { useStaffMutation, useStaffWorkspace } from "../staff.hooks.ts";
import type {
  NewTeamMember,
  StaffCandidate,
  StaffTab,
} from "../staff.types.ts";

const statusLabel: Record<StaffCandidate["status"], string> = {
  onboarding: "Onboarding",
  review: "Under review",
  interview: "Interview",
  ready: "Ready for assignment",
};

export function StaffWorkspace() {
  const { data: session } = useSession();
  const workspace = useStaffWorkspace();
  const mutation = useStaffMutation();
  const [tab, setTab] = useState<StaffTab>("overview");
  const [selected, setSelected] = useState<StaffCandidate | null>(null);
  const [memberId, setMemberId] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [newMember, setNewMember] = useState<NewTeamMember>({
    name: "",
    role: "employee" as const,
    team: "Candidate success",
  });

  if (workspace.isPending)
    return (
      <Feedback kind="loading" title="Preparing your staff workspace">
        Candidate and team records are loading.
      </Feedback>
    );
  if (workspace.isError)
    return (
      <Feedback
        kind="error"
        title="We couldn't open the staff workspace"
        action={
          <Button color="dark" onClick={() => workspace.refetch()}>
            Try again
          </Button>
        }
      >
        {workspace.error.message}
      </Feedback>
    );
  if (!workspace.data || !session)
    return (
      <Feedback title="Choose your staff perspective">
        Return to the perspective chooser to open this workspace.
      </Feedback>
    );

  const data = workspace.data;
  const isSupervisor = session.user.role === "supervisor";
  const openAssignment = (candidate: StaffCandidate) => {
    setSelected(candidate);
    setMemberId(
      candidate.assignedTo ??
        data.teamMembers.find((member) => member.active)?.id ??
        "",
    );
  };
  const saveAssignment = () => {
    if (!memberId) return;
    mutation.mutate(
      {
        type: "assignment",
        session,
        patch: { candidateId: selected?.id ?? "", memberId },
      },
      { onSuccess: () => setSelected(null) },
    );
  };
  const inviteMember = () => {
    mutation.mutate(
      { type: "member", session, member: newMember },
      {
        onSuccess: () => {
          setShowInvite(false);
          setNewMember({
            name: "",
            role: "employee",
            team: data.teams[0] ?? "Candidate success",
          });
        },
      },
    );
  };

  return (
    <div className="staff-workspace">
      <section className="staff-heading">
        <div>
          <p className="eyebrow">
            {isSupervisor ? "SUPERVISOR VIEW" : "STAFF VIEW"}
          </p>
          <h1>
            {isSupervisor ? "Team overview" : "Good work starts together."}
          </h1>
          <p>
            {isSupervisor
              ? "Keep candidates moving and make the next assignment clear."
              : "Review your candidates, follow up on tasks, and keep progress visible."}
          </p>
        </div>
        <Badge tone="accent">{session.agency.name}</Badge>
      </section>

      <nav className="staff-tabs" aria-label="Staff workspace sections">
        {(["overview", "candidates", "team"] as const).map((item) => (
          <Button key={item} color="light" onClick={() => setTab(item)}>
            {item === "overview"
              ? "Overview"
              : item === "candidates"
                ? "Candidates"
                : "Team"}
          </Button>
        ))}
        {isSupervisor && (
          <Button color="dark" onClick={() => setShowInvite(true)}>
            Add team member
          </Button>
        )}
      </nav>

      {mutation.isError && (
        <Alert color="failure">{mutation.error.message}</Alert>
      )}
      {mutation.isSuccess && (
        <Alert color="success">
          The staff workspace was updated successfully.
        </Alert>
      )}

      {tab === "overview" && (
        <>
          <div className="staff-stat-grid">
            {[
              [
                "Active candidates",
                data.stats.activeCandidates,
                "12% vs. last month",
              ],
              [
                "Open assignments",
                data.stats.openAssignments,
                "27% vs. last week",
              ],
              [
                "Onboarding in progress",
                data.stats.onboardingInProgress,
                "18% vs. last week",
              ],
              [
                "Application activity",
                data.stats.applicationActivity,
                "6% in the last 7 days",
              ],
            ].map(([label, value, change]) => (
              <Card key={label}>
                <p className="staff-stat-label">{label}</p>
                <strong className="staff-stat-value">{value}</strong>
                <span className="staff-stat-change">↑ {change}</span>
              </Card>
            ))}
          </div>
          <div className="staff-overview-grid">
            <Card>
              <div className="staff-card-heading">
                <div>
                  <p className="eyebrow">WORKLOAD</p>
                  <h2>My workload</h2>
                </div>
                <Badge>{isSupervisor ? "Agency" : "Assigned to you"}</Badge>
              </div>
              {data.candidates.slice(0, 4).map((candidate) => (
                <div className="workload-row" key={candidate.id}>
                  <Avatar
                    rounded
                    size="sm"
                    placeholderInitials={candidate.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  />
                  <span>
                    <strong>{candidate.name}</strong>
                    <small>{statusLabel[candidate.status]}</small>
                  </span>
                  <Badge>{candidate.onboarding}%</Badge>
                </div>
              ))}
            </Card>
            <Card>
              <div className="staff-card-heading">
                <div>
                  <p className="eyebrow">TEAM PROGRESS</p>
                  <h2>People at a glance</h2>
                </div>
                <Button color="light" size="sm" onClick={() => setTab("team")}>
                  View team
                </Button>
              </div>
              {data.teamMembers
                .filter((member) => member.active)
                .map((member) => (
                  <div className="team-progress-row" key={member.id}>
                    <Avatar
                      rounded
                      size="sm"
                      placeholderInitials={member.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    />
                    <span>
                      {member.name}
                      <small>{member.team}</small>
                    </span>
                    <Progress
                      color="green"
                      progress={member.workload}
                      size="sm"
                    />
                  </div>
                ))}
            </Card>
          </div>
          <Card>
            <div className="staff-card-heading">
              <div>
                <p className="eyebrow">RECENT ACTIVITY</p>
                <h2>Keep the thread moving</h2>
              </div>
              <Badge>Shared record</Badge>
            </div>
            {data.activity.map((item) => (
              <div className="activity-row" key={item.id}>
                <span className={`activity-dot activity-${item.tone}`} />
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </span>
                <time>{item.age}</time>
              </div>
            ))}
          </Card>
        </>
      )}

      {tab === "candidates" && (
        <Card>
          <div className="staff-card-heading">
            <div>
              <p className="eyebrow">CANDIDATE DIRECTORY</p>
              <h2>People who need a next step</h2>
              <p>Review onboarding progress and assign the right support.</p>
            </div>
            <Badge>{data.candidates.length} records</Badge>
          </div>
          <div className="staff-filters">
            <TextInput
              placeholder="Search candidates"
              aria-label="Search candidates"
            />
            <Select aria-label="Filter by status">
              <option>All statuses</option>
              <option>Onboarding</option>
              <option>Under review</option>
              <option>Ready for assignment</option>
            </Select>
          </div>
          <Table hoverable striped>
            <TableHead>
              <TableHeadCell>Candidate</TableHeadCell>
              <TableHeadCell>Location</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Profile progress</TableHeadCell>
              <TableHeadCell>Assigned to</TableHeadCell>
              <TableHeadCell>Action</TableHeadCell>
            </TableHead>
            <TableBody>
              {data.candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div className="table-person">
                      <Avatar
                        rounded
                        size="sm"
                        placeholderInitials={candidate.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      />
                      <span>
                        <strong>{candidate.name}</strong>
                        <small>{candidate.headline}</small>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{candidate.location}</TableCell>
                  <TableCell>
                    <Badge
                      tone={
                        candidate.status === "ready"
                          ? "accent"
                          : candidate.status === "onboarding"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {statusLabel[candidate.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Progress
                      color="green"
                      progress={candidate.onboarding}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell>
                    {candidate.assignedTo
                      ? data.teamMembers.find(
                          (member) => member.id === candidate.assignedTo,
                        )?.name
                      : "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <Button
                      color="light"
                      size="sm"
                      onClick={() => openAssignment(candidate)}
                      disabled={!isSupervisor}
                    >
                      {isSupervisor
                        ? candidate.assignedTo
                          ? "Reassign"
                          : "Assign"
                        : "View"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {tab === "team" && (
        <Card>
          <div className="staff-card-heading">
            <div>
              <p className="eyebrow">TEAM DIRECTORY</p>
              <h2>Your people</h2>
              <p>See workload and keep agency coverage balanced.</p>
            </div>
            <Badge>
              {data.teamMembers.filter((member) => member.active).length} active
            </Badge>
          </div>
          <Table hoverable>
            <TableHead>
              <TableHeadCell>Team member</TableHeadCell>
              <TableHeadCell>Role</TableHeadCell>
              <TableHeadCell>Team</TableHeadCell>
              <TableHeadCell>Workload</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
            </TableHead>
            <TableBody>
              {data.teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="table-person">
                      <Avatar
                        rounded
                        size="sm"
                        placeholderInitials={member.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      />
                      <span>
                        <strong>{member.name}</strong>
                        <small>
                          {member.id === "member-olivia-carter"
                            ? "Primary candidate support"
                            : "Staff member"}
                        </small>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.role === "employee" ? "Employee" : "Supervisor"}
                  </TableCell>
                  <TableCell>{member.team}</TableCell>
                  <TableCell>
                    <Progress
                      color="green"
                      progress={member.workload}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge tone={member.active ? "accent" : "warning"}>
                      {member.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Modal show={!!selected} onClose={() => setSelected(null)} size="lg">
        <ModalHeader>Assign a team member</ModalHeader>
        <ModalBody>
          {selected && (
            <div className="assignment-modal">
              <div className="assignment-candidate">
                <Avatar
                  rounded
                  size="lg"
                  placeholderInitials={selected.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                />
                <div>
                  <h3>{selected.name}</h3>
                  <p>
                    {selected.headline} · {selected.location}
                  </p>
                  <Badge tone="accent">{statusLabel[selected.status]}</Badge>
                </div>
              </div>
              <Label htmlFor="assignment-member">Assign to</Label>
              <Select
                id="assignment-member"
                value={memberId}
                onChange={(event) => setMemberId(event.target.value)}
              >
                {data.teamMembers
                  .filter((member) => member.active)
                  .map((member) => (
                    <option value={member.id} key={member.id}>
                      {member.name} · {member.workload}% workload
                    </option>
                  ))}
              </Select>
              <Alert color="info">
                The selected team member will see this candidate in their shared
                mock workspace.
              </Alert>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setSelected(null)}>
            Cancel
          </Button>
          <Button
            color="dark"
            onClick={saveAssignment}
            disabled={mutation.isPending || !memberId}
          >
            {mutation.isPending ? "Assigning..." : "Assign candidate"}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal show={showInvite} onClose={() => setShowInvite(false)}>
        <ModalHeader>Add team member</ModalHeader>
        <ModalBody>
          <div className="invite-form">
            <Label htmlFor="member-name">Name</Label>
            <TextInput
              id="member-name"
              value={newMember.name}
              onChange={(event) =>
                setNewMember({ ...newMember, name: event.target.value })
              }
              placeholder="e.g. Jordan Kim"
            />
            <Label htmlFor="member-role">Role</Label>
            <Select
              id="member-role"
              value={newMember.role}
              onChange={(event) =>
                setNewMember({
                  ...newMember,
                  role: event.target.value as "employee" | "supervisor",
                })
              }
            >
              <option value="employee">Employee</option>
              <option value="supervisor">Supervisor</option>
            </Select>
            <Label htmlFor="member-team">Team</Label>
            <Select
              id="member-team"
              value={newMember.team}
              onChange={(event) =>
                setNewMember({ ...newMember, team: event.target.value })
              }
            >
              {data.teams.map((team) => (
                <option value={team} key={team}>
                  {team}
                </option>
              ))}
            </Select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setShowInvite(false)}>
            Cancel
          </Button>
          <Button
            color="dark"
            onClick={inviteMember}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Adding..." : "Add member"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
