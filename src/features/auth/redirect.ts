import type { Session } from "./auth.types";

export function workspaceHome(session: Session): string {
  switch (session.user.workspace) {
    case "candidate":
      return "/candidate";
    case "staff":
      return "/staff";
    case "platform":
      return "/platform";
  }
}

export function safeRedirect(
  next: string | undefined,
  session: Session,
): string {
  if (next?.startsWith("/") && !next.startsWith("//")) return next;
  return workspaceHome(session);
}
