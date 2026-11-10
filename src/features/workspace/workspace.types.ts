export type PreviewState = "ready" | "empty" | "error" | "loading";

export interface WorkspaceModule {
  id: string;
  title: string;
  description: string;
  task: string;
  status: "Planned";
}

export interface WorkspaceOverview {
  agencyName: string;
  modules: WorkspaceModule[];
}
