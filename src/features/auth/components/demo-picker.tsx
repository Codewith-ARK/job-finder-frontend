"use client";

import { Avatar, Button, Card } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Feedback } from "@/components/ui/feedback";
import { isMockMode } from "@/lib/mock-mode";
import { useDemoPersonas, useDemoSessionChange } from "../auth.hooks";

export function DemoPicker() {
  const personas = useDemoPersonas();
  const change = useDemoSessionChange();
  const router = useRouter();
  return (
    <div className="demo-page">
      <header className="public-header">
        <Brand />
        <Link className="text-link" href="/">
          Back to home ↗
        </Link>
      </header>
      <main className="demo-content" id="main-content">
        <Badge tone="warning">Interactive demo · T01 foundation</Badge>
        <h1>
          One platform.
          <br />
          <span className="muted">A few perspectives.</span>
        </h1>
        <p className="intro">
          Choose a demo workspace to explore the foundation. All people and
          agencies are fictional; no account is created.
        </p>
        {!isMockMode() ? (
          <Feedback title="The demo is turned off">
            Run the frontend with pnpm dev:mock to explore the development
            preview. Real sign-in is not connected yet.
          </Feedback>
        ) : personas.isPending ? (
          <Feedback kind="loading" title="Preparing demo perspectives…" />
        ) : personas.isError ? (
          <Feedback
            kind="error"
            title="Couldn't load the demo"
            action={
              <Button
                color="dark"
                type="button"
                onClick={() => personas.refetch()}
              >
                Try again
              </Button>
            }
          >
            {personas.error.message}
          </Feedback>
        ) : (
          <div className="persona-grid" aria-busy={change.isPending}>
            {personas.data.map((persona, index) => (
              <Card
                key={persona.id}
                role="button"
                tabIndex={change.isPending ? -1 : 0}
                aria-disabled={change.isPending}
                onClick={() =>
                  change.mutate(
                    { personaId: persona.id },
                    { onSuccess: () => router.push(`/${persona.workspace}`) },
                  )
                }
              >
                <span className="persona-top">
                  <Avatar
                    rounded
                    placeholderInitials={persona.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  />
                  <span className="index">0{index + 1}</span>
                </span>
                <span className="persona-role">{persona.label}</span>
                <span className="persona-description">
                  {persona.description}
                </span>
                <span className="persona-bottom">
                  Explore as {persona.name.split(" ")[0]}{" "}
                  <span aria-hidden="true">↗</span>
                </span>
                <Button color="light" size="sm" disabled={change.isPending}>
                  Explore as {persona.name.split(" ")[0]}{" "}
                  <span aria-hidden="true">â†—</span>
                </Button>
              </Card>
            ))}
          </div>
        )}
        {change.isPending && <output>Opening your demo workspace…</output>}
        {change.isError && (
          <p className="error-text" role="alert">
            {change.error.message}
          </p>
        )}
        <p className="fine-print">
          Presentation only. Demo roles do not grant real permissions. Reloading
          resets the demo session.
        </p>
      </main>
    </div>
  );
}
