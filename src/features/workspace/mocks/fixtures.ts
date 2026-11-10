import type { Workspace } from "../../auth/auth.types.ts";
import type { WorkspaceModule } from "../workspace.types.ts";

export const workspaceModules: Record<Workspace, WorkspaceModule[]> = {
  candidate: [
    {
      id: "profile",
      title: "Your profile",
      description:
        "Bring your experience, preferences, and documents together.",
      task: "T02.1",
      status: "Planned",
    },
    {
      id: "onboarding",
      title: "Getting started",
      description: "A guided introduction to your agency and next steps.",
      task: "T02.1",
      status: "Planned",
    },
    {
      id: "applications",
      title: "Your applications",
      description: "Follow progress and see updates from your team.",
      task: "T02.3",
      status: "Planned",
    },
    {
      id: "opportunities",
      title: "Opportunities",
      description: "A home for the roles your team is working on with you.",
      task: "T02.3",
      status: "Planned",
    },
  ],
  staff: [
    {
      id: "candidates",
      title: "Candidate workspace",
      description: "A shared view of the people your agency supports.",
      task: "T02.2",
      status: "Planned",
    },
    {
      id: "teams",
      title: "Teams & assignments",
      description: "Coordinate ownership, staff, and candidate assignments.",
      task: "T02.2",
      status: "Planned",
    },
    {
      id: "jobs",
      title: "Jobs",
      description: "Organise opportunities and keep job details up to date.",
      task: "T02.3",
      status: "Planned",
    },
    {
      id: "applications",
      title: "Application updates",
      description:
        "Record progress that candidates can follow in their workspace.",
      task: "T02.3",
      status: "Planned",
    },
  ],
  platform: [
    {
      id: "agencies",
      title: "Agency overview",
      description: "A future home for the platform's agency experience.",
      task: "T02.4",
      status: "Planned",
    },
    {
      id: "people",
      title: "People & access",
      description:
        "Preview administration flows after the core workflow review.",
      task: "T02.4",
      status: "Planned",
    },
    {
      id: "reporting",
      title: "Reporting",
      description:
        "Explore useful reporting screens with clearly simulated data.",
      task: "T02.4",
      status: "Planned",
    },
    {
      id: "integrations",
      title: "Integrations",
      description:
        "Review future connections. No external service is connected.",
      task: "T02.4",
      status: "Planned",
    },
  ],
};
