import { mockRequest } from "../../../lib/mocks/request.ts";
import { readMockSession } from "../../../lib/mocks/state.ts";
import type { Session, Workspace } from "../../auth/auth.types.ts";
import type { PreviewState, WorkspaceOverview } from "../workspace.types.ts";
import { workspaceModules } from "./fixtures.ts";

export function getMockOverview(
  session: Session,
  workspace: Workspace,
  state: PreviewState,
  signal?: AbortSignal,
): Promise<WorkspaceOverview> {
  return mockRequest(
    () => {
      const current = readMockSession();
      if (
        current?.user.id !== session.user.id ||
        current?.agency.id !== session.agency.id ||
        current?.user.workspace !== workspace
      ) {
        throw new Error(
          "The demo context changed. Choose a perspective to continue.",
        );
      }
      if (state === "error")
        throw new Error("A simulated request failed. No data was changed.");
      return {
        agencyName: current.agency.name,
        modules: state === "empty" ? [] : workspaceModules[workspace],
      };
    },
    signal,
    state === "loading" ? 1800 : 250,
  );
}
