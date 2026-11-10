# Frontend context

**Phase:** production prototype. **Architecture:** approved v0.2. **Latest delivery:** real authentication, all feature APIs, and a distinct product redesign are complete. Runtime mocks and mock mode are removed. Lint, typecheck, tests, production build, and scripted HTTP smoke checks pass. Desktop and key 390px screens were verified with headless Chrome.

## Current state

All discussed areas are API-connected. Runtime mocks and mock mode no longer exist.

| UI area | State | Evidence |
| --- | --- | --- |
| Account and candidate | API-connected | Real login/register/demo auth, onboarding order, profile, documents, jobs, applications |
| Staff and supervision | API-connected | Agency-scoped candidate directory, assignment/stage updates, team management, supervisor tools |
| Jobs and applications | API-connected | Job publishing/editing, candidate apply, staff status updates, shared pipeline |
| Platform | API-connected | Overview, agencies with status updates, simulated integrations, audit log |

Manual acceptance steps are in `../backend/docs/MANUAL_TESTING.md`; system diagrams are in `../backend/docs/FLOWS.md`.

## Historical implementation notes

The sections below record the UI-first build in order. They describe earlier mock states and are retained as history, not current guidance. The current state is the API-connected table above.


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

## T03–T06 implementation and validation

- **Account:** `/login`, `/register`, and `/demo` perform real FastAPI authentication. The demo chooser lists seeded personas and signs in through `/api/auth/demo-login`; it is not a mock role switcher. The app shell supports logout, password change, and agency switching for multi-agency users. Route guards are navigation-only and never replace backend authorization.
- **Session handling:** Axios uses cookies, reads the `jf_csrf` cookie into `X-CSRF-Token` for state changes, normalizes FastAPI `detail` errors, and sends unauthenticated authenticated-page 401s to `/login`. React Query keys are scoped by user, agency, and role; logout and agency changes clear private caches.
- **Features connected:** candidate dashboard/profile/onboarding/documents/jobs/applications; staff dashboard/candidates/team/jobs/applications; platform overview/agencies/integrations/audit. All runtime mocks, mock adapters, mock state, `mock-mode.ts`, the demo-flow preview route, and `dev:mock` were removed. There is no fallback to mocks on API failure.
- **UI:** a shared Flowbite-based shell with role-aware sidebar/topbar, responsive drawer, `ActionButton`, `LinkButton`, `Badge`, `Feedback`, `PageHeader`, `StatCard`, and `EmptyState`. Flowbite React `0.12.17` API differences were handled with local primitives rather than version changes.
- **Proxy:** `next.config.ts` rewrites `/api/:path*` to `${API_ORIGIN}/api/:path*`, default `http://127.0.0.1:8000`.
- **Verified:** `pnpm lint`, `pnpm typecheck`, `pnpm test` (4 passing), and `pnpm build` (18 static/dynamic routes) pass. `pnpm lint` is now clean; the former demo-flow lint blocker was deleted with the mocks.
- **HTTP smoke:** 20/20 checks against the production `next start` server (port 3100) proxying to FastAPI — health, candidate/supervisor/platform demo login, session resolution and clearing after logout, candidate workspace and profile update, jobs workspace and application, staff/platform workspace loads, wrong-workspace 403s, and HTTP 200 for `/`, `/login`, `/demo`, `/register`, `/candidate`, `/staff`, and `/platform`.
- **Limit:** mobile/responsive layouts and full click-through QA were not run. Desktop screens verified at 1440px with headless Chrome; the checks also cover rendering, routing, authentication, authorization boundaries, and representative mutations.
- **UI setup:** after this delivery, Flowbite's Tailwind 4 plugin and generated `.flowbite-react/class-list.json` were configured in `globals.css`, and `ThemeInit` was mounted in the root layout. The earlier unconfigured setup produced unstyled Flowbite components; `color="success"` buttons were also corrected to `green`. Verify new pages visually after adding Flowbite components.
- **Related backend:** endpoint shapes, seeds, and permissions are in `../backend/docs/EXECUTION.md`. Frontend and backend are independent Git repositories with separate commits.

## Product redesign — 10 November 2026

- **Design system:** warm bone canvas (`#f3f1e9`), forest-deep navigation, lime accent, coral errors, and warm neutral slate/emerald overrides in `globals.css`. Instrument Sans for UI, Instrument Serif for display headings, JetBrains Mono for labels and counts. Flowbite's green/primary/gray variables are mapped to the same palette.
- **Shell:** dark 272px navigation rail with workspace card, lime active state, search trigger, account menu, and mobile drawer. Sticky top bar with breadcrumb, agency switcher, `⌘K`/`Ctrl+K` command palette that filters workspace pages and navigates on select.
- **Dashboards:** candidate, staff, and platform screens rebuilt around a dark “next action” panel, metric strip, pipeline columns, profile/team panels, and activity timelines. Loading uses page skeletons; errors use an explicit retry surface.
- **Screens:** login, register, demo chooser, marketing home, and all workspace pages share the same typography, surfaces, badges, buttons, and motion. Marketing includes a live HTML product preview.
- **Verified visually:** headless Chrome at 1440px for login, demo, marketing, candidate overview/onboarding/profile/jobs/applications, staff overview/candidates/team/jobs/applications, platform overview, and the command palette; 390px for login and candidate overview. Mobile drawer, demo cards, and palette checked.
- **Checks:** `pnpm lint`, `pnpm typecheck`, `pnpm test` (4 passing), and `pnpm build` pass after the redesign. Manual end-to-end flows are documented in `../backend/docs/MANUAL_TESTING.md`.
