import type {
  AcademicStepInput,
  CandidateWorkspaceData,
  EducationInput,
  ExperienceInput,
  ExperienceLevel,
  OnboardingStepId,
  PersonalStepInput,
  ProfessionalStepInput,
  WorkType,
} from "./candidate.types.ts";

export interface ExperienceDraft {
  key: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationDraft {
  key: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  grade: string;
}

export interface ProfessionalDraft {
  currentTitle: string;
  experienceLevel: ExperienceLevel;
  skills: string;
  experiences: ExperienceDraft[];
  preferences: {
    workType: WorkType;
    preferredLocation: string;
    salaryExpectation: string;
    availability: string;
    willingToRelocate: boolean;
  };
}

export interface OnboardingDraft {
  personal: PersonalStepInput;
  professional: ProfessionalDraft;
  academic: { education: EducationDraft[] };
}

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "Entry",
  "Junior",
  "Mid",
  "Senior",
  "Lead",
  "Executive",
];

const WORK_TYPES: WorkType[] = ["Remote", "Hybrid", "On-site", "Flexible"];

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

type EditableStepId = Exclude<OnboardingStepId, "documents">;

function hasContent(values: string[]): boolean {
  return values.some((value) => value.trim() !== "");
}

function yearIsValid(value: string): boolean {
  const year = Number(value);
  return Number.isInteger(year) && year >= 1950 && year <= 2100;
}

function experienceIssues(item: ExperienceDraft, index: number): string[] {
  const label = `Role ${index + 1}`;
  const issues: string[] = [];
  const started =
    item.current ||
    hasContent([
      item.company,
      item.title,
      item.location,
      item.startDate,
      item.endDate,
      item.description,
    ]);
  if (!started) return issues;
  if (!item.company.trim()) issues.push(`${label}: add a company.`);
  if (!item.title.trim()) issues.push(`${label}: add a title.`);
  if (!MONTH_PATTERN.test(item.startDate)) {
    issues.push(`${label}: add a start month.`);
  }
  if (!item.current && item.endDate) {
    if (!MONTH_PATTERN.test(item.endDate)) {
      issues.push(`${label}: add a valid end month.`);
    } else if (item.startDate && item.endDate < item.startDate) {
      issues.push(`${label}: the end month cannot be before the start month.`);
    }
  }
  return issues;
}

function educationIssues(item: EducationDraft, index: number): string[] {
  const label = `Qualification ${index + 1}`;
  const issues: string[] = [];
  const started = hasContent([
    item.institution,
    item.degree,
    item.fieldOfStudy,
    item.startYear,
    item.endYear,
    item.grade,
  ]);
  if (!started) return issues;
  if (!item.institution.trim()) issues.push(`${label}: add an institution.`);
  if (!item.degree.trim()) issues.push(`${label}: add a degree.`);
  if (!yearIsValid(item.startYear)) {
    issues.push(`${label}: add a start year between 1950 and 2100.`);
  }
  if (item.endYear.trim()) {
    if (!yearIsValid(item.endYear)) {
      issues.push(`${label}: add an end year between 1950 and 2100.`);
    } else if (item.startYear && item.endYear < item.startYear) {
      issues.push(`${label}: the end year cannot be before the start year.`);
    }
  }
  return issues;
}

/** Client-side mirror of the server's step requirements. */
export function stepIssues(
  draft: OnboardingDraft,
  step: EditableStepId,
): string[] {
  if (step === "personal") {
    const issues: string[] = [];
    if (!draft.personal.phone.trim()) issues.push("Add a phone number.");
    if (!draft.personal.location.trim()) issues.push("Add your location.");
    if (!draft.personal.headline.trim()) issues.push("Add a headline.");
    for (const [label, value] of [
      ["LinkedIn", draft.personal.linkedinUrl],
      ["Portfolio", draft.personal.portfolioUrl],
    ] as const) {
      const link = value.trim();
      if (link && !/^https?:\/\//.test(link)) {
        issues.push(`${label}: start the link with http:// or https://.`);
      }
    }
    return issues;
  }

  if (step === "professional") {
    const issues: string[] = [];
    if (!draft.professional.currentTitle.trim()) {
      issues.push("Add your current or target title.");
    }
    if (!draft.professional.skills.trim())
      issues.push("Add at least one skill.");
    if (!draft.professional.preferences.preferredLocation.trim()) {
      issues.push("Add a preferred location.");
    }
    draft.professional.experiences.forEach((item, index) => {
      issues.push(...experienceIssues(item, index));
    });
    return issues;
  }

  const issues: string[] = [];
  if (draft.academic.education.length === 0) {
    issues.push("Add at least one education entry.");
  }
  draft.academic.education.forEach((item, index) => {
    issues.push(...educationIssues(item, index));
  });
  return issues;
}

export function newKey(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
  );
}

export function asExperienceLevel(value: string): ExperienceLevel {
  return EXPERIENCE_LEVELS.find((level) => level === value) ?? "Entry";
}

export function asWorkType(value: string): WorkType {
  return WORK_TYPES.find((type) => type === value) ?? "Flexible";
}

