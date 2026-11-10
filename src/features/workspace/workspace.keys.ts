import type { Session, Workspace } from "../auth/auth.types.ts";
import type { PreviewState } from "./workspace.types.ts";

export const workspaceKeys = {
  overview: (
    session: Session | null | undefined,
    workspace: Workspace,
    state: PreviewState,
  ) =>
    [
      "private",
      session?.user.id,
      session?.agency.id,
      workspace,
      "overview",
      state,
    ] as const,
};
