import { requireMockMode } from "../../lib/mock-mode.ts";
import type { Session, Workspace } from "../auth/auth.types.ts";
import type { PreviewState } from "./workspace.types.ts";

export async function getWorkspaceOverview(
  session: Session,
  workspace: Workspace,
  state: PreviewState,
  signal?: AbortSignal,
) {
  requireMockMode();
  const { getMockOverview } = await import("./mocks/workspace.mock.ts");
  return getMockOverview(session, workspace, state, signal);
}