export function emptyDraft(): OnboardingDraft {
  return {
    personal: {
      phone: "",
      location: "",
      headline: "",
      summary: "",
      linkedinUrl: "",
      portfolioUrl: "",
    },
    professional: {
      currentTitle: "",
      experienceLevel: "Entry",
      skills: "",
      experiences: [],
      preferences: {
        workType: "Flexible",
        preferredLocation: "",
        salaryExpectation: "",
        availability: "",
        willingToRelocate: false,
      },
    },
    academic: { education: [] },
  };
}

export function draftFromWorkspace(
  data: CandidateWorkspaceData,
): OnboardingDraft {
  return {
    personal: {
      phone: data.profile.phone,
      location: data.profile.location,
      headline: data.profile.headline,
      summary: data.profile.summary,
      linkedinUrl: data.profile.linkedinUrl,
      portfolioUrl: data.profile.portfolioUrl,
    },
    professional: {
      currentTitle: data.profile.currentTitle,
      experienceLevel: asExperienceLevel(data.profile.experienceLevel),
      skills: data.skills.join(", "),
      experiences: data.experiences.map((item) => ({
        key: item.id,
        company: item.company,
        title: item.title,
        location: item.location,
        startDate: item.startDate,
        endDate: item.endDate ?? "",
        current: item.current,
        description: item.description,
      })),
      preferences: {
        workType: asWorkType(data.preferences?.workType ?? ""),
        preferredLocation: data.preferences?.preferredLocation ?? "",
        salaryExpectation: data.preferences?.salaryExpectation ?? "",
        availability: data.preferences?.availability ?? "",
        willingToRelocate: data.preferences?.willingToRelocate ?? false,
      },
    },
    academic: {
      education: data.education.map((item) => ({
        key: item.id,
        institution: item.institution,
        degree: item.degree,
        fieldOfStudy: item.fieldOfStudy,
        startYear: String(item.startYear),
        endYear: item.endYear ? String(item.endYear) : "",
        grade: item.grade,
      })),
    },
  };
}

function stepStatus(data: CandidateWorkspaceData, step: OnboardingStepId) {
  return data.onboarding.find((item) => item.id === step)?.status;
}

/**
 * Server-saved complete steps win; the persisted local draft only restores
 * unsaved edits for steps that are still in progress.
 */
export function mergeDraft(
  data: CandidateWorkspaceData,
  stored: OnboardingDraft | undefined,
): OnboardingDraft {
  const server = draftFromWorkspace(data);
  if (!stored) return server;
  return {
    personal:
      stepStatus(data, "personal") === "complete"
        ? server.personal
        : { ...server.personal, ...stored.personal },
    professional:
      stepStatus(data, "professional") === "complete"
        ? server.professional
        : {
            ...server.professional,
            ...stored.professional,
            preferences: {
              ...server.professional.preferences,
              ...stored.professional?.preferences,
            },
          },
    academic:
      stepStatus(data, "academic") === "complete"
        ? server.academic
        : {
            ...server.academic,
            ...stored.academic,
            education: stored.academic?.education ?? server.academic.education,
          },
  };
}

export function toPersonalInput(draft: OnboardingDraft): PersonalStepInput {
  return {
    phone: draft.personal.phone.trim(),
    location: draft.personal.location.trim(),
    headline: draft.personal.headline.trim(),
    summary: draft.personal.summary.trim(),
    linkedinUrl: draft.personal.linkedinUrl.trim(),
    portfolioUrl: draft.personal.portfolioUrl.trim(),
  };
}

export function toProfessionalInput(
  draft: OnboardingDraft,
): ProfessionalStepInput {
  const { professional } = draft;
  return {
    currentTitle: professional.currentTitle.trim(),
    experienceLevel: professional.experienceLevel,
    skills: professional.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
    experiences: professional.experiences
      .filter((item) => item.company.trim() && item.title.trim())
      .map(
        (item): ExperienceInput => ({
          id: item.key.startsWith("local-") ? undefined : item.key,
          company: item.company.trim(),
          title: item.title.trim(),
          location: item.location.trim(),
          startDate: item.startDate,
          endDate: item.current ? null : item.endDate || null,
          current: item.current,
          description: item.description.trim(),
        }),
      ),
    preferences: {
      workType: professional.preferences.workType,
      preferredLocation: professional.preferences.preferredLocation.trim(),
      salaryExpectation: professional.preferences.salaryExpectation.trim(),
      availability: professional.preferences.availability.trim(),
      willingToRelocate: professional.preferences.willingToRelocate,
    },
  };
}

export function toAcademicInput(draft: OnboardingDraft): AcademicStepInput {
  return {
    education: draft.academic.education
      .filter((item) => item.institution.trim() && item.degree.trim())
      .map(
        (item): EducationInput => ({
          id: item.key.startsWith("local-") ? undefined : item.key,
          institution: item.institution.trim(),
          degree: item.degree.trim(),
          fieldOfStudy: item.fieldOfStudy.trim(),
          startYear: Number(item.startYear),
          endYear: item.endYear ? Number(item.endYear) : null,
          grade: item.grade.trim(),
        }),
      ),
  };
}
