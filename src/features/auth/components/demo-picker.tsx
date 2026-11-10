"use client";

import { Button, Spinner } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { ActionButton } from "@/components/ui/action-button";
import { Badge } from "@/components/ui/badge";
import { Feedback } from "@/components/ui/feedback";
import {
  IconArrowRight,
  IconBriefcase,
  IconShield,
  IconUser,
  IconUsers,
} from "@/components/ui/icons";
import { apiErrorMessage } from "@/lib/http.client";
import { useDemoLogin, useDemoPersonas } from "../auth.hooks";
import type { DemoPersona } from "../auth.types";

const icons = {
  candidate: IconUser,
  employee: IconBriefcase,
  supervisor: IconUsers,
  platform_admin: IconShield,
} as const;

const roleTone = {
  candidate: "accent",
  employee: "info",
  supervisor: "warning",
  platform_admin: "neutral",
} as const;

export function DemoPicker() {
  const personas = useDemoPersonas();
  const demoLogin = useDemoLogin();
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string>();
  const [error, setError] = useState<string>();

  function enter(persona: DemoPersona) {
    setError(undefined);
    setPendingId(persona.id);
    demoLogin.mutate(persona.id, {
      onSuccess: (session) => {
        const home =
          session.user.workspace === "candidate"
            ? "/candidate"
            : session.user.workspace === "staff"
              ? "/staff"
              : "/platform";
        router.replace(home);
      },
      onError: (cause) => {
        setPendingId(undefined);
        setError(apiErrorMessage(cause));
      },
    });
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-slate-200 bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Brand />
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-ink"
          >
            Sign in with a password
          </Link>
        </div>
      </header>

      <main id="main-content">
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 lg:pt-20">
          <Badge tone="accent">Interactive demo</Badge>
          <h1 className="display-title mt-5 max-w-2xl text-[44px] leading-[1.02] text-ink sm:text-[58px]">
            Pick a perspective. See the whole workspace.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600">
            Each option signs you into a real seeded account. The API enforces
            that account's role and agency, and every perspective works from the
            same live records.
          </p>

          {error && (
            <div className="mt-8">
              <Feedback kind="error" title="Could not start the demo session">
                {error}
              </Feedback>
            </div>
          )}

          {personas.isPending && (
            <div className="mt-10 flex items-center gap-3 text-sm text-slate-600">
              <Spinner size="sm" /> Loading demo accounts…
            </div>
          )}

          {personas.isError && (
            <div className="mt-8">
              <Feedback
                kind="error"
                title="Demo sign-in is not available"
                action={
                  <Button color="light" as={Link} href="/login">
                    Use the sign-in form
                  </Button>
                }
              >
                {apiErrorMessage(personas.error)}
              </Feedback>
            </div>
          )}

          {personas.data && personas.data.length === 0 && (
            <div className="mt-8">
              <Feedback kind="info" title="No demo accounts are seeded">
                Run the backend seed command to create the demo dataset.
              </Feedback>
            </div>
          )}
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            {personas.data?.map((persona, index) => {
              const Icon = icons[persona.role];
              return (
                <article
                  key={persona.id}
                  className="panel panel-hover group flex flex-col p-6"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                        persona.role === "candidate"
                          ? "bg-lime text-forest-deep"
                          : "bg-forest text-lime"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <Badge tone={roleTone[persona.role]}>{persona.label}</Badge>
                  </div>
                  <h2 className="mt-6 text-[17px] font-semibold text-ink">
                    {persona.name}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {persona.description}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400">
                      Seeded account
                    </span>
                    <ActionButton
                      color="light"
                      size="sm"
                      onClick={() => enter(persona)}
                      disabled={demoLogin.isPending}
                      pending={pendingId === persona.id}
                    >
                      Sign in as {persona.name.split(" ")[0]}
                      <IconArrowRight className="ml-2 h-3.5 w-3.5" />
                    </ActionButton>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Demo accounts use the shared password <code>Demo1234!</code>.
            </p>
            <p>
              Seeded data is development-safe. Disable demo sign-in in
              production.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
