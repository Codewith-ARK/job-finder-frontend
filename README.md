# Job Finder — frontend

One Next.js application for marketing and candidate, staff, and platform workspaces. Employees and supervisors share the staff routes, with permission-based navigation.

**Status:** T02.4 completes the Phase 1 mock UI milestone: candidate, staff/supervisor, jobs/applications, and platform preview workflows are implemented with shared mock records. Flowbite React is the default UI component library. Real authentication and feature APIs are not connected.

**Current priority:** complete mock UI workflows. See [frontend context](CONTEXT.md) and workspace `../AGENTS.md`. Backend integration follows workflow review.

## Run the existing project

Run commands from this repository. On Windows PowerShell, use `pnpm.cmd` if the PowerShell shim is blocked.

| Item | Verified value |
| --- | --- |
| Node version and package manager | Node `v24.19.0` observed; pnpm `11.8.0` declared and installed; `pnpm-lock.yaml` is present |
| Install command | `pnpm install`; T01 installed TanStack Query and Axios with `pnpm add @tanstack/react-query axios`, preserving the existing package manager and framework versions |
| Development command and URL | `pnpm dev` defaults to `http://localhost:3000`; `pnpm dev:mock` loads the public development flag from `.env.example`. A second dev server was blocked by an existing server in this checkout during T01 |
| Build / production start | `pnpm build` passed; `pnpm start --hostname 127.0.0.1 --port 3100` served all five routes with HTTP 200; mocks were disabled in production |
| Type check / lint / relevant tests | `pnpm typecheck`, `pnpm lint`, and `pnpm test` passed; 10 Node test results cover mock boundaries, cache reuse, cancellation, context isolation, candidate profile/onboarding transitions, and no adapter HTTP requests |
| Environment file and required variable names | `.env.example` contains only `NEXT_PUBLIC_ENABLE_MOCKS=true`; adapters require this flag AND development mode. Production always disables mocks |
| UI component library | Flowbite React `0.12.17` is installed; use its components first for buttons, badges, alerts, cards, avatars, progress, form controls, and similar available primitives |
| API proxy target and path mapping | The shared Axios client targets `/api` with cookies, timeout, and cancellation support; no API proxy or real endpoint integration is configured yet |

Use `.env.example` for names and safe examples. Never copy backend secrets into browser configuration. Mock-only UI work does not require a real feature API. Start FastAPI using the backend README when testing real requests.

## Explore the foundation

1. Stop any existing dev server for this checkout in its terminal, then run `pnpm dev:mock`.
2. Open `/`, then `/demo`. Choose Candidate, Employee, Supervisor, or Platform; the chooser opens `/candidate`, `/staff`, or `/platform`.
3. Use Overview, Workflow map, and Preview states navigation. Switch between Populated, Loading, Empty, and Error; the error and empty previews offer recovery actions.
4. The Supervisor persona can switch between Northstar Careers and Harbor Talent. Context changes cancel old private requests and remove their cache. End demo session clears the demo session.
5. Choose Candidate to review the onboarding path, complete the current profile step, open My profile, edit the headline/location/skills, and save the shared mock record.

The session is browser-memory presentation state, resets on reload, and grants no real permissions. Direct workspace visits without a selected session show the chooser link; mismatched perspectives offer their matching workspace. Disabled mock mode shows an unavailable message and makes no real API requests.

T02.4 verified the candidate, staff, jobs/application, and platform adapters/query behavior in Node. Flowbite React primitives back the shared badges/feedback plus the landing, demo, candidate, staff, jobs, platform, and workspace controls. Browser visual and interaction QA could not run because the browser-access host was unavailable; responsive/mobile styling remains visually unverified. The next phase is T03 workflow review and contract decisions.

## Code map

- `src/app/`: routes and layouts.
- `src/features/`: scoped UI, API functions, Query hooks, keys, and types.
- `src/components/`: shared presentation.
- `src/lib/`: central Axios and Query configuration.
- `src/lib/mocks/`: shared fictional personas, agencies, and active demo session.
- `scripts/dev-mock.mjs`: loads the public mock flag before running the installed Next CLI.
- `tests/foundation.test.ts`: focused tests using Node's built-in test runner; no added test framework.

See [agent rules](AGENTS.md), [architecture](../backend/docs/ARCHITECTURE.md), and [task plan](../backend/docs/PLAN.md). These paths assume sibling `frontend/` and `backend/` checkouts.

## Verify and diagnose

Confirm the baseline page loads and configured checks run. For API failures, check the API process and proxy mapping first; preserve the actual error. Do not hide failures with mock responses. Session and permission checks become acceptance criteria when authentication is assigned.
