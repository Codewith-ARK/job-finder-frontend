import type { Session } from "../auth/auth.types.ts";

export type PlatformTab = "overview" | "agencies" | "integrations" | "audit";

export interface PlatformData {
  session: Pick<Session, "user" | "agency">;
  stats: {
    agencies: number;
    users: number;
    integrations: number;
    health: string;
  };
  agencies: {
    id: string;
    name: string;
    region: string;
    users: number;
    status: "active" | "pending" | "suspended";
    integrations: string;
  }[];
  integrations: {
    id: string;
    name: string;
    type: string;
    status: "connected" | "syncing" | "error" | "disconnected";
    lastSync: string;
  }[];
  audit: {
    id: string;
    event: string;
    detail: string;
    actor: string;
    age: string;
  }[];
}
