import { mockRequest } from "../../../lib/mocks/request.ts";
import {
  demoPersonas,
  endMockSession,
  readMockSession,
  selectMockSession,
} from "../../../lib/mocks/state.ts";

export const authMock = {
  session: (signal?: AbortSignal) => mockRequest(readMockSession, signal),
  personas: (signal?: AbortSignal) => mockRequest(() => demoPersonas, signal),
  select: (personaId: string, agencyId?: string) =>
    mockRequest(() => selectMockSession(personaId, agencyId)),
  logout: () => mockRequest(endMockSession),
};
