import { requireMockMode } from "../../lib/mock-mode.ts";
import type { Session } from "../auth/auth.types.ts";
import {
  addTeamMember as addMockTeamMember,
  assignCandidate as assignMockCandidate,
  getStaffWorkspace as getMockWorkspace,
} from "./mocks/staff.mock.ts";
import type { AssignmentPatch, NewTeamMember } from "./staff.types.ts";

export function getStaffWorkspace(session: Session, signal?: AbortSignal) {
  requireMockMode();
  return getMockWorkspace(session, signal);
}

export function assignCandidate(session: Session, patch: AssignmentPatch) {
  requireMockMode();
  return assignMockCandidate(session, patch);
}

export function addTeamMember(session: Session, member: NewTeamMember) {
  requireMockMode();
  return addMockTeamMember(session, member);
}
