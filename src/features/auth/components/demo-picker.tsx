"use client";

import { Badge, Button, Card, Spinner } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { ActionButton } from "@/components/ui/action-button";
import { Feedback } from "@/components/ui/feedback";
import {
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
  candidate: "success",
  employee: "info",
  supervisor: "purple",
  platform_admin: "dark",
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
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Brand />
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Sign in with a password
          </Link>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Badge color="green" className="w-fit">
          Interactive demo
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Choose a perspective
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          Each option signs you into a real seeded account. The API enforces
          that account's role and agency, and the workspace is populated with
          the same records every perspective sees.
        </p>

        {error && (
          <div className="mt-6">
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {personas.data?.map((persona) => {
            const Icon = icons[persona.role];
            return (
              <Card key={persona.id} className="flex flex-col">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-slate-900">
                        {persona.name}
                      </h2>
                      <Badge color={roleTone[persona.role]} className="w-fit">
                        {persona.label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {persona.description}
                    </p>
                    <ActionButton
                      className="mt-4"
                      color="green"
                      size="sm"
                      onClick={() => enter(persona)}
                      disabled={demoLogin.isPending}
                      pending={pendingId === persona.id}
                    >
                      Sign in as {persona.name.split(" ")[0]}
                    </ActionButton>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <p className="mt-10 text-xs text-slate-500">
          Demo accounts use the shared password <code>Demo1234!</code>. Seeded
          data is development-safe; configure real accounts and disable demo
          sign-in for any deployment.
        </p>
      </main>
    </div>
  );
}
