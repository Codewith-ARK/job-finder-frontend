import assert from "node:assert/strict";
import test from "node:test";
import {
  getDemoPersonas,
  getSession,
  logout,
  selectDemoSession,
} from "../src/features/auth/auth.api.ts";
import {
  completeCandidateStep,
  getCandidateWorkspace,
  updateCandidateProfile,
} from "../src/features/candidates/candidate.api.ts";
import { resetCandidateMockState } from "../src/features/candidates/mocks/candidate.mock.ts";
import {
  applyToJob,
  getJobsWorkspace,
  updateApplicationStatus,
} from "../src/features/jobs/jobs.api.ts";
import { resetJobsMockState } from "../src/features/jobs/mocks/jobs.mock.ts";
import { getPlatformWorkspace } from "../src/features/platform/platform.api.ts";
import { resetStaffMockState } from "../src/features/staff/mocks/staff.mock.ts";
import {
  addTeamMember,
  assignCandidate,
  getStaffWorkspace,
} from "../src/features/staff/staff.api.ts";
import { getWorkspaceOverview } from "../src/features/workspace/workspace.api.ts";
import { workspaceKeys } from "../src/features/workspace/workspace.keys.ts";
import { httpClient } from "../src/lib/http.client.ts";
import { isMockMode } from "../src/lib/mock-mode.ts";
import { mockRequest } from "../src/lib/mocks/request.ts";
import {
  clearPrivateQueries,
  createQueryClient,
  getQueryClient,
} from "../src/lib/query.client.ts";

