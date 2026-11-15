# Frontend audit — 2026-11-13

Read-only audit of the local/dev frontend. No frontend source code was changed; this report is the only file created. The local backend ran at `127.0.0.1:8000`, the existing dev frontend was on `localhost:3000`, and the production build was served locally on `localhost:3100`. No production URL was used.

The reported `/me` name is not a literal single endpoint in this frontend. There are two relevant families:

- Session discovery: `/api/auth/session`, from `src/features/auth/auth.api.ts:10-17`.
- Candidate self workspace: `/api/candidates/me`, from `src/features/candidates/candidate.api.ts:9-18`; the same file also contains user-triggered onboarding/document mutations under `/candidates/me/...` at lines 21-82.

## Summary

| ID      | Title                                                                                | Severity | Category     |
| ------- | ------------------------------------------------------------------------------------ | -------- | ------------ |
| BUG-001 | Reported `/me` loop is not an infinite source-level loop; stale remounts can refetch | High     | Performance  |
| BUG-002 | Session errors are treated as unauthenticated and redirected away from the retry UI  | Medium   | Bug          |
| BUG-003 | Protected routes are client-guarded, publicly cacheable shells                       | Medium   | Architecture |
| BUG-004 | `next` redirect validation permits backslash authority forms                         | Medium   | Security     |
| BUG-005 | Onboarding mutations cannot be aborted after navigation                              | Medium   | Bug          |
| BUG-006 | Workspace APIs over-fetch lists and render without pagination                        | Medium   | Performance  |
| BUG-007 | Page responses have no Next.js security headers                                      | Medium   | Security     |
| BUG-008 | Logout failure has no user feedback and the logout control is not disabled           | Medium   | Bug          |
| BUG-009 | Unsaved candidate profile data persists in localStorage after logout                 | Medium   | Security     |
| BUG-010 | No application-level route error boundaries are defined                              | Low      | Bug          |
| BUG-011 | Relative timestamps never update while a page remains open                           | Low      | Bug          |
| BUG-012 | Private workspace data waits for session discovery, creating a request waterfall     | Low      | Performance  |

## BUG-001 — Reported `/me` loop is not an infinite source-level loop; stale remounts can refetch

- **Category:** Performance
- **Severity:** High operational priority for the reported symptom; the infinite-loop portion was not reproduced from source.
- **Location:** `src/features/auth/auth.api.ts:10-17`, `src/features/auth/auth.hooks.ts:23-29`, `src/lib/query.client.ts:3-27`, `src/features/candidates/candidate.api.ts:9-18`, `src/features/candidates/candidate.hooks.ts:30-37`, `src/features/candidates/components/candidate-gate.tsx:15-26`, `src/app/(workspace)/candidate/layout.tsx:4-13`.
- **What's wrong:** The code has no `useEffect` that fetches `/auth/session` or `/candidates/me`, no changing query key, no refresh-token loop, and no interval. However, session and workspace queries become stale after 20–30 seconds and use TanStack Query's default `refetchOnMount` behavior, so a stale observer that remounts can issue another request. This is repeat traffic, not a continuous render loop.
- **Evidence:**
  - `getSession()` is the only session read and requests `/auth/session` at `auth.api.ts:10-17`. `useSession()` uses the stable key `authKeys.session`, `staleTime: 30_000`, and `retry: false` at `auth.hooks.ts:23-29`.
  - The same session query is consumed by `WorkspaceShell:102-108`, `WorkspaceGuard:15`, the candidate/jobs/staff/platform/referral hooks, and several feature components. The shared browser QueryClient is memoized at `query.client.ts:16-21`, so these consumers share and dedupe one query rather than each issuing a request.
  - Candidate `/candidates/me` is read by `getCandidateWorkspace()` at `candidate.api.ts:9-18`, through one query key at `candidate.hooks.ts:30-37`. `CandidateGate` remains in the candidate layout at `candidate/layout.tsx:10-12`, while candidate pages also consume the same hook. The gate and page therefore share one cache entry.
  - Global query defaults set `refetchOnWindowFocus: false`, `retry: false`, and no `refetchInterval` at `query.client.ts:4-13`. There is no `middleware.ts` source file, no `router.refresh()` call, and no direct `fetch()` in components.
  - The Axios response interceptor only redirects non-authenticated 401 responses to login at `http.client.ts:63-82`; it does not call `/auth/session`, refresh a token, or retry the failed request.
  - Manual local rewrite smoke check: one direct `GET http://127.0.0.1:3100/api/auth/session` returned `200`, body `null`, in `18 ms`. This was a direct HTTP check, not a browser application count.

