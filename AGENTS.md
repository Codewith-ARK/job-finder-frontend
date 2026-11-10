# Frontend agent rules

Applies to this repository. Read workspace `../AGENTS.md`, this file, `CONTEXT.md`, `README.md`, and the assigned task in `../backend/docs/PLAN.md`. Architecture v0.2 is approved; **UI-first is fixed**. Shared structure is in `../backend/docs/ARCHITECTURE.md`.

## Scope

1. Complete only the assigned task or explicitly assigned task sequence. Name the intended files before editing. A feature may require several layers; unrelated refactors are excluded.
2. Preserve the working scaffold, existing package manager, lockfile, versions, and user changes. Do not re-scaffold or upgrade as cleanup.
3. Use the agreed stack: Next.js App Router, TypeScript, Tailwind/shadcn, TanStack Query, Axios. Add a missing dependency only when the assigned task requires it; do not introduce another framework or state library.
4. Read the sibling backend for contracts. Edit it only when the task includes backend work. Existing task authorization needs no repeated confirmation; a material scope change must be resolved before expanding work.

## Boundaries

| Location | Rule |
| --- | --- |
| `src/app/` | Thin routes, layouts, metadata, navigation. Preserve framework filenames. |
| `src/features/<scope>/` | Feature UI, API functions, hooks, keys, types, and validation. |
| `src/components/` | Reusable presentation; `ui/` holds primitives. No feature business rules. |
| `src/lib/` | Shared infrastructure, including `http.client.ts` and `query.client.ts`. |

- Follow `jobs.api.ts`, `jobs.hooks.ts`, `jobs.keys.ts`, `jobs.types.ts`; feature components live in `components/`. Create files when needed, not empty future modules.
- Data flow: component → feature hook → feature API function → mock adapter or central Axios client. Real HTTP requests use Axios; no direct HTTP calls in components or hooks. Features must not import another feature's internal components or API files; shared contracts belong in an explicitly scoped task.
- Keep Client Components around interaction. Mount the Query provider in auth/workspace layouts; keep marketing outside it. No authenticated server-fetching layer, Server Actions for business logic, or hydration machinery in the initial foundation.
- React Query owns remote data. Keep form/UI state local. Keys include relevant user, agency, filters, and pagination. Gate private queries until session/context is known; session discovery is the bootstrap exception.
- Define freshness per resource, invalidate affected queries after mutations, and poll only active work. On logout or context changes, disable/cancel old private requests and remove their cached data. Pass cancellation signals through API functions.
- Mock mode must be explicit, development-only, and use the same feature API contracts. Keep feature adapters/fixtures under `features/<scope>/mocks/`; shared mock backing state belongs in `src/lib/mocks/`. Never embed datasets in components or silently fall back after API failures.
- Show coherent records and working transitions across all core screens, including useful loading/empty/error/success states. Mock roles and external integrations are visibly simulated; they grant no real permissions.
- Keep mocks until the real API and integration pass their checks. Then remove that feature's obsolete runtime mock data, handlers, registrations, imports, and switches. Keep unrelated mock features operational; never send mock-only IDs to real endpoints. Track mock/API status in CONTEXT.
- Write efficient, DRY, modular, readable, functional code. Extract meaningful duplication; avoid abstractions created only for possible future reuse.

## Security and completion

- Treat route guards as navigation only. FastAPI authorizes every protected operation. Never persist session credentials in browser storage or expose server secrets through public environment variables.
- Run configured type/lint checks and the relevant behavior checks; build when routing, configuration, or client/server boundaries change. Add tests for meaningful changed behavior, not markup-only edits. Report missing checks honestly.
- End with: task ID; changed files; checks and results; remaining blocker. Do not mark implementation complete while an acceptance criterion is unmet.

## Observed conventions — agent maintained

- `package.json` declares pnpm `11.8.0`; `pnpm-lock.yaml` is the only frontend lockfile; Node `v24.19.0` is installed. Scripts are `dev`, `build`, `start`, `lint` (`biome check`), `typecheck` (`next typegen && tsc --noEmit`), `test` (Node's test runner with TypeScript stripping), and `format`.
- Routes live in `(marketing)`, `(auth)`, and `(workspace)` groups. Marketing stays outside Query providers. `/login`, `/register`, and `/demo` use real FastAPI authentication; `/demo` performs seeded database logins and is not a mock persona switcher.
- `src/lib/http.client.ts` targets `/api` through the Next rewrite, sends cookies, derives `X-CSRF-Token` from `jf_csrf`, normalizes FastAPI `detail` errors, and redirects authenticated 401s to `/login`. `next.config.ts` rewrites `/api/:path*` to `${API_ORIGIN}/api/:path*`.
- React Query owns remote data. Private keys include user, agency, and role context; logout and agency switches clear private caches and cancel old work. Feature APIs are grouped as `*.api.ts`, `*.hooks.ts`, `*.keys.ts`, and `*.types.ts` under `src/features/<scope>/`; components live in each feature's `components/`.
- Runtime mocks, mock adapters, `src/lib/mocks/`, `mock-mode.ts`, the `(demo-flow)` route, and `dev:mock` were removed when real APIs were connected. `.env.example` contains only `API_ORIGIN`. Do not reintroduce mock fallbacks.
- Flowbite React `0.12.17` is the UI library. Tailwind CSS 4 loads `flowbite-react/plugin/tailwindcss` and scans `.flowbite-react/class-list.json`; run `pnpm exec flowbite-react build` after importing new Flowbite components and commit the regenerated class list. `ThemeInit` from `.flowbite-react/init.tsx` is rendered in the root layout. Button colors use `green`, `red`, `light`, and `gray`; `success`/`failure` are valid for Badge and Alert but not Button or Progress.
- The product design system lives in `globals.css`: warm bone canvas, forest-deep navigation, lime accent, Instrument Sans/Serif, JetBrains Mono, and overridden Flowbite gray/green/primary variables. Shared primitives are `ActionButton`, `LinkButton`, `Badge`, `MetricStrip`, `PageHeader`, `PageSkeleton`, `Feedback`, `EmptyState`, and `StatCard`. Use Flowbite for controls and these primitives for product surfaces; keep lime reserved for primary actions, active navigation, and key status.
- The shared shell is a dark navigation rail with a lime active state plus a `⌘K` page palette. Loading states use `PageSkeleton`; do not reintroduce spinner-only page loads. Candidate, staff, and platform dashboards follow the dark next-action panel → metric strip → pipeline/activity layout.
- A shared role-aware `workspace-shell.tsx` provides sidebar/topbar navigation, agency switching, password change, logout, and a mobile drawer. Route guards are navigation-only; FastAPI remains the authorization authority.
- Tests import `.ts` files directly under `tests/`; `allowImportingTsExtensions` supports this without a test framework. Verified commands: `pnpm lint`, `pnpm typecheck`, `pnpm test` (4 passed), and `pnpm build` (18 routes). A scripted HTTP smoke test through the Next proxy passed 20/20 checks against the seeded API.
- Headless Chrome screenshots confirmed login, demo, marketing, all three dashboards, onboarding, jobs, applications, candidates, team, and platform at 1440px, plus login and candidate overview at 390px. The palette and mobile drawer were checked. Full click-through QA is documented in `../backend/docs/MANUAL_TESTING.md`.
