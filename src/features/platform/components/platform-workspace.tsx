"use client";

import {
  Alert,
  Button,
  Card,
  Badge as FlowbiteBadge,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Feedback } from "@/components/ui/feedback";
import {
  IconBuilding,
  IconLayers,
  IconPlug,
  IconShield,
  IconUsers,
} from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
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
    return (
      <Feedback kind="loading" title="Loading the platform">
        Fetching agencies, integrations, and audit history.
      </Feedback>
    );
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

  function setAgencyStatus(agencyId: string, status: AgencyStatus) {
    setError(undefined);
    mutation.mutate(
      { agencyId, status },
      { onError: (cause) => setError(apiErrorMessage(cause)) },
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Platform administration"
        title="Platform overview"
        description="A read-mostly view of agencies and simulated integrations. Platform administrators have no agency workspace."
      />

      {error && (
        <Alert color="failure" role="alert">
          {error}
        </Alert>
      )}

      <div className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === item
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            aria-current={tab === item ? "page" : undefined}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Agencies"
              value={data.stats.agencies}
              hint="Across every region"
              icon={<IconBuilding />}
            />
            <StatCard
              label="Users"
              value={data.stats.users}
              hint="All accounts in the platform"
              icon={<IconUsers />}
            />
            <StatCard
              label="Integrations"
              value={data.stats.integrations}
              hint={`${failing.length} reporting an error`}
              icon={<IconPlug />}
            />
            <StatCard
              label="Platform health"
              value={data.stats.health}
              hint="Derived from integration status"
              icon={<IconShield />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="text-base font-semibold text-slate-900">
                Integration status
              </h2>
              <ul className="mt-4 space-y-3">
                {data.integrations.map((integration) => (
                  <li
                    key={integration.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {integration.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {integration.type} · {integration.lastSync}
                      </p>
                    </div>
                    <Badge tone={integrationTone[integration.status]}>
                      {integration.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="text-base font-semibold text-slate-900">
                Recent audit events
              </h2>
              <ul className="mt-4 space-y-3">
                {data.audit.slice(0, 5).map((event) => (
                  <li key={event.id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-300" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {event.event}
                      </p>
                      <p className="text-xs text-slate-500">
                        {event.actor} · {formatRelative(event.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {tab === "agencies" && (
        <Card className="overflow-x-auto p-0">
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell>Agency</TableHeadCell>
                <TableHeadCell>Region</TableHeadCell>
                <TableHeadCell>Users</TableHeadCell>
                <TableHeadCell>Integrations</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Change status</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {data.agencies.map((agency) => (
                <TableRow key={agency.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">{agency.name}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-700">
                      {agency.region}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-700">
                      {agency.users}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-700">
                      {agency.integrations}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge tone={agencyTone[agency.status] ?? "neutral"}>
                      {agency.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {tab === "integrations" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.integrations.map((integration) => (
            <Card key={integration.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                    <IconLayers className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      {integration.name}
                    </h2>
                    <p className="text-xs text-slate-500">{integration.type}</p>
                  </div>
                </div>
                <Badge tone={integrationTone[integration.status]}>
                  {integration.status}
                </Badge>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Last sync: {integration.lastSync} ·{" "}
                <FlowbiteBadge color="gray" className="ml-1">
                  Simulated
                </FlowbiteBadge>
              </p>
            </Card>
          ))}
        </div>
      )}

      {tab === "audit" && (
        <Card className="overflow-x-auto p-0">
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell>Event</TableHeadCell>
                <TableHeadCell>Detail</TableHeadCell>
                <TableHeadCell>Actor</TableHeadCell>
                <TableHeadCell>Time</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {data.audit.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">{event.event}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-700">
                      {event.detail}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-700">
                      {event.actor}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="whitespace-nowrap text-sm text-slate-600">
                      {formatRelative(event.createdAt)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