### Requested request-count scenarios

The browser connector reported `Browser access host is unavailable`, so exact browser request counts could not be captured. The table below is the deterministic expectation from the current source, clearly marked as not runtime-observed:

| Scenario                                                                        | Expected `/auth/session` | Expected `/candidates/me` on candidate route | Why                                                                                                                                                                                   |
| ------------------------------------------------------------------------------- | -----------------------: | -------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First protected load in an existing tab                                         |                        1 |                                            1 | One session query, then one enabled candidate workspace query.                                                                                                                        |
| SPA login, then redirect to candidate workspace                                 |                        0 |                                            1 | `useSessionMutation.onSuccess` writes the returned session into the shared cache at `auth.hooks.ts:41-50`; the candidate data query still loads. A full page reload would be 1 and 1. |
| Candidate navigation while the candidate layout stays mounted and data is fresh |                        0 |                                            0 | `CandidateGate` remains mounted and the same query key is reused.                                                                                                                     |
| Staff/platform page navigation while the session is fresh                       |                        0 |                                            0 | The same session cache is reused. After the 30-second stale window, a page-level guard remount may cause 1 session refetch.                                                           |
| Tab focus                                                                       |                        0 |                                            0 | `refetchOnWindowFocus: false`.                                                                                                                                                        |
| Idle for 60 seconds                                                             |                        0 |                                            0 | No polling or focus refetch exists; being stale alone does not fetch.                                                                                                                 |

- **Probable cause:** If the report means continuous requests every render, the reviewed frontend does not explain it. If it means an occasional repeat after navigation, the cause is React Query staleness (`auth.hooks.ts:27`, workspace hook stale times at `candidate.hooks.ts:36`, `jobs.hooks.ts:35`, `staff.hooks.ts:37`, `platform.hooks.ts:15`, and `referrals.hooks.ts:24`) combined with a remount. Multiple consumers are not the cause because they use the same query key and QueryClient.
- **Suggested fix:** Capture a real browser Network trace first and group requests by initiator. If the desired policy is exactly one session read per tab, make the session query's mount/refetch policy explicit and invalidate it only on login, logout, password change, agency switch, or a deliberate session check. Do not add another per-component effect. If `/candidates/me` is the reported request, keep the query at the layout/bootstrap boundary and confirm that the repeated initiator is not an external wrapper or browser extension.
- **Effort:** Small to Medium, depending on the confirmed runtime initiator.

### Strict Mode and production note

React Strict Mode's development-only effect replay is not a sufficient explanation here: the endpoint is a React Query `queryFn`, not a fetch inside an effect. In-flight requests with the same query key are deduped. The optimized production build uses the same query configuration and completed successfully, but a production browser request count was not available without the browser connector.

## BUG-002 — Session errors are treated as unauthenticated and redirected away from the retry UI

- **Category:** Bug
- **Severity:** Medium
- **Location:** `src/features/workspace/components/workspace-shell.tsx:118-124,153-183`.
- **What's wrong:** When `/auth/session` fails, `session.data` is absent and `unauthenticated` becomes `true`. The render returns the loading/redirect branch at lines 153-166 before it can reach the explicit error/retry branch at lines 168-183. The effect also redirects to login on a transient API outage.
- **Evidence:** `const unauthenticated = !session.isPending && !session.data` at line 118; the redirect effect depends on it at lines 120-124; `if (session.isPending || unauthenticated)` returns before `if (session.isError)` at lines 153-168. The retry button at lines 178-179 is therefore unreachable for this failure state.
- **Probable cause:** `isError` is not excluded from the unauthenticated predicate, and the error branch is ordered after the branch that catches all empty data.
- **Suggested fix:** Handle `session.isError` before the unauthenticated branch and show the existing retry UI. Redirect only after a successful `null` session response, not after a network/server error.
- **Effort:** Small.

## BUG-003 — Protected routes are client-guarded, publicly cacheable shells

