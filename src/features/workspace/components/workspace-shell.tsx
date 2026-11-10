"use client";

import { useIsMutating } from "@tanstack/react-query";
import { Avatar, Button, Select } from "flowbite-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Feedback } from "@/components/ui/feedback";
import { isMockMode } from "@/lib/mock-mode";
import { useDemoSessionChange, useSession } from "../../auth/auth.hooks";
import type { Workspace } from "../../auth/auth.types";

const workspaceLabels: Record<Workspace, string> = {
  candidate: "Candidate workspace",
  staff: "Staff workspace",
  platform: "Platform workspace",
};

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const change = useDemoSessionChange();
  const switching = useIsMutating({ mutationKey: ["session-change"] }) > 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const segment = pathname.split("/")[1];
  const workspace: Workspace =
    segment === "staff" || segment === "platform" ? segment : "candidate";
  const current = session.data;
  const matches = current?.user.workspace === workspace;

  return (
    <div className="workspace-frame">
      <aside className={`sidebar${menuOpen ? " sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Brand light />
          <button
            className="mobile-close"
            type="button"
            onClick={() => setMenuOpen(false)}
          >
            Close
          </button>
        </div>
        <div className="sidebar-section-label">YOUR WORKSPACE</div>
        <div className="sidebar-workspace">
          <span className="workspace-monogram" aria-hidden="true">
            {workspace[0].toUpperCase()}
          </span>
          <div>
            {workspaceLabels[workspace]}
            <span>Development preview</span>
          </div>
        </div>
        <nav
          aria-label="Workspace navigation"
          onClick={() => setMenuOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setMenuOpen(false);
          }}
        >
          <Link
            className="nav-item nav-active"
            href={`/${workspace}`}
            aria-current="page"
          >
            <span aria-hidden="true">◫</span> Overview{" "}
            <span className="nav-arrow" aria-hidden="true">
              ↗
            </span>
          </Link>
          <Link className="nav-item" href={`/${workspace}#workflow`}>
            <span aria-hidden="true">⇄</span> Workflow map
          </Link>
          <Link className="nav-item" href={`/${workspace}#preview-states`}>
            <span aria-hidden="true">◉</span> Preview states
          </Link>
        </nav>
        <div className="sidebar-roadmap">
          <span className="sidebar-section-label">COMING NEXT</span>
          <p>
            Profiles, teams, jobs
            <br />
            and application updates.
          </p>
          <span className="sidebar-small">Built one workflow at a time.</span>
        </div>
        <div className="sidebar-footer">
          <span className="live-dot" /> Mock environment
          <p>
            Fictional records.
            <br />
            No external services connected.
          </p>
          <Link href="/demo">Change perspective ↗</Link>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="workspace-header">
          <div className="header-left">
            <button
              className="mobile-menu"
              type="button"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              Menu
            </button>
            <span className="breadcrumb">
              Workspace <span>/</span> Overview
            </span>
          </div>
          <div className="header-actions">
            <Badge tone="warning">Mock preview</Badge>
            <Link
              className="avatar avatar-small"
              href="/demo"
              aria-label="Choose demo perspective"
            >
              <Avatar
                rounded
                size="sm"
                placeholderInitials={
                  current
                    ? current.user.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                    : "JF"
                }
              />
            </Link>
          </div>
        </header>
        <div className="demo-banner">
          <span>
            <strong>You're exploring a demo.</strong> Changes are simulated and
            reset on reload.
          </span>
          <Link href="/demo">Switch perspective ↗</Link>
        </div>
        <main id="main-content" className="workspace-content">
          {!isMockMode() ? (
            <Feedback
              title="This demo is not enabled"
              action={
                <Link className="button" href="/">
                  Back to home
                </Link>
              }
            >
              Start pnpm dev:mock for the development preview. Real
              authentication will be connected in a later task.
            </Feedback>
          ) : session.isPending || switching ? (
            <Feedback
              kind="loading"
              title={
                switching
                  ? "Switching demo context…"
                  : "Opening your workspace…"
              }
            />
          ) : session.isError ? (
            <Feedback
              kind="error"
              title="Couldn't open your workspace"
              action={
                <Button
                  color="dark"
                  type="button"
                  onClick={() => session.refetch()}
                >
                  Try again
                </Button>
              }
            >
              {session.error.message}
            </Feedback>
          ) : !current ? (
            <Feedback
              title="Choose your perspective"
              action={
                <Link className="button" href="/demo">
                  Explore the demo ↗
                </Link>
              }
            >
              Start with a candidate, employee, supervisor, or platform
              perspective.
            </Feedback>
          ) : !matches ? (
            <Feedback
              title="This is a different workspace"
              action={
                <Link className="button" href={`/${current.user.workspace}`}>
                  Open your {current.user.label.toLowerCase()} workspace ↗
                </Link>
              }
            >
              Your current demo perspective is {current.user.label}. Use the
              perspective chooser to explore another view.
            </Feedback>
          ) : (
            <>
              <div className="context-bar">
                <span>
                  <span className="context-label">VIEWING AS</span>{" "}
                  {current.user.name} <Badge>{current.user.label}</Badge>
                </span>
                <label className="agency-picker" htmlFor="agency-select">
                  <span className="context-label">AGENCY</span>
                  <Select
                    id="agency-select"
                    aria-label="Demo agency"
                    value={current.agency.id}
                    disabled={
                      change.isPending || current.user.agencies.length === 1
                    }
                    onChange={(event) =>
                      change.mutate({
                        personaId: current.user.id,
                        agencyId: event.target.value,
                      })
                    }
                  >
                    {current.user.agencies.map((agency) => (
                      <option value={agency.id} key={agency.id}>
                        {agency.name}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>
              {change.isSuccess && (
                <output className="success-text">Demo context updated.</output>
              )}
              {change.isError && (
                <p className="error-text" role="alert">
                  {change.error.message}
                </p>
              )}
              {children}
              <footer className="workspace-footer">
                <span>Job Finder · Workspace foundation</span>
                <button
                  className="text-link"
                  type="button"
                  onClick={() =>
                    change.mutate(null, {
                      onSuccess: () => router.push("/demo"),
                    })
                  }
                  disabled={change.isPending}
                >
                  End demo session ↗
                </button>
              </footer>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
