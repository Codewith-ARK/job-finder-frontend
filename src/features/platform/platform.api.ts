import { requireMockMode } from "../../lib/mock-mode.ts";
import type { Session } from "../auth/auth.types.ts";
import { getPlatformMock } from "./mocks/platform.mock.ts";

export function getPlatformWorkspace(session: Session, signal?: AbortSignal) {
  requireMockMode();
  return getPlatformMock(session, signal);
}