- **Category:** Architecture
- **Severity:** Medium
- **Location:** `src/app/(workspace)/layout.tsx:4-13`, `src/features/workspace/components/workspace-shell.tsx:102-187`, `src/features/workspace/components/workspace-guard.tsx:8-40`, `next.config.ts:7-21`.
- **What's wrong:** Workspace access is decided after hydration by client queries. A direct unauthenticated production request to `/candidate`, `/staff`, and `/platform` returned HTTP 200 and a shell containing “Opening your workspace”; the API is still the authorization authority, so this is not an API authorization bypass, but it creates protected-route flicker and a public cache surface.
- **Evidence:** The workspace layout mounts a client `WorkspaceShell`; the shell waits for `useSession()` and redirects in an effect. Production local route checks returned `/candidate` 200/12,354 bytes, `/staff` 200/11,898 bytes, and `/platform` 200/11,925 bytes. Each returned `Cache-Control: s-maxage=31536000` and `x-nextjs-prerender: 1,1`. The HTML contained no seeded user names or email data, so no current private-data leak was observed.
- **Probable cause:** No server-side cookie check or middleware exists in `frontend/src`, and `next.config.ts` defines only the `/api` rewrite.
- **Suggested fix:** Add a server-side navigation guard or middleware that performs a conservative cookie-presence redirect for protected routes, while retaining FastAPI authorization for every operation. Mark authenticated route shells private/no-store unless the team deliberately accepts public caching of data-free shells.
- **Effort:** Medium.

## BUG-004 — `next` redirect validation permits backslash authority forms

- **Category:** Security
- **Severity:** Medium; browser navigation confirmation is still required.
- **Location:** `src/features/auth/redirect.ts:14-19`, `src/app/(auth)/login/page.tsx:7-16`, `src/features/auth/components/login-form.tsx:25-34`.
- **What's wrong:** `safeRedirect()` accepts any string beginning with `/` except strings beginning with `//`. Backslashes are normalized as URL separators by browser URL parsing, so a value such as `/\\evil.example` can be interpreted as an external authority by a navigation API. The login page forwards the untrusted `next` query value directly to this function.
- **Evidence:** The current test covers absolute URLs and `//` at `tests/foundation.test.ts:93-106`, but not backslash forms. In local Node URL parsing, `new URL('/\\evil.example', 'http://localhost:3000').href` resolves to `http://evil.example/`, while `safeRedirect('/\\evil.example', session)` returns the input unchanged under `redirect.ts:18`.
- **Probable cause:** Prefix checks are being used instead of parsing and comparing the destination origin.
- **Suggested fix:** Parse `next` against the current origin and accept only same-origin paths; reject backslashes, protocol-relative forms, encoded authority separators, and any non-empty external origin. Add regression tests for `/\\evil.example`, `/\\/evil.example`, encoded variants, absolute URLs, and `//`.
- **Effort:** Small.

## BUG-005 — Onboarding mutations cannot be aborted after navigation

- **Category:** Bug
- **Severity:** Medium
- **Location:** `src/features/candidates/components/candidate-onboarding.tsx:201-306`, `src/features/candidates/candidate.api.ts:21-78`.
- **What's wrong:** Save, upload, delete, and finish handlers await mutations and then update component state and the persisted draft. The mutation API functions do not accept an `AbortSignal`, so a slow upload or save continues after the user leaves the page; its completion can still write stale draft state and run UI updates after unmount.
- **Evidence:** The handlers call `mutation.mutateAsync()` and then call `applyServer`, `setNotice`, `setFile`, `setPendingDelete`, and `setBusy` after awaits at `candidate-onboarding.tsx:218-245` and `272-306`. All mutation functions in `candidate.api.ts:21-78` call Axios without a signal. Reads do pass React Query signals, but these mutation paths do not.
- **Probable cause:** Abort handling was added to query functions but not to mutation contracts; there is no mounted/operation identity check in the component.
- **Suggested fix:** Make long-running mutation functions accept and pass an abort signal, cancel on route/unmount, and ignore completion from an obsolete operation before writing local draft state. At minimum, guard post-await UI updates with an operation id.
- **Effort:** Medium.

## BUG-006 — Workspace APIs over-fetch lists and render without pagination

