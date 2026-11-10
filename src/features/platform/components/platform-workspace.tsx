"use client";

import { Button, Select } from "flowbite-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Feedback } from "@/components/ui/feedback";
import {
  IconArrowRight,
  IconBuilding,
  IconCheck,
  IconClock,
  IconLayers,
  IconPlug,
  IconShield,
  IconSparkle,
  IconUsers,
} from "@/components/ui/icons";
import { MetricStrip } from "@/components/ui/metric-strip";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { formatRelative } from "@/lib/format";
import { apiErrorMessage } from "@/lib/http.client";
import { usePlatformMutation, usePlatformWorkspace } from "../platform.hooks";
import type { AgencyStatus, PlatformIntegration } from "../platform.types";

const tabs = ["overview", "agencies", "integrations", "audit"] as const;
type Tab = (typeof tabs)[number];

const agencyTone: Record<string, "accent" | "warning" | "danger"> = {
  active: "accent",
  pending: "warning",
  suspended: "danger",
};

const integrationTone: Record<
  PlatformIntegration["status"],
  "accent" | "warning" | "danger" | "neutral"
> = {
  connected: "accent",
  syncing: "warning",
  error: "danger",
  disconnected: "neutral",
};

export function PlatformWorkspace() {
  const workspace = usePlatformWorkspace();
  const mutation = usePlatformMutation();
  const [tab, setTab] = useState<Tab>("overview");
  const [error, setError] = useState<string>();

  if (workspace.isPending) {
    return <PageSkeleton />;
  }

  if (workspace.isError) {
    return (
      <Feedback
        kind="error"
        title="We could not load the platform overview"
        action={<Button onClick={() => workspace.refetch()}>Try again</Button>}
      >
        {apiErrorMessage(workspace.error)}
      </Feedback>
    );
  }

  const data = workspace.data;
  const failing = data.integrations.filter((item) => item.status === "error");
  const healthy = failing.length === 0;

  function setAgencyStatus(agencyId: string, status: AgencyStatus) {
    setError(undefined);
    mutation.mutate(
      { agencyId, status },
      { onError: (cause) => setError(apiErrorMessage(cause)) },
    );
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Platform administration"
        title="Platform overview"
        description="Agencies, integrations, and the health of the whole workspace."
      />

      {error && (
        <Feedback kind="error" title="That change did not save">
          {error}
        </Feedback>
      )}

      <nav
        aria-label="Platform sections"
        className="flex gap-1 overflow-x-auto border-b border-slate-200"
      >
        {tabs.map((item) => {
          const count =
            item === "agencies"
              ? data.agencies.length
              : item === "integrations"
                ? data.integrations.length
                : item === "audit"
                  ? data.audit.length
                  : undefined;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`relative -mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-[13px] font-medium capitalize transition-colors ${
                tab === item
                  ? "border-emerald-700 text-ink"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-ink"
              }`}
              aria-current={tab === item ? "page" : undefined}
            >
              {item}
              {count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.5 font-mono text-[9px] ${
                    tab === item
                      ? "bg-lime text-forest-deep"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {tab === "overview" && (
        <div className="space-y-6">
          <section className="enter-delayed relative overflow-hidden rounded-2xl bg-forest-deep p-6 text-white sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lime/15 blur-3xl"
            />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime/80">
                  Platform health
                </p>
                <h2 className="display-title mt-3 max-w-xl text-[32px] leading-[1.05] sm:text-[38px]">
                  {healthy
                    ? "Everything is running."
                    : `${failing.length} integration${failing.length === 1 ? " needs" : "s need"} attention.`}
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/65">
                  {healthy
                    ? "All agencies and integrations are reporting normally. Audit history is up to date."
                    : "A failing integration can delay agency work. Review the integration details and reconnect it."}
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <Button
                    color="light"
                    onClick={() => setTab("integrations")}
                    className="!border-transparent !bg-lime !text-forest-deep hover:!bg-[#e4fa87]"
                  >
                    Review integrations
                    <IconArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Link
                    href="#audit"
                    onClick={() => setTab("audit")}
                    className="inline-flex items-center rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/75 transition-colors hover:border-white/30 hover:text-white"
                  >
                    Open audit log
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-3">
                <div className="bg-forest-deep/80 px-5 py-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                    Health
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-lime">
                    <IconShield className="h-4 w-4" />
                    {data.stats.health}
                  </p>
                </div>
                <div className="bg-forest-deep/80 px-5 py-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                    Connected
                  </p>
                  <p className="metric-value mt-2 text-2xl font-semibold">
                    {
                      data.integrations.filter((i) => i.status === "connected")
                        .length
                    }
                  </p>
                </div>
                <div className="col-span-2 bg-forest-deep/80 px-5 py-4 sm:col-span-1">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                    Failing
                  </p>
                  <p className="metric-value mt-2 text-2xl font-semibold">
                    {failing.length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <MetricStrip
            metrics={[
              {
                label: "Agencies",
                value: data.stats.agencies,
                hint: "Across every region",
                icon: <IconBuilding className="h-3.5 w-3.5" />,
                tone: "accent",
              },
              {
                label: "Users",
                value: data.stats.users,
                hint: "All accounts in the platform",
                icon: <IconUsers className="h-3.5 w-3.5" />,
              },
              {
                label: "Integrations",
                value: data.stats.integrations,
                hint: `${failing.length} reporting an error`,
                icon: <IconPlug className="h-3.5 w-3.5" />,
              },
              {
                label: "Platform health",
                value: data.stats.health,
                hint: "Derived from integration status",
                icon: <IconCheck className="h-3.5 w-3.5" />,
              },
            ]}
          />

          <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-[15px] font-semibold text-ink">
                    Agency footprint
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Who is working inside the platform.
                  </p>
                </div>
                <Button
                  color="light"
                  size="sm"
                  onClick={() => setTab("agencies")}
                >
                  Manage
                </Button>
              </div>
              <ul className="divide-y divide-slate-200">
                {data.agencies.map((agency) => (
                  <li
                    key={agency.id}
                    className="flex items-center justify-between gap-3 px-6 py-3.5 transition-colors hover:bg-slate-50/70"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 font-mono text-[10px] font-semibold text-emerald-800">
                        {agency.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-ink">
                          {agency.name}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {agency.region} · {agency.users} users
                        </p>
                      </div>
                    </div>
                    <Badge tone={agencyTone[agency.status] ?? "neutral"} dot>
                      {agency.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>

            <div className="space-y-6">
              <section className="panel overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                  <div>
                    <h2 className="text-[15px] font-semibold text-ink">
                      Integrations
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      External services, all simulated.
                    </p>
                  </div>
                  <Badge tone={healthy ? "accent" : "danger"} dot>
                    {healthy ? "Healthy" : "Degraded"}
                  </Badge>
                </div>
                <ul className="divide-y divide-slate-200">
                  {data.integrations.map((integration) => (
                    <li
                      key={integration.id}
                      className="flex items-center justify-between gap-3 px-6 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-ink">
                          {integration.name}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {integration.type} · {integration.lastSync}
                        </p>
                      </div>
                      <Badge tone={integrationTone[integration.status]} dot>
                        {integration.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="panel p-6">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime text-forest-deep">
                    <IconSparkle className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-[13px] font-semibold text-ink">
                      Platform note
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Integrations are simulated for this prototype. Agency
                      status changes are real and audit logged.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <section id="audit" className="panel overflow-hidden scroll-mt-24">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-[15px] font-semibold text-ink">
                  Recent audit events
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  The last actions taken across the platform.
                </p>
              </div>
              <Button color="light" size="sm" onClick={() => setTab("audit")}>
                View all
              </Button>
            </div>
            <ul className="divide-y divide-slate-200">
              {data.audit.slice(0, 5).map((event) => (
                <li
                  key={event.id}
                  className="flex items-center gap-3 px-6 py-3.5"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-emerald-700">
                    <IconClock className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink">
                      {event.event}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {event.actor} · {formatRelative(event.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === "agencies" && (
        <section className="panel overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                {[
                  "Agency",
                  "Region",
                  "Users",
                  "Integrations",
                  "Status",
                  "Change status",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.agencies.map((agency) => (
                <tr
                  key={agency.id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-6 py-4 text-[13px] font-semibold text-ink">
                    {agency.name}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-600">
                    {agency.region}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-600">
                    {agency.users}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-600">
                    {agency.integrations}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={agencyTone[agency.status] ?? "neutral"} dot>
                      {agency.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Select
                      sizing="sm"
                      value={agency.status}
                      onChange={(event) =>
                        setAgencyStatus(
                          agency.id,
                          event.target.value as AgencyStatus,
                        )
                      }
                      disabled={mutation.isPending}
                      aria-label={`Status for ${agency.name}`}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === "integrations" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.integrations.map((integration) => (
            <article key={integration.id} className="panel panel-hover p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-emerald-700">
                    <IconLayers className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-[14px] font-semibold text-ink">
                      {integration.name}
                    </h2>
                    <p className="text-xs text-slate-500">{integration.type}</p>
                  </div>
                </div>
                <Badge tone={integrationTone[integration.status]} dot>
                  {integration.status}
                </Badge>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                <p className="text-[11px] text-slate-500">
                  Last sync: {integration.lastSync}
                </p>
                <Badge tone="neutral">Simulated</Badge>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === "audit" && (
        <section className="panel p-6">
          <ol className="relative space-y-6 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-slate-200">
            {data.audit.map((event) => (
              <li key={event.id} className="relative flex gap-4">
                <span className="relative z-10 mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-slate-200 bg-surface text-emerald-700">
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-ink">
                      {event.event}
                    </p>
                    <p className="font-mono text-[10px] text-slate-400">
                      {formatRelative(event.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{event.detail}</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {event.actor}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