test("T01 mock boundary, context isolation, and request lifecycle", async (t) => {
  const originalMode = process.env.NODE_ENV;
  const originalFlag = process.env.NEXT_PUBLIC_ENABLE_MOCKS;
  let httpRequests = 0;
  const originalAdapter = httpClient.defaults.adapter;
  httpClient.defaults.adapter = () => {
    httpRequests++;
    return Promise.reject(new Error("Unexpected real HTTP request"));
  };
  Object.assign(process.env, {
    NODE_ENV: "development",
    NEXT_PUBLIC_ENABLE_MOCKS: "true",
  });

  try {
    await t.test(
      "providers share one browser client but server instances stay isolated",
      () => {
        const serverFirst = getQueryClient();
        const serverSecond = getQueryClient();
        assert.notEqual(serverFirst, serverSecond);
        serverFirst.clear();
        serverSecond.clear();
        Reflect.set(globalThis, "window", {});
        try {
          assert.equal(getQueryClient(), getQueryClient());
          getQueryClient().clear();
        } finally {
          Reflect.deleteProperty(globalThis, "window");
        }
      },
    );

    await t.test(
      "production and disabled development fail explicitly",
      async () => {
        Object.assign(process.env, { NODE_ENV: "production" });
        assert.equal(isMockMode(), false);
        await assert.rejects(getSession(), /only in development/);
        Object.assign(process.env, {
          NODE_ENV: "development",
          NEXT_PUBLIC_ENABLE_MOCKS: "false",
        });
        assert.equal(isMockMode(), false);
        await assert.rejects(getDemoPersonas(), /only in development/);
        Object.assign(process.env, { NEXT_PUBLIC_ENABLE_MOCKS: "true" });
      },
    );

    await t.test(
      "demo identities share consistent, cloned backing state",
      async () => {
        const personas = await getDemoPersonas();
        assert.equal(personas.length, 4);
        assert.equal(
          personas.filter((item) => item.workspace === "staff").length,
          2,
        );
        const selected = await selectDemoSession("mock-candidate-aya");
        selected.user.name = "Changed copy";
        assert.equal((await getSession())?.user.name, "Aya Khan");
        await assert.rejects(selectDemoSession("unknown"), /available demo/);
        await assert.rejects(
          selectDemoSession("mock-candidate-aya", "mock-agency-harbor"),
          /not part/,
        );
        assert.equal((await getSession())?.user.id, "mock-candidate-aya");
      },
    );

    await t.test(
      "same-key consumers share one request and reuse fresh data",
      async () => {
        const session = await selectDemoSession("mock-candidate-aya");
        const client = createQueryClient();
        let calls = 0;
        const options = {
          queryKey: workspaceKeys.overview(session, "candidate", "ready"),
          queryFn: ({ signal }: { signal: AbortSignal }) => {
            calls++;
            return getWorkspaceOverview(session, "candidate", "ready", signal);
          },
        };
        const [first, second] = await Promise.all([
          client.fetchQuery(options),
          client.fetchQuery(options),
        ]);
        assert.deepEqual(first, second);
        assert.equal(first.modules.length, 4);
        await client.fetchQuery(options);
        assert.equal(calls, 1);
        client.clear();
      },
    );

    await t.test(
      "empty and error previews are explicit; errors never return fallback data",
      async () => {
        const session = await selectDemoSession("mock-employee-sam");
        assert.deepEqual(
          (await getWorkspaceOverview(session, "staff", "empty")).modules,
          [],
        );
        await assert.rejects(
          getWorkspaceOverview(session, "staff", "error"),
          /simulated request failed/,
        );
        assert.equal(
          (await getWorkspaceOverview(session, "staff", "ready")).modules
            .length,
          4,
        );
      },
    );

    await t.test(
      "aborting a mock request prevents the backing-state operation",
      async () => {
        const controller = new AbortController();
        let reads = 0;
        const pending = mockRequest(() => ++reads, controller.signal, 200);
        const rejected = assert.rejects(pending, { name: "AbortError" });
        controller.abort();
        await rejected;
        assert.equal(reads, 0);
      },
    );

    await t.test(
      "agency switches cancel private work, remove old cache, and reject stale contexts",
      async () => {
        const northstar = await selectDemoSession("mock-supervisor-noor");
        const client = createQueryClient();
        const readyKey = workspaceKeys.overview(northstar, "staff", "ready");
        client.setQueryData(readyKey, {
          agencyName: northstar.agency.name,
          modules: [],
        });
        const pending = client.fetchQuery({
          queryKey: workspaceKeys.overview(northstar, "staff", "loading"),
          queryFn: ({ signal }) =>
            getWorkspaceOverview(northstar, "staff", "loading", signal),
        });
        const rejected = assert.rejects(pending);
        await clearPrivateQueries(client);
        await rejected;
        assert.equal(
          client.getQueryCache().findAll({ queryKey: ["private"] }).length,
          0,
        );
        const harbor = await selectDemoSession(
          "mock-supervisor-noor",
          "mock-agency-harbor",
        );
        assert.notDeepEqual(
          readyKey,
          workspaceKeys.overview(harbor, "staff", "ready"),
        );
        await assert.rejects(
          getWorkspaceOverview(northstar, "staff", "ready"),
          /context changed/,
        );
        assert.equal(
          (await getWorkspaceOverview(harbor, "staff", "ready")).agencyName,
          "Harbor Talent",
        );
        await assert.rejects(
          getWorkspaceOverview(harbor, "candidate", "ready"),
          /context changed/,
        );
        client.clear();
      },
    );

    await t.test(
      "candidate profile and onboarding changes update the shared mock record",
      async () => {
        resetCandidateMockState();
        const session = await selectDemoSession("mock-candidate-aya");
        const initial = await getCandidateWorkspace(session);
        assert.equal(initial.profile.completion, 68);
        assert.equal(
          initial.onboarding.find((step) => step.id === "profile")?.status,
          "next",
        );

        const updated = await updateCandidateProfile(session, {
          headline: "Product designer building useful tools",
          location: "Islamabad, Pakistan",
          skills: ["Research", "Figma"],
        });
        assert.equal(updated.profile.location, "Islamabad, Pakistan");
        assert.deepEqual(
          (await getCandidateWorkspace(session)).profile.skills,
          ["Research", "Figma"],
        );

        const completed = await completeCandidateStep(session, "profile");
        assert.equal(completed.profile.completion, 78);
        assert.equal(
          completed.onboarding.find((step) => step.id === "profile")?.status,
          "complete",
        );
        assert.equal(
          completed.onboarding.find((step) => step.id === "preferences")
            ?.status,
          "next",
        );
        await assert.rejects(
          completeCandidateStep(session, "documents"),
          /current onboarding step first/,
        );
        resetCandidateMockState();
      },
    );

    await t.test(
      "supervisor assignment and team changes update shared staff records",
      async () => {
        resetStaffMockState();
        const employee = await selectDemoSession("mock-employee-sam");
        const employeeWorkspace = await getStaffWorkspace(employee);
        assert.equal(employeeWorkspace.candidates.length, 4);
        assert.equal(employeeWorkspace.candidates[0].assignedTo, null);

        const supervisor = await selectDemoSession("mock-supervisor-noor");
        const assigned = await assignCandidate(supervisor, {
          candidateId: "candidate-ava-johnson",
          memberId: "member-daniel-kim",
        });
        assert.equal(assigned.candidates[0].assignedTo, "member-daniel-kim");
        assert.equal(assigned.candidates[0].status, "review");

        const updated = await addTeamMember(supervisor, {
          name: "Jordan Kim",
          role: "employee",
          team: "Candidate success",
        });
        assert.equal(updated.teamMembers.at(-1)?.name, "Jordan Kim");
        assert.match(updated.activity[0].title, /Jordan Kim/);
        resetStaffMockState();
      },
    );

    await t.test(
      "candidate applications and staff status updates share job records",
      async () => {
        resetJobsMockState();
        const candidate = await selectDemoSession("mock-candidate-aya");
        const initial = await getJobsWorkspace(candidate);
        assert.equal(initial.jobs.length, 4);
        const applied = await applyToJob(candidate, "job-frontend-engineer");
        const ownApplication = applied.applications.find(
          (item) => item.candidateId === candidate.user.id,
        );
        assert.equal(ownApplication?.status, "submitted");

        const staff = await selectDemoSession("mock-employee-sam");
        const updated = await updateApplicationStatus(
          staff,
          ownApplication?.id ?? "",
          "interview",
        );
        assert.equal(
          updated.applications.find((item) => item.id === ownApplication?.id)
            ?.status,
          "interview",
        );
        resetJobsMockState();
      },
    );

    await t.test(
      "platform preview reads only from the platform perspective",
      async () => {
        const platform = await selectDemoSession("mock-platform-jules");
        const data = await getPlatformWorkspace(platform);
        assert.equal(data.stats.health, "Healthy");
        assert.equal(data.agencies.length, 4);
        await assert.rejects(
          getPlatformWorkspace(await selectDemoSession("mock-employee-sam")),
          /platform context changed/,
        );
      },
    );

    await t.test(
      "ending the demo removes the session and the adapters made no real HTTP calls",
      async () => {
        await logout();
        assert.equal(await getSession(), null);
        assert.equal(httpRequests, 0);
      },
    );
  } finally {
    httpClient.defaults.adapter = originalAdapter;
    if (originalMode === undefined)
      Reflect.deleteProperty(process.env, "NODE_ENV");
    else Object.assign(process.env, { NODE_ENV: originalMode });
    if (originalFlag === undefined) delete process.env.NEXT_PUBLIC_ENABLE_MOCKS;
    else process.env.NEXT_PUBLIC_ENABLE_MOCKS = originalFlag;
  }
});