- **Category:** Performance
- **Severity:** Medium
- **Location:** `src/features/candidates/candidate.types.ts:83-94`, `src/features/jobs/jobs.types.ts:38-40`, `src/features/staff/staff.types.ts:45-50`, `src/features/platform/platform.types.ts:35-40`, and the corresponding API functions at `candidate.api.ts:9-18`, `jobs.api.ts:9-16`, `staff.api.ts:8-18`, and `platform.api.ts:4-10`.
- **What's wrong:** Each workspace endpoint returns a compound payload containing multiple arrays, and page components render the full arrays with `.map()`/`.slice()` rather than requesting a page or cursor. The staff dashboard, staff lists, candidate lists, jobs, applications, referral links, and platform audit all scale with response size.
- **Evidence:** `CandidateWorkspaceData` carries profile, preferences, experiences, education, onboarding, documents, and referral data; `StaffWorkspaceData` carries stats, candidates, team members, teams, and activity; `JobsWorkspaceData` carries both jobs and applications. Examples of full list rendering are `staff-candidates.tsx:173-240`, `staff-applications.tsx:146-175`, `staff-jobs.tsx:206-268`, and `platform-workspace.tsx:483-492`. No hook accepts a limit/cursor and no component renders pagination controls.
- **Probable cause:** The current API contract is a page-shaped aggregate rather than resource-specific list queries. A fixed backend row cap limits damage but does not provide a way to reach later records.
- **Suggested fix:** Define cursor/limit contracts for the largest lists and fetch only the active section; keep small summary metrics separate from list pages. Add virtualization only if measured row counts justify it.
- **Effort:** Medium to Large.

## BUG-007 — Page responses have no Next.js security headers

- **Category:** Security
- **Severity:** Medium
- **Location:** `next.config.ts:7-21`.
- **What's wrong:** The Next config defines the API rewrite but no page-layer `Content-Security-Policy`, `Referrer-Policy`, `X-Content-Type-Options`, frame-ancestors/X-Frame-Options, or Permissions-Policy headers. A production local response for `/` exposed `X-Powered-By: Next.js` and cache metadata but none of those defensive headers.
- **Evidence:** `next.config.ts:7-21` contains only `reactCompiler`, Turbopack CSS rules, and `rewrites()`. `GET http://127.0.0.1:3100/` returned `X-Powered-By: Next.js` and `Cache-Control: s-maxage=31536000`; no CSP, Referrer-Policy, X-Frame-Options, X-Content-Type-Options, or Permissions-Policy header was present.
- **Probable cause:** Hardening was implemented at the API/deployment layer, but the Next response boundary has no matching headers configuration.
- **Suggested fix:** Add carefully tested Next headers at the page boundary, beginning with `Referrer-Policy`, `X-Content-Type-Options`, frame protection, and Permissions-Policy. Add a CSP compatible with Next's scripts/fonts and test the login, referral, and workspace flows before enforcing it.
- **Effort:** Medium.

## BUG-008 — Logout failure has no user feedback and the logout control is not disabled

- **Category:** Bug
- **Severity:** Medium
- **Location:** `src/features/auth/auth.hooks.ts:77-85`, `src/features/workspace/components/workspace-shell.tsx:190-194,324-332,432-447`.
- **What's wrong:** `useLogout()` clears the session cache and redirects only in `onSuccess`. `signOut()` supplies no `onError`, and the icon button is not disabled while the mutation is pending. A failed request leaves the user signed in with no message; repeated clicks can send duplicate logout requests.
- **Evidence:** `auth.hooks.ts:77-85` has no `onError` handler. `workspace-shell.tsx:190-194` only passes `onSuccess`, and the button at lines 324-332 has no `disabled` or pending state. Query mutations globally have `retry: false` at `query.client.ts:5-12`.
- **Probable cause:** The happy path was wired, but logout's failure state was not surfaced in the shell.
- **Suggested fix:** Disable both logout controls while pending, show an inline error with a retry action, and decide explicitly whether a timeout should still clear local auth state or keep the user signed in.
- **Effort:** Small.

## BUG-009 — Unsaved candidate profile data persists in localStorage after logout

