# Job Finder — frontend

One Next.js application for marketing and candidate, staff, and platform workspaces. Employees and supervisors share staff routes with role-aware navigation. Real cookie authentication, backend APIs, and seeded data are connected; runtime mocks have been removed.

**Status:** production prototype implemented. All workflows call FastAPI through the Next.js `/api` proxy. See [frontend context](CONTEXT.md) and workspace `../AGENTS.md`.

## Run the project

Run commands from this repository. Start the backend first from the sibling `backend/` repository.

| Item | Verified value |
| --- | --- |
| Node / package manager | Node `v24.19.0`; pnpm `11.8.0`; `pnpm-lock.yaml` |
| Install | `pnpm install` |
| Development | `pnpm dev` at `http://localhost:3000`; proxies `/api/*` to `API_ORIGIN` |
| Production | `pnpm build`, then `pnpm start` |
| Checks | `pnpm lint` (Biome), `pnpm typecheck`, `pnpm test` (4 passing), `pnpm build` |
| Environment | `.env.example` contains `API_ORIGIN`; default is `http://127.0.0.1:8000` |
| UI library | Flowbite React `0.12.17` with Tailwind CSS 4 |

The backend must expose `/api/health` and the API routes before the workspace will load. Open `/demo` to sign in with seeded accounts (password `Demo1234!`), or `/login` and `/register` for real credentials.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Marketing overview |
| `/login`, `/register`, `/demo` | Real login, candidate registration, seeded demo sign-in |
| `/candidate` | Candidate dashboard: onboarding progress, profile snapshot, activity |
| `/candidate/profile` | Profile and preferences editing |
| `/candidate/onboarding` | Ordered profile → preferences → documents completion |
| `/candidate/jobs`, `/candidate/applications` | Agency jobs, apply, and application status |
| `/staff` | Staff dashboard with workload and activity |
| `/staff/candidates` | Agency candidate directory, assignment, stage updates |
| `/staff/team` | Team directory, member creation, role/status changes |
| `/staff/jobs` | Job publishing and editing (supervisor) |
| `/staff/applications` | Application pipeline and status updates |
| `/platform` | Platform overview, agencies, integrations, audit |

`/platform` is only for platform administrators; staff routes require an agency membership. Route guards are navigation only — FastAPI authorizes every request.

## Architecture

- `src/app/`: thin routes grouped as `(marketing)`, `(auth)`, and `(workspace)`.
- `src/features/<scope>/`: feature types, query keys, API functions, hooks, and components.
- `src/components/`: shared presentation, including `ui/` primitives.
- `src/lib/`: Axios client, CSRF handling, Query client, formatting, and error mapping.
- `next.config.ts`: rewrites `/api/:path*` to `${API_ORIGIN}/api/:path*`.

`src/lib/http.client.ts` sends cookies, attaches the `X-CSRF-Token` header from the CSRF cookie on state changes, normalizes FastAPI errors into `ApiError`, and redirects to `/login` on authenticated 401 responses. React Query keys include user, agency, and role context; logout and agency switches clear private caches.

Flowbite React styles come from Tailwind CSS 4 through `flowbite-react/plugin/tailwindcss` and the generated `.flowbite-react/class-list.json`. After adding a new Flowbite component, run `pnpm exec flowbite-react build` and commit the regenerated class list; `ThemeInit` is mounted in the root layout. Without this, components render with missing classes (for example, an unstyled button).

## Verification and limits

Verified on 10 November 2026 against a seeded SQLite-backed API:

- `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass.
- A scripted HTTP smoke test passed 20/20 checks against the production `next start` server on port 3100, proxying to FastAPI: health, demo login for candidate/supervisor/platform, session resolution and clearing, candidate workspace and profile update, jobs workspace and apply, wrong-workspace denial, staff and platform workspace loads, and HTTP 200 for every main route.
- Headless Chrome screenshots confirmed the login, demo, marketing, candidate, staff, and platform screens at 1440px, plus login and candidate overview at 390px. The `⌘K` palette and mobile drawer were checked. Full click-through QA for every page remains manual.

See [agent rules](AGENTS.md), [architecture](../backend/docs/ARCHITECTURE.md), [execution contract](../backend/docs/EXECUTION.md), [task plan](../backend/docs/PLAN.md), and the [manual testing guide](../backend/docs/MANUAL_TESTING.md).
