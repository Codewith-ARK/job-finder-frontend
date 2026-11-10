# Frontend context

**Phase:** UI-first. **Architecture:** approved v0.2. **Latest task:** T02.4 Phase 1 mock UI milestone completed; types, focused tests, build, and route checks pass. Repository lint still reports a pre-existing unrelated `src/app/(demo-flow)/v1/page.tsx` formatting/import issue. Browser interaction/visual review remains pending.

## Current outcome

Make the overall application workflow visible and usable with coherent mock data before backend feature development. Keep the same screens and feature interfaces as real API connections replace mocks incrementally.

| UI area | Target coverage | Current evidence |
| --- | --- | --- |
| Account and candidate | Signup/login/logout, onboarding, profile, candidate workspace | Mock: demo account entry/end-session, candidate onboarding progression, profile editing, and `/candidate` workspace. Real auth/API remains planned |
| Staff and supervision | Employee CRUD, teams, supervisor dashboard, assignment views | Mock: `/staff` now includes workload overview, candidate directory, team directory, supervisor assignment modal, and simulated team-member creation. Real auth/API remains planned |
| Jobs and applications | Jobs CRUD, manual application updates, candidate status visibility | Mock: candidate jobs/application routes and staff application pipeline share agency-scoped records and status updates. Real API remains planned |
| Remaining areas | Platform shell and discussed discovery/integration/reporting/notification previews | Mock: `/platform` includes overview, agencies, integrations, and audit tabs. Real API remains planned |

The proposed cross-role demonstration is candidate onboarding → supervisor review/assignment → staff job/application update → candidate sees the change. Displayed approval states and capabilities are provisional until reviewed; mock UI must not silently finalize backend permission policy.

## Mock behavior

Use shared mock records and state transitions across screens. Create/edit/delete actions must update dependent views through the feature API boundary and Query invalidation. Include useful populated, empty, loading, error, and success states. Label external-service previews as not connected.

During implementation, maintain each area's status here: planned, mock, API-connected, or blocked. Name the latest task and relevant contract. Never mark a feature API-connected before its workflow and obsolete mock references have been checked.

Backend integration starts with real authentication. Never send mock-only IDs to real endpoints or let a mock role switcher impersonate a real API user.

## T00 baseline (historical)

- The frontend contains only the starter `/` route and root layout; there are no `src/features/`, `src/components/`, `src/lib/`, mock adapters, or API functions yet.
- No frontend feature is currently `mock`, `API-connected`, or `blocked`; all listed product areas remain `planned` pending T01 UI work.
- `pnpm build` and `pnpm exec tsc --noEmit` passed. `pnpm lint` is currently blocked by the existing `package.json` formatting/line-ending difference. No API proxy or public environment contract is configured.

## T01 implementation and validation

