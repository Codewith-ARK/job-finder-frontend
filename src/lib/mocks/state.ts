import type { DemoPersona, Session } from "../../features/auth/auth.types.ts";

const northstar = { id: "mock-agency-northstar", name: "Northstar Careers" };
const harbor = { id: "mock-agency-harbor", name: "Harbor Talent" };

export const demoPersonas: DemoPersona[] = [
  {
    id: "mock-candidate-aya",
    name: "Aya Khan",
    role: "candidate",
    label: "Candidate",
    description:
      "A place for your profile, opportunities, and application updates.",
    workspace: "candidate",
    agencies: [northstar],
  },
  {
    id: "mock-employee-sam",
    name: "Sam Ali",
    role: "employee",
    label: "Employee",
    description: "A shared staff workspace for candidate and application work.",
    workspace: "staff",
    agencies: [northstar],
  },
  {
    id: "mock-supervisor-noor",
    name: "Noor Ahmed",
    role: "supervisor",
    label: "Supervisor",
    description: "The staff workspace from a team and assignment perspective.",
    workspace: "staff",
    agencies: [northstar, harbor],
  },
  {
    id: "mock-platform-jules",
    name: "Jules Lee",
    role: "platform-admin",
    label: "Platform",
    description:
      "A foundation for the future platform administration experience.",
    workspace: "platform",
    agencies: [{ id: "mock-platform", name: "Platform preview" }],
  },
];

// Browser-memory presentation state; reload starts a new demo, with no credentials.
let session: Session | null = null;

export function readMockSession(): Session | null {
  return structuredClone(session);
}

export function selectMockSession(
  personaId: string,
  agencyId?: string,
): Session {
  const persona = demoPersonas.find((item) => item.id === personaId);
  if (!persona) throw new Error("Choose an available demo perspective.");
  const agency = agencyId
    ? persona.agencies.find((item) => item.id === agencyId)
    : persona.agencies[0];
  if (!agency)
    throw new Error("This agency is not part of that demo perspective.");
  const { description: _, ...user } = persona;
  session = structuredClone({ user, agency });
  return readMockSession() as Session;
}

export function endMockSession(): null {
  session = null;
  return null;
}
