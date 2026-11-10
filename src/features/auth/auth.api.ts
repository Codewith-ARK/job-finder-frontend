import { httpClient } from "../../lib/http.client.ts";
import type {
  DemoPersona,
  LoginInput,
  PasswordChangeInput,
  RegisterInput,
  Session,
} from "./auth.types.ts";

export async function getSession(
  signal?: AbortSignal,
): Promise<Session | null> {
  const { data } = await httpClient.get<Session | null>("/auth/session", {
    signal,
  });
  return data;
}

export async function getDemoPersonas(
  signal?: AbortSignal,
): Promise<DemoPersona[]> {
  const { data } = await httpClient.get<DemoPersona[]>("/auth/demo-personas", {
    signal,
  });
  return data;
}

export async function login(input: LoginInput): Promise<Session> {
  const { data } = await httpClient.post<Session>("/auth/login", input);
  return data;
}

export async function register(input: RegisterInput): Promise<Session> {
  const { data } = await httpClient.post<Session>("/auth/register", input);
  return data;
}

export async function demoLogin(personaId: string): Promise<Session> {
  const { data } = await httpClient.post<Session>("/auth/demo-login", {
    personaId,
  });
  return data;
}

export async function switchAgency(agencyId: string): Promise<Session> {
  const { data } = await httpClient.post<Session>("/auth/context", {
    agencyId,
  });
  return data;
}

export async function logout(): Promise<void> {
  await httpClient.post("/auth/logout");
}

export async function changePassword(
  input: PasswordChangeInput,
): Promise<void> {
  await httpClient.post("/auth/password", input);
}
