"use client";

import {
  Alert,
  Button,
  Card,
  Badge as FlowbiteBadge,
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
import { usePlatformWorkspace } from "../platform.hooks.ts";
import type { PlatformTab } from "../platform.types.ts";

export function PlatformWorkspace() {
  const workspace = usePlatformWorkspace();
  const [tab, setTab] = useState<PlatformTab>("overview");
  if (workspace.isPending)
    return (
      <Feedback kind="loading" title="Loading platform overview">
        Agency, integration, and audit records are loading.
      </Feedback>
    );
  if (workspace.isError)
    return (
      <Feedback
        kind="error"
        title="We couldn't load the platform overview"
        action={
          <Button color="dark" onClick={() => workspace.refetch()}>
            Try again
          </Button>
        }
      >
        {workspace.error.message}
      </Feedback>
    );
  if (!workspace.data)
    return (
      <Feedback title="Choose the platform perspective">
        Return to the perspective chooser to open platform administration.
      </Feedback>
    );
  const data = workspace.data;
  return (
    <div className="platform-workspace">
      <section className="staff-heading">
        <div>
          <p className="eyebrow">PLATFORM ADMINISTRATION</p>
          <h1>Platform overview</h1>
          <p>
            Monitor agencies, users, integrations, and recent activity from one
            place.
          </p>
        </div>
        <Badge tone="accent">{data.stats.health}</Badge>
      </section>
      <nav className="staff-tabs" aria-label="Platform sections">
        {(["overview", "agencies", "integrations", "audit"] as const).map(
          (item) => (
            <Button color="light" key={item} onClick={() => setTab(item)}>
              {item[0].toUpperCase() + item.slice(1)}
            </Button>
          ),
        )}
      </nav>
      {tab === "overview" && (
        <>
          <div className="staff-stat-grid">
            {[
              ["Agencies", data.stats.agencies],
              ["Users", data.stats.users],
              ["Integrations", data.stats.integrations],
              ["System health", data.stats.health],
            ].map(([label, value]) => (
              <Card key={label}>
                <p className="staff-stat-label">{label}</p>
                <strong className="staff-stat-value">{value}</strong>
                <span className="staff-stat-change">
                  Healthy platform signal
                </span>
              </Card>
            ))}
          </div>
          <div className="staff-overview-grid">
            <Card>
              <div className="staff-card-heading">
                <div>
                  <p className="eyebrow">SYSTEM HEALTH</p>
                  <h2>All services operational</h2>
                </div>
                <Badge tone="accent">99.9% uptime</Badge>
              </div>
              {[
                "Core platform",
                "API services",
                "Background jobs",
                "Database",
                "File storage",
              ].map((service) => (
                <div className="activity-row" key={service}>
                  <span className="activity-dot activity-success" />
                  <span>
                    <strong>{service}</strong>
                    <small>Operational</small>
                  </span>
                  <FlowbiteBadge color="success">Operational</FlowbiteBadge>
                </div>
              ))}
            </Card>
            <Card>
              <div className="staff-card-heading">
                <div>
                  <p className="eyebrow">INTEGRATION STATUS</p>
                  <h2>Connected services</h2>
                </div>
                <Badge>{data.integrations.length} tracked</Badge>
              </div>
              {data.integrations.map((item) => (
                <div className="activity-row" key={item.id}>
                  <span
                    className={`activity-dot activity-${item.status === "error" ? "warning" : item.status === "connected" ? "success" : "info"}`}
                  />
                  <span>
                    <strong>{item.name}</strong>
                    <small>
                      {item.type} · {item.lastSync}
                    </small>
                  </span>
                  <Badge
                    tone={item.status === "connected" ? "accent" : "warning"}
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </Card>
          </div>
        </>
      )}
      {tab === "agencies" && (
        <Card>
          <div className="staff-card-heading">
            <div>
              <p className="eyebrow">AGENCY DIRECTORY</p>
              <h2>Manage agencies</h2>
            </div>
            <Button color="dark">Add agency</Button>
          </div>
          <Table hoverable>
            <TableHead>
              <TableHeadCell>Agency</TableHeadCell>
              <TableHeadCell>Region</TableHeadCell>
              <TableHeadCell>Users</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Integrations</TableHeadCell>
            </TableHead>
            <TableBody>
              {data.agencies.map((agency) => (
                <TableRow key={agency.id}>
                  <TableCell>
                    <strong>{agency.name}</strong>
                  </TableCell>
                  <TableCell>{agency.region}</TableCell>
                  <TableCell>{agency.users}</TableCell>
                  <TableCell>
                    <Badge
                      tone={agency.status === "active" ? "accent" : "warning"}
                    >
                      {agency.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{agency.integrations}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      {tab === "integrations" && (
        <Card>
          <div className="staff-card-heading">
            <div>
              <p className="eyebrow">INTEGRATIONS</p>
              <h2>Connected services</h2>
            </div>
            <Button color="dark">Add integration</Button>
          </div>
          <Table hoverable>
            <TableHead>
              <TableHeadCell>Integration</TableHeadCell>
              <TableHeadCell>Type</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Last sync</TableHeadCell>
            </TableHead>
            <TableBody>
              {data.integrations.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <strong>{item.name}</strong>
                  </TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>
                    <Badge
                      tone={item.status === "connected" ? "accent" : "warning"}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.lastSync}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      {tab === "audit" && (
        <Card>
          <div className="staff-card-heading">
            <div>
              <p className="eyebrow">AUDIT ACTIVITY</p>
              <h2>Recent platform events</h2>
            </div>
            <Button color="light">Export</Button>
          </div>
          {data.audit.map((item) => (
            <div className="activity-row" key={item.id}>
              <span className="activity-dot activity-info" />
              <span>
                <strong>{item.event}</strong>
                <small>
                  {item.detail} · {item.actor}
                </small>
              </span>
              <time>{item.age}</time>
            </div>
          ))}
          <Alert color="info">
            Audit and reporting screens are mock previews until platform APIs
            are connected.
          </Alert>
        </Card>
      )}
    </div>
  );
}
