"use client";

import {
  Alert,
  Button,
  Card,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  TextInput,
} from "flowbite-react";
import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Feedback } from "@/components/ui/feedback";
import { IconLink } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { formatRelative } from "@/lib/format";
import { apiErrorMessage } from "@/lib/http.client";
import { useSession } from "../../auth/auth.hooks";
import {
  useReferralLinks,
  useReferralMutation,
} from "../../referrals/referrals.hooks";
import type {
  ReferralCreated,
  ReferralLink,
  ReferralStatus,
} from "../../referrals/referrals.types";

const EXPIRY_OPTIONS = [1, 3, 7, 14, 30];

const statusTone: Record<ReferralStatus, "accent" | "neutral" | "warning"> = {
  active: "accent",
  used: "neutral",
  expired: "warning",
  revoked: "neutral",
};

function statusLabel(status: ReferralStatus): string {
  return status === "active"
    ? "Active"
    : status === "used"
      ? "Used"
      : status === "expired"
        ? "Expired"
        : "Revoked";
}

function fullLink(path: string): string {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function StaffReferrals() {
  const links = useReferralLinks();
  const mutation = useReferralMutation();
  const { data: session } = useSession();
  const [label, setLabel] = useState("");
  const [days, setDays] = useState(7);
  const [created, setCreated] = useState<ReferralCreated>();
  const [copied, setCopied] = useState(false);
  const [pendingRevoke, setPendingRevoke] = useState<ReferralLink>();
  const [error, setError] = useState<string>();

  if (links.isPending) {
    return (
      <Feedback kind="loading" title="Loading referral links">
        Fetching the links your agency has created.
      </Feedback>
    );
  }

  if (links.isError) {
    return (
      <Feedback
        kind="error"
        title="We could not load referral links"
        action={<Button onClick={() => links.refetch()}>Try again</Button>}
      >
        {apiErrorMessage(links.error)}
      </Feedback>
    );
  }

  const isSupervisor = session?.user.role === "supervisor";
  const items = links.data;

  function create() {
    setError(undefined);
    mutation.mutate(
      { type: "create", input: { label: label.trim(), expiresInDays: days } },
      {
        onSuccess: (result) => {
          if (!Array.isArray(result)) {
            setCreated(result);
            setCopied(false);
            setLabel("");
          }
        },
        onError: (cause) => setError(apiErrorMessage(cause)),
      },
    );
  }

  async function copy() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(fullLink(created.path));
      setCopied(true);
    } catch {
      setCopied(false);
      setError("Could not copy automatically. Select the link and copy it.");
    }
  }

  function revoke() {
    if (!pendingRevoke) return;
    setError(undefined);
    mutation.mutate(
      { type: "revoke", linkId: pendingRevoke.id },
      {
        onSuccess: () => setPendingRevoke(undefined),
        onError: (cause) => {
          setPendingRevoke(undefined);
          setError(apiErrorMessage(cause));
        },
      },
    );
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Agency workspace"
        title="Referral links"
        description="Invite a candidate to your agency. Every link works once, expires automatically, and assigns the candidate to the person who created it."
      />

      {error && (
        <Alert color="failure" role="alert">
          {error}
        </Alert>
      )}

      {created && (
        <Alert color="green">
          <p className="font-medium">
            Referral link ready
            {created.link.label ? ` · ${created.link.label}` : ""}.
          </p>
          <p className="mt-1 text-xs">
            Expires {formatRelative(created.link.expiresAt)} · single use
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 break-all rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-xs text-slate-700">
              {fullLink(created.path)}
            </code>
            <Button color="light" size="xs" onClick={copy}>
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button
              color="light"
              size="xs"
              onClick={() => setCreated(undefined)}
            >
              Dismiss
            </Button>
          </div>
          <p className="mt-2 text-xs">
            This is the only time the full link is shown. Copy it now.
          </p>
        </Alert>
      )}

      <Card>
        <div className="flex items-center gap-2">
          <IconLink className="h-4 w-4 text-emerald-700" />
          <h2 className="text-base font-semibold text-ink">
            Create a referral link
          </h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {isSupervisor
            ? "You can see every link created in this agency, including links created by your team."
            : "You can see and revoke the links you created."}
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="referral-label">Label</Label>
            </div>
            <TextInput
              id="referral-label"
              value={label}
              maxLength={120}
              placeholder="Design hiring — October"
              onChange={(event) => setLabel(event.target.value)}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="referral-expiry">Expires in</Label>
            </div>
            <Select
              id="referral-expiry"
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
            >
              {EXPIRY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} {option === 1 ? "day" : "days"}
                </option>
              ))}
            </Select>
          </div>
          <ActionButton
            color="green"
            onClick={create}
            disabled={mutation.isPending}
            pending={
              mutation.isPending && mutation.variables?.type === "create"
            }
          >
            Create link
          </ActionButton>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Your links</h2>
            <p className="mt-1 text-sm text-slate-600">
              {isSupervisor
                ? "All referral links for this agency."
                : "Links you created for this agency."}
            </p>
          </div>
          <Badge tone="neutral">{items.length} total</Badge>
        </div>

        {items.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={<IconLink className="h-5 w-5" />}
              title="No referral links yet"
              description="Create a link above and share it with one candidate. It stops working after the first signup."
            />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200">
            {items.map((link) => (
              <li
                key={link.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {link.label || "Untitled referral"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Created by {link.createdByName || "—"} ·{" "}
                    <span className="font-mono">
                      {link.tokenHint}
                      •••
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {link.status === "active"
                      ? `Expires ${formatRelative(link.expiresAt)}`
                      : link.status === "used"
                        ? `Used ${link.usedAt ? formatRelative(link.usedAt) : ""}`
                        : link.status === "expired"
                          ? `Expired ${formatRelative(link.expiresAt)}`
                          : `Revoked ${link.revokedAt ? formatRelative(link.revokedAt) : ""}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone[link.status]}>
                    {statusLabel(link.status)}
                  </Badge>
                  {link.status === "active" && (
                    <ActionButton
                      color="red"
                      size="xs"
                      outline
                      onClick={() => setPendingRevoke(link)}
                    >
                      Revoke
                    </ActionButton>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        show={Boolean(pendingRevoke)}
        size="md"
        onClose={() => setPendingRevoke(undefined)}
      >
        <ModalHeader>Revoke referral link</ModalHeader>
        <ModalBody>
          <p className="text-sm text-slate-600">
            {pendingRevoke?.label
              ? `“${pendingRevoke.label}” will stop working immediately.`
              : "This link will stop working immediately."}{" "}
            Candidates who have already signed up are not affected.
          </p>
        </ModalBody>
        <ModalFooter>
          <ActionButton
            color="red"
            onClick={revoke}
            pending={mutation.isPending}
          >
            Revoke link
          </ActionButton>
          <Button color="light" onClick={() => setPendingRevoke(undefined)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
