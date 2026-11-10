import assert from "node:assert/strict";
import test from "node:test";
import type { Session } from "../src/features/auth/auth.types.ts";
import { safeRedirect } from "../src/features/auth/redirect.ts";
import { candidateKeys } from "../src/features/candidates/candidate.keys.ts";
import { jobsKeys } from "../src/features/jobs/jobs.keys.ts";
import { platformKeys } from "../src/features/platform/platform.keys.ts";
import { staffKeys } from "../src/features/staff/staff.keys.ts";
import { formatBytes, formatRelative, initials } from "../src/lib/format.ts";
import { ApiError, apiErrorMessage } from "../src/lib/http.client.ts";

const candidateSession: Session = {
  user: {
    id: "user-1",
    name: "Aya Khan",
    email: "aya@demo.example.com",
    role: "candidate",
    label: "Candidate",
    workspace: "candidate",
    agencies: [{ id: "agency-1", name: "Northstar Careers" }],
  },
  agency: { id: "agency-1", name: "Northstar Careers" },
};

const staffSession: Session = {
  user: {
    id: "user-2",
    name: "Noor Ahmed",
    email: "noor@demo.example.com",
    role: "supervisor",
    label: "Supervisor",
    workspace: "staff",
    agencies: [
      { id: "agency-1", name: "Northstar Careers" },
      { id: "agency-2", name: "Harbor Talent" },
    ],
  },
  agency: { id: "agency-2", name: "Harbor Talent" },
};

test("API errors prefer FastAPI detail messages", () => {
  assert.equal(
    apiErrorMessage(new ApiError("That role is already closed.", 409)),
    "That role is already closed.",
  );
  assert.equal(
    apiErrorMessage({
      isAxiosError: true,
      response: { data: { detail: "Email or password is incorrect." } },
    }),
    "Email or password is incorrect.",
  );
  assert.equal(
    apiErrorMessage({
      isAxiosError: true,
      response: { data: { detail: [{ msg: "value is not a valid email" }] } },
    }),
    "value is not a valid email",
  );
  assert.match(
    apiErrorMessage({ isAxiosError: true, response: undefined }),
    /API is unreachable/,
  );
  assert.match(apiErrorMessage(new Error("boom")), /boom/);
});

test("private query keys are scoped by user, agency, and role", () => {
  assert.deepEqual(candidateKeys.workspace(candidateSession), [
    "private",
    "candidate",
    "workspace",
    "user-1",
    "agency-1",
  ]);
  assert.deepEqual(staffKeys.workspace(staffSession), [
    "private",
    "staff",
    "workspace",
    "user-2",
    "agency-2",
  ]);
  assert.deepEqual(jobsKeys.workspace(staffSession), [
    "private",
    "jobs",
    "workspace",
    "user-2",
    "agency-2",
    "supervisor",
  ]);
  assert.equal(platformKeys.workspace(null).at(-1), "none");
});

test("post-login redirects cannot leave the site", () => {
  assert.equal(
    safeRedirect("/candidate/jobs", candidateSession),
    "/candidate/jobs",
  );
  assert.equal(safeRedirect(undefined, staffSession), "/staff");
  assert.equal(
    safeRedirect("https://evil.example.com", candidateSession),
    "/candidate",
  );
  assert.equal(
    safeRedirect("//evil.example.com", candidateSession),
    "/candidate",
  );
});

test("display helpers format names, dates, and sizes", () => {
  assert.equal(initials("Noor Ahmed"), "NA");
  assert.equal(initials("Aya"), "A");
  assert.equal(formatBytes(512), "512 B");
  assert.equal(formatBytes(2048), "2 KB");
  assert.equal(formatBytes(2 * 1024 * 1024), "2.0 MB");
  assert.equal(formatRelative(new Date().toISOString()), "just now");
  assert.equal(
    formatRelative(new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()),
    "2 hours ago",
  );
  assert.equal(formatRelative("not-a-date"), "not-a-date");
});