- **Category:** Security
- **Severity:** Medium; this is an approved product behavior with a privacy tradeoff, not a session-token leak.
- **Location:** `src/features/candidates/candidate.store.ts:13-39`, `src/features/candidates/onboarding-draft.ts:48-52`, `src/features/candidates/components/candidate-onboarding.tsx:128-153`.
- **What's wrong:** Zustand persists personal, professional, and academic draft fields under `jf-onboarding-drafts` in browser storage. Logout clears private React Query data at `auth.hooks.ts:77-85`, but does not clear the previous user's draft. Anyone using the same browser profile can leave or recover that personal data if they know the account context.
- **Evidence:** `candidate.store.ts:18-37` uses `persist()` with a localStorage name and stores all `drafts`; the draft shape includes phone/location/headline, experience, skills, preferences, and education at `onboarding-draft.ts:48-52` and the surrounding definitions. Draft cleanup occurs on completion or server application at `candidate-onboarding.tsx:142-153`, not on logout.
- **Probable cause:** The resumable-draft requirement was implemented without a logout/session-retention policy for personal data.
- **Suggested fix:** Clear the active user's draft on logout if resumability across logout is not required; otherwise add a clear privacy warning, TTL, explicit “forget local draft” control, and a logout cleanup policy. Do not store passwords, document files, or session tokens.
- **Effort:** Small to Medium.

## BUG-010 — No application-level route error boundaries are defined

- **Category:** Bug
- **Severity:** Low
- **Location:** `src/app/` source tree; no `error.tsx`, `global-error.tsx`, or route-group error boundary is present.
- **What's wrong:** A render exception in a client feature or shared workspace shell has no product-specific fallback, recovery action, or error reporting boundary. Query errors are handled, but render errors are a separate failure class.
- **Evidence:** The source tree contains loading/feedback components and query error branches, but no Next error boundary file. The root layout at `src/app/layout.tsx:35-49` mounts children without an application error boundary.
- **Probable cause:** Error handling focuses on request state and leaves unexpected render failures to the framework default.
- **Suggested fix:** Add a root boundary and route-group boundaries for auth/workspace with a retry/reset action and non-sensitive telemetry. Keep API authorization and query errors separate from render recovery.
- **Effort:** Small to Medium.

## BUG-011 — Relative timestamps never update while a page remains open

- **Category:** Bug
- **Severity:** Low
- **Location:** `src/lib/format.ts:10-29`; callers include `src/features/platform/components/platform-workspace.tsx:369,494`, `src/features/staff/components/staff-applications.tsx:189-194`, and candidate/staff list components.
- **What's wrong:** `formatRelative()` reads `Date.now()` during render but there is no timer or query invalidation to cause a later render. “Just now”, “5 minutes ago”, and similar labels remain stale until another state update or navigation happens.
- **Evidence:** `format.ts:13` computes from `Date.now()` and returns a string at lines 23-29. Every caller simply interpolates the value during render; no matching `setInterval`, timeout, or clock hook exists in the source search.
- **Probable cause:** Relative formatting was treated as a pure formatter even though its output changes with time.
- **Suggested fix:** Use absolute timestamps for stable content or add one shared, reduced-frequency clock hook that updates only while the relevant page is mounted.
- **Effort:** Small.

## BUG-012 — Private workspace data waits for session discovery, creating a request waterfall

- **Category:** Performance
- **Severity:** Low
- **Location:** `src/features/candidates/candidate.hooks.ts:30-37`, `src/features/jobs/jobs.hooks.ts:27-36`, `src/features/staff/staff.hooks.ts:31-38`, `src/features/platform/platform.hooks.ts:9-16`, `src/features/referrals/referrals.hooks.ts:18-25`.
- **What's wrong:** Each private query is disabled until `useSession()` returns a workspace at `enabled: session?.user.workspace === ...`. A cold protected page therefore waits for session discovery before beginning the workspace request, adding at least one client round trip before the main data request.
- **Evidence:** The hooks all read `useSession()` and gate their query on session data. No server prefetch/hydration or parallel authenticated request path exists. Local production route TTFB was healthy for the shell (about 38–42 ms for workspace paths), but that does not include the post-hydration API waterfall.
- **Probable cause:** The client-only navigation guard and session/context gate are also being used as the data bootstrap mechanism.
- **Suggested fix:** Keep authorization server-side in FastAPI, but consider a server-provided session bootstrap or a protected layout that resolves the session once before mounting feature queries. Do not parallelize private calls without an authenticated context and correct cache scoping.
- **Effort:** Medium.

## Production-build and local measurements

### Checks run

