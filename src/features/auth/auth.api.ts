import { requireMockMode } from "../../lib/mock-mode.ts";

// Real authentication is T05. Disabled mock mode fails explicitly without HTTP.
async function adapter() {
  requireMockMode();
  return (await import("./mocks/auth.mock.ts")).authMock;
}

export async function getSession(signal?: AbortSignal) {
  return (await adapter()).session(signal);
}

export async function getDemoPersonas(signal?: AbortSignal) {
  return (await adapter()).personas(signal);
}

export async function selectDemoSession(personaId: string, agencyId?: string) {
  return (await adapter()).select(personaId, agencyId);
}

export async function logout() {
  return (await adapter()).logout();
}
