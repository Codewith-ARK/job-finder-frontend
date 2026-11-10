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

- `package.json` declares pnpm `11.8.0`; `pnpm-lock.yaml` is the only frontend lockfile, and Node `v24.19.0` is installed.
- T01 uses `(marketing)`, `(auth)`, and `(workspace)` route groups. Routes compose feature components; the public home stays outside Query providers. `auth` and `workspace` features contain API functions, hooks, keys, contracts, and development mock adapters.
- Configured scripts are `dev`, `dev:mock`, `build`, `start`, `lint` (`biome check`), `typecheck` (`next typegen && tsc --noEmit`), `test` (Node's test runner with TypeScript stripping), and `format`. Tests import `.ts` files directly; `allowImportingTsExtensions` supports this without a test framework.
- `src/lib/query.client.ts` reuses one browser QueryClient across auth/workspace providers, creates separate clients during server rendering, and exposes private-request cancellation/cache cleanup. `src/lib/http.client.ts` configures Axios for `/api`, cookies, and a timeout. No real endpoint/proxy is connected; pass cancellation signals when adding API calls.
- `next.config.ts` preserves the React compiler and Tailwind Turbopack CSS handling. `.env.example` contains only the public mock flag; `scripts/dev-mock.mjs` loads it using Node's native API before invoking the installed Next CLI. Production rejects mock mode even when the flag is true.
- `src/lib/mocks/` owns fictional personas/agencies and browser-memory session state; feature adapters clone returned data and support AbortSignal cancellation. Session mutations serialize, cancel private work, clear private cache, and publish the new session. The prototype role/workspace mapping is presentation, not an approved permission matrix.
- Biome is configured for repository-wide formatting/linting while ignoring generated folders including `node_modules`, `.next`, `dist`, and `build`.
- T02.1 adds `src/features/candidates/` as the candidate workflow boundary: candidate types, private query keys, API functions, hooks, and a mock adapter. Candidate components keep form/view state local and update the feature query cache only after successful mutations.
- Candidate mock records are keyed by user and validated against the active user, agency, and candidate workspace before reads or writes. The current UI supports profile edits and ordered onboarding completion; skipping an upcoming step is an explicit error. This remains presentation-only until a real API contract is verified.
- Flowbite React `0.12.17` is the default UI component library. Use its available components before writing custom primitives; custom markup/CSS is reserved for product-specific compositions or gaps in the library. Current usage includes Badge, Alert, Spinner, Button, Card, Avatar, Progress, Label, TextInput, and Select.
- T02.2 adds `src/features/staff/` as the staff workflow boundary. It owns agency-scoped candidate summaries, team members, workload/activity records, private query keys, hooks, API functions, and mock mutations. The `/staff` route composes the staff workspace component without owning business logic.
- Supervisor-only presentation controls include candidate assignment/reassignment and simulated team-member creation. Employee views remain read-oriented in the mock UI. These are presentation states only and must become backend-authorized operations during real integration.
- Flowbite visual evaluation currently uses default component props/styles. Do not add project-specific colors, sizes, or component classes unless the task explicitly asks to reintroduce customization; retain only outer layout classes needed for page structure.
- T02.3 adds `src/features/jobs/` for shared mock jobs and applications. Candidate and staff routes consume the same agency-scoped records so candidate submissions and staff status updates remain visible across perspectives.
- T02.4 adds `src/features/platform/` for platform overview, agency, integration, and audit previews. These are mock presentation surfaces and do not imply real platform permissions or external-service connectivity.