- Routes are thin compositions in `(marketing)`, `(auth)`, and `(workspace)`. Marketing has no Query provider; auth/workspace providers reuse one browser QueryClient across navigation. Server renders receive separate clients to avoid sharing private caches across requests. No server prefetch or hydration layer was introduced.
- `auth` feature APIs/hooks own demo session discovery, perspective selection, agency-context switching, and ending the demo. `workspace` feature APIs/hooks own roadmap-module previews and explicit UI-state simulations. These are mock contracts, not approved real API endpoints or permission policy.
- Feature fixtures/adapters live under each feature's `mocks/`; fictional people/agencies/session live in shared `src/lib/mocks/`. Adapters are dynamically imported only behind an explicit development-mode guard. A disabled demo fails explicitly; there is no HTTP fallback or real API connection.
- Session/context changes pause private queries, cancel previous work, remove old private cache, and update the session cache. Private keys include user, agency, workspace, resource, and preview state; feature APIs receive AbortSignals. Session mutations are serialized. Demo state is memory-only and resets on reload.
- The Axios client is configured for future `/api` requests; no endpoint has been connected and no feature is API-connected. Mock roles remain presentation only. Native accessible controls are used for these simple foundation primitives.
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test` (9 passing results), `pnpm build`, and HTTP 200/expected disabled-demo content for `/`, `/demo`, `/candidate`, `/staff`, and `/platform` under `pnpm start`. Focused tests check browser-client reuse/server-client isolation, query deduplication, context isolation, cancellation, production/disabled-mode rejection, and zero central-client HTTP calls from mock adapters.
- Verification limits: browser-access host unavailable; visual/mobile and click-through review not performed. The existing development server at port 3000 runs with mocks off; a second mock dev server was blocked by Next's checkout lock. The public mock launcher reached Next startup without the earlier `--env-file` worker error. Restart the existing server with `pnpm dev:mock` to review the interactive demo.
- Changed scope: route/layout/style/metadata files in `src/app/`, shared presentation in `src/components/`, auth/workspace features, infrastructure in `src/lib/`, `.env.example`, `.gitignore`, package/lockfile additions for Query/Axios, explicit TypeScript-extension support for Node tests, mock dev launcher, tests, and frontend documentation. Backend files and fixed instruction sections were not edited.

## T02.1 implementation and validation

- Candidate records live under `src/features/candidates/` with types, private query keys, API functions, hooks, and a development-only mock adapter. The adapter checks the active candidate session and agency before reading or mutating its in-memory record.
- The candidate workspace shows profile completion, onboarding steps, a profile summary, next-step guidance, and a profile edit form. Completing the current step advances the next step and updates completion; attempting to skip ahead returns an explicit error.
- Flowbite React `0.12.17` is the default UI component library. Existing shared feedback/badge primitives and the main landing, demo, candidate, and workspace controls now use Flowbite components where equivalents exist; custom CSS remains for layout and product-specific composition.
- The current visual review mode intentionally uses Flowbite's default component appearance. Shared badges/alerts and Flowbite buttons, cards, form controls, tables, progress indicators, and modals no longer receive product-specific component styling; outer layout CSS remains only to preserve page structure.
- Mutations update the candidate query cache on success. No real endpoint, bearer token, cookie session, server guard, or backend contract was added in this UI-only task. Mock data remains intentionally active until the real candidate API integration is verified.
- Verified: `pnpm exec biome check --write` on changed frontend files, `pnpm lint`, `pnpm typecheck`, and `pnpm test` (10 passing results). The focused test covers profile edits, onboarding progression, invalid ordering, shared mock state, context isolation, cancellation, and zero adapter HTTP calls.
- Verification limit: browser visual/mobile and click-through review remains pending because the browser-access host is unavailable. Production build and HTTP route checks are being rerun after this task.

T02.2 follows T02.1 and keeps candidate mocks operational while staff records are introduced.

## T02.2 implementation and validation

- Staff records live under `src/features/staff/` with types, private query keys, API functions, hooks, and a development-only mock adapter. Agency-scoped records include candidate summaries, team members, workload metrics, teams, and activity.
- `/staff` now provides overview, candidates, and team tabs. Supervisor personas can assign or reassign candidates and add a team member through Flowbite modal/form controls. Employee personas can review the shared directory but do not receive supervisor assignment controls in the UI.
- Assignment and team-member mutations update the shared staff query cache. The candidate queue shows explicit onboarding, review, interview, ready, assigned, and unassigned states. Mock roles remain presentation-only; FastAPI will remain the authority for real permissions.
- Verified: focused Biome check on T02.2 files, `pnpm typecheck`, `pnpm test` (11 passing results), `pnpm build`, and production route responses for the main workspace routes. Full `pnpm lint` is currently blocked by the unrelated pre-existing `src/app/(demo-flow)/v1/page.tsx` formatting/import issue; it was not modified.
- Verification limit: browser visual/mobile and click-through review remains pending because the browser-access host is unavailable.

Next scoped task: T03 workflow review and contracts. Review the complete mock workflow, confirm the role/agency permission matrix, and record API shapes before backend implementation.

## T02.3 and T02.4 implementation and validation

- `src/features/jobs/` owns agency-scoped jobs and application records, candidate application mutations, and staff status updates. Candidate routes are `/candidate/jobs` and `/candidate/applications`; staff application review is `/staff/applications`.
- Candidate applications and staff status changes use the same mock agency record. The focused tests verify a candidate application can be updated by the staff perspective and remains visible in the shared record.
- `src/features/platform/` owns the platform preview contract and mock adapter. `/platform` now shows overview, agency directory, integration status, and audit activity tabs. External services remain explicitly simulated.
- Verified: focused Biome checks, `pnpm typecheck`, `pnpm test` (13 passing results), `pnpm build`, and HTTP 200 responses for `/`, `/demo`, `/candidate`, `/candidate/jobs`, `/candidate/applications`, `/staff`, `/staff/applications`, and `/platform`.
- Full `pnpm lint` remains blocked by the unrelated pre-existing `src/app/(demo-flow)/v1/page.tsx` formatting/import issue. Browser visual/mobile and click-through review remains pending because the browser-access host is unavailable.
