export interface PlatformStats {
  agencies: number;
  users: number;
  integrations: number;
  health: string;
}

export type AgencyStatus = "active" | "pending" | "suspended";

export interface PlatformAgency {
  id: string;
  name: string;
  region: string;
  users: number;
  status: AgencyStatus;
  integrations: string;
}

export interface PlatformIntegration {
  id: string;
  name: string;
  type: string;
  status: "connected" | "syncing" | "error" | "disconnected";
  lastSync: string;
}

export interface PlatformAudit {
  id: string;
  event: string;
  detail: string;
  actor: string;
  createdAt: string;
}

export interface PlatformData {
  stats: PlatformStats;
  agencies: PlatformAgency[];
  integrations: PlatformIntegration[];
  audit: PlatformAudit[];
}
