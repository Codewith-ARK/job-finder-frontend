export type Workspace = "candidate" | "staff" | "platform";
export type DemoRole =
  | "candidate"
  | "employee"
  | "supervisor"
  | "platform-admin";

export interface Agency {
  id: string;
  name: string;
}

export interface DemoPersona {
  id: string;
  name: string;
  role: DemoRole;
  label: string;
  description: string;
  workspace: Workspace;
  agencies: Agency[];
}

export interface Session {
  user: Omit<DemoPersona, "description">;
  agency: Agency;
}
