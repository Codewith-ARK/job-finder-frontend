import { mockRequest } from "../../../lib/mocks/request.ts";
import { readMockSession } from "../../../lib/mocks/state.ts";
import type { Session } from "../../auth/auth.types.ts";
import type { PlatformData } from "../platform.types.ts";

export function getPlatformMock(session: Session, signal?: AbortSignal) {
  return mockRequest(() => {
    const current = readMockSession();
    if (
      current?.user.id !== session.user.id ||
      current.agency.id !== session.agency.id ||
      current.user.workspace !== "platform"
    )
      throw new Error(
        "The platform context changed. Choose the platform perspective again.",
      );
    const data: PlatformData = {
      session: { user: session.user, agency: session.agency },
      stats: { agencies: 12, users: 248, integrations: 8, health: "Healthy" },
      agencies: [
        {
          id: "agency-riverdale",
          name: "Riverdale Agency",
          region: "West",
          users: 42,
          status: "active",
          integrations: "3 / 3",
        },
        {
          id: "agency-lakeside",
          name: "Lakeside County",
          region: "Midwest",
          users: 28,
          status: "active",
          integrations: "2 / 3",
        },
        {
          id: "agency-pinecrest",
          name: "Pinecrest Services",
          region: "South",
          users: 18,
          status: "pending",
          integrations: "1 / 3",
        },
        {
          id: "agency-valley",
          name: "Valley Regional",
          region: "West",
          users: 0,
          status: "suspended",
          integrations: "0 / 3",
        },
      ],
      integrations: [
        {
          id: "integration-civic",
          name: "Civic Data Exchange",
          type: "Data provider",
          status: "connected",
          lastSync: "2 hours ago",
        },
        {
          id: "integration-storage",
          name: "Document Storage",
          type: "File storage",
          status: "connected",
          lastSync: "4 hours ago",
        },
        {
          id: "integration-email",
          name: "Email Service",
          type: "Communication",
          status: "syncing",
          lastSync: "In progress",
        },
        {
          id: "integration-payments",
          name: "Payment Processor",
          type: "Payments",
          status: "error",
          lastSync: "3 hours ago",
        },
      ],
      audit: [
        {
          id: "audit-login",
          event: "User login",
          detail: "Admin user signed in",
          actor: "Alex Chen",
          age: "2 minutes ago",
        },
        {
          id: "audit-agency",
          event: "Agency updated",
          detail: "Updated agency settings for Lakeside County",
          actor: "Jordan Kim",
          age: "15 minutes ago",
        },
        {
          id: "audit-sync",
          event: "Integration sync",
          detail: "Civic Data Exchange sync completed",
          actor: "System",
          age: "1 hour ago",
        },
        {
          id: "audit-error",
          event: "Integration error",
          detail: "Payment Processor returned an error",
          actor: "System",
          age: "3 hours ago",
        },
      ],
    };
    return data;
  }, signal);
}