- `pnpm.cmd lint` — passed; Biome checked 92 files.
- `pnpm.cmd typecheck` — passed; Next route types and TypeScript completed.
- `pnpm.cmd test` — passed 7/7. Node emitted `MODULE_TYPELESS_PACKAGE_JSON` warnings because the package does not declare a module type; no test failed.
- `pnpm.cmd build` — passed; Next 16.4.3 compiled, type-checked, generated 19 routes, and finalized optimization.
- `pnpm.cmd exec next start -p 3100` — local production server started successfully after the initial `pnpm start -- -p 3100` forwarding attempt passed the separator incorrectly.
- Local production HTTP smoke: all 17 listed app routes returned HTTP 200. Sample timings were `/` 177 ms/45,234 bytes, `/candidate` 40 ms/12,354 bytes, `/staff` 38 ms/11,898 bytes, and `/platform` 40 ms/11,925 bytes.

### Bundle/assets

Raw, uncompressed asset totals fetched from the local production server:

| Route        | JS assets |   Raw JS | All Next assets |
| ------------ | --------: | -------: | --------------: |
| `/`          |         9 | 624.8 KB |        780.6 KB |
| `/demo`      |        12 | 738.0 KB |        893.7 KB |
| `/candidate` |        14 | 870.7 KB |      1,026.4 KB |
| `/staff`     |        13 | 862.8 KB |      1,018.6 KB |
| `/platform`  |        13 | 866.2 KB |      1,021.9 KB |

The largest generated static chunk was `05s0_de0opxp1.js` at 224.4 KB raw; all `.next/static/chunks` totaled 1,425.7 KB raw across 34 files. These are transfer-size proxies, not compressed production network measurements. The shared client workspace shell imports Flowbite controls and many workspace icons at `src/features/workspace/components/workspace-shell.tsx:1-46`, and each protected route loads roughly 0.86–0.87 MB of raw JS in this build. Consider this a performance risk worth profiling, not proof of a specific slow component.

### Lighthouse-equivalent limitation

Lighthouse was not installed (`pnpm.cmd exec lighthouse --version` failed), and the browser access host was unavailable. Therefore LCP, CLS, TBT, real compressed transfer sizes, browser request counts, focus behavior, and 60-second idle behavior were not measured. The local production build and HTTP/asset checks above must not be represented as Lighthouse results.

## Checked and clean

- No literal `/me` read exists outside the centralized candidate API function; all candidate consumers use one React Query key. Session consumers use `authKeys.session` and one shared browser QueryClient.
- No unstable `useEffect` dependency or fetch-without-dependency-array was found. The effects in `workspace-shell.tsx:120-139` have stable/intentional dependencies and clean up the keydown listener; `candidate-gate.tsx:24-26` only redirects on state changes.
- No interceptor refresh loop, retry loop, `router.refresh()`, middleware session call, or direct component `fetch()` was found.
- Query reads pass `AbortSignal` through the feature API functions; the cancellation gap is limited to mutation paths called out in BUG-005.
- Private query keys include user and agency context where applicable (`src/features/*/*.keys.ts`), and logout/identity mutations cancel and remove `['private']` queries at `src/lib/query.client.ts:24-27`.
- Workspace, feature, and list views have explicit loading/error states and most list surfaces have empty states. API errors are normalized centrally at `src/lib/http.client.ts:35-45`.
- No `dangerouslySetInnerHTML`, raw HTML injection, client API key, server secret, or session token storage was found. Session transport uses cookies with `withCredentials` at `src/lib/http.client.ts:47-52`; CSRF headers are read from the CSRF cookie for state-changing requests at lines 54-60.
- No `<img>` usage was found; `frontend/public` contains only small default SVG assets, and fonts use `next/font` in `src/app/layout.tsx:1-24`.
- No 3D/render loop, websocket, interval, or uncleaned subscription was found. No animation-heavy page requires geometry/texture disposal review.
- Production source build, lint, typecheck, tests, local API health/readiness, route status, response headers, and generated asset sizes were checked locally only.

## Could not test

- Exact `/auth/session` and `/candidates/me` browser request counts for first load, login, navigation, focus, and 60 seconds idle: browser access host unavailable; direct HTTP requests do not execute the client React tree.
- Strict Mode versus production browser request-count comparison: same reason; source analysis found no effect-driven fetch loop, and the production build passed.
- Actual Lighthouse LCP, CLS, TBT, compressed transfer sizes, browser console warnings, layout shifts, and click-through behavior: Lighthouse/browser connector unavailable.
- Actual backslash open-redirect navigation: URL normalization is evidence of risk, but browser/router behavior needs a browser test.
- Large-data stress, pagination behavior beyond current API caps, mobile layout, and long-running upload/navigation cancellation: no browser session or production dataset was available.
