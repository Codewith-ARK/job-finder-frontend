"use client";

import { Button } from "flowbite-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Feedback } from "@/components/ui/feedback";
import { useSession } from "../../auth/auth.hooks";
import type { Workspace } from "../../auth/auth.types";
import { useWorkspaceOverview } from "../workspace.hooks";
import type { PreviewState } from "../workspace.types";

const introductions: Record<Workspace, { title: string; description: string }> =
  {
    candidate: {
      title: "Your next chapter starts here.",
      description:
        "A little clarity for every step of your job search. This is the foundation of your candidate workspace.",
    },
    staff: {
      title: "Good work starts together.",
      description:
        "One shared space for your agency's people, opportunities, and progress. This is the staff workspace foundation.",
    },
    platform: {
      title: "A wider view of what's ahead.",
      description:
        "The starting point for the platform experience. Administration screens will follow the core workflow review.",
    },
  };

const journey = [
  {
    number: "01",
    title: "Get to know the candidate",
    note: "Onboarding & profile",
    workspace: "Candidate",
    task: "T02.1",
  },
  {
    number: "02",
    title: "Bring the right team together",
    note: "Review & assignment",
    workspace: "Supervisor",
    task: "T02.2",
  },
  {
    number: "03",
    title: "Move opportunities forward",
    note: "Jobs & application updates",
    workspace: "Employee",
    task: "T02.3",
  },
  {
    number: "04",
    title: "Keep everyone in the loop",
    note: "Candidate sees the update",
    workspace: "Candidate",
    task: "T02.3",
  },
];

export function WorkspaceOverview({ workspace }: { workspace: Workspace }) {
  const { data: session } = useSession();
  const [state, setState] = useState<PreviewState>("ready");
  const overview = useWorkspaceOverview(workspace, state);
  const introduction = introductions[workspace];

  return (
    <>
      <section className="overview-heading">
        <div>
          <p className="eyebrow">A SPACE TO MOVE FORWARD</p>
          <h1>{introduction.title}</h1>
          <p>{introduction.description}</p>
        </div>
        <span className="heading-art" aria-hidden="true">
          ↗
        </span>
      </section>
      <section className="foundation-card">
        <div>
          <Badge tone="accent">Foundation ready</Badge>
          <h2>
            The space is ready.
            <br />
            The workflows come next.
          </h2>
          <p>
            Explore the navigation, switch demo perspectives, and preview how
            different UI states feel.
          </p>
          <a className="button button-dark" href="#workflow">
            See the workflow map <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="foundation-visual" aria-hidden="true">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="visual-center">jf↗</span>
          <span className="visual-label visual-label-top">People</span>
          <span className="visual-label visual-label-bottom">
            Possibilities
          </span>
        </div>
      </section>

      <section
        className="modules-section"
        id="preview-states"
        aria-labelledby="modules-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h2 id="modules-title">Room for what's next</h2>
          </div>
          <Badge>
            {overview.data?.agencyName ??
              session?.agency.name ??
              "Demo workspace"}
          </Badge>
        </div>
        <div className="preview-controls">
          <span>Preview a UI state</span>
          <fieldset aria-label="Preview UI state">
            {(["ready", "loading", "empty", "error"] as const).map((value) => (
              <Button
                color="light"
                key={value}
                type="button"
                aria-pressed={state === value}
                onClick={() => {
                  setState(value);
                  if (state === value) void overview.refetch();
                }}
              >
                {value === "ready"
                  ? "Populated"
                  : value[0].toUpperCase() + value.slice(1)}
              </Button>
            ))}
          </fieldset>
        </div>
        {overview.isPending || (state === "loading" && overview.isFetching) ? (
          <Feedback kind="loading" title="Loading the workspace preview…">
            Your workspace navigation stays available while data loads.
          </Feedback>
        ) : overview.isError ? (
          <Feedback
            kind="error"
            title="We couldn't load this preview"
            action={
              <Button
                color="dark"
                type="button"
                onClick={() => setState("ready")}
              >
                Recover preview ↗
              </Button>
            }
          >
            {overview.error.message}
          </Feedback>
        ) : overview.data.modules.length === 0 ? (
          <Feedback
            title="A little room to grow"
            action={
              <Button
                color="dark"
                type="button"
                onClick={() => setState("ready")}
              >
                Show preview modules ↗
              </Button>
            }
          >
            This is the empty state. Nothing has been deleted; the populated
            preview is one click away.
          </Feedback>
        ) : (
          <>
            <output className="sr-only">
              Workspace preview loaded successfully.
            </output>
            <div className="module-grid">
              {overview.data.modules.map((module, index) => (
                <article className="module-card" key={module.id}>
                  <div className="module-top">
                    <span className="module-number">0{index + 1}</span>
                    <Badge>{module.status}</Badge>
                  </div>
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                  <span className="module-task">Coming in {module.task}</span>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <section
        className="workflow-section"
        id="workflow"
        aria-labelledby="workflow-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE BIG PICTURE</p>
            <h2 id="workflow-title">One connected journey</h2>
          </div>
          <Badge>Planned workflow</Badge>
        </div>
        <p className="section-description">
          The next tasks will connect these steps through shared mock records.
          These are milestones to build, not completed actions.
        </p>
        <ol className="journey-grid">
          {journey.map((step) => (
            <li key={step.number}>
              <span className="journey-number">{step.number}</span>
              <span className="journey-role">{step.workspace}</span>
              <h3>{step.title}</h3>
              <p>{step.note}</p>
              <span className="module-task">{step.task} · Planned</span>
            </li>
          ))}
        </ol>
      </section>
      <div className="review-note">
        <span aria-hidden="true">↗</span>
        <p>
          <strong>Built to review, together.</strong> Roles and workflow
          assumptions are provisional. Explore another perspective before the
          next feature is built.
        </p>
        <Link className="text-link" href="/demo">
          Choose perspective ↗
        </Link>
      </div>
    </>
  );
}
