export type Workspace = "candidate" | "staff" | "platform";
export type Role = "candidate" | "employee" | "supervisor" | "platform_admin";

export interface Agency {
  id: string;
  name: string;
}

export interface DemoPersona {
  id: string;
  name: string;
  role: Role;
  label: string;
  description: string;
  workspace: Workspace;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  label: string;
  workspace: Workspace;
  agencies: Agency[];
}

export interface Session {
  user: SessionUser;
  agency: Agency | null;
}

export interface LoginInput {
  email: string;
  password: string;
  agencyId?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
}
