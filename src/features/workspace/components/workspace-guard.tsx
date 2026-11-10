"use client";

import { Spinner } from "flowbite-react";
import { Feedback } from "@/components/ui/feedback";
import { useSession } from "../../auth/auth.hooks";
import type { Workspace } from "../../auth/auth.types";

export function WorkspaceGuard({
  workspace,
  children,
}: {
  workspace: Workspace;
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center gap-3 py-16 text-sm text-slate-600">
        <Spinner size="sm" /> Loading…
      </div>
    );
  }

  if (!session) return null;

  if (session.user.workspace !== workspace) {
    return (
      <Feedback
        kind="error"
        title="This workspace isn't available for your account"
      >
        You are signed in as {session.user.label.toLowerCase()} (
        {session.user.email}). Use the navigation for your own workspace
        instead.
      </Feedback>
    );
  }

  return <>{children}</>;
}
