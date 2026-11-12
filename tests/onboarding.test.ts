import assert from "node:assert/strict";
import test from "node:test";
import type { CandidateWorkspaceData } from "../src/features/candidates/candidate.types.ts";
import {
  emptyDraft,
  mergeDraft,
  stepIssues,
  toAcademicInput,
  toProfessionalInput,
} from "../src/features/candidates/onboarding-draft.ts";

function workspace(
  overrides: Partial<CandidateWorkspaceData> = {},
): CandidateWorkspaceData {
  return {
    profile: {
      name: "Aya Khan",
      email: "aya@example.com",
      headline: "Product designer",
      summary: "",
      phone: "server-phone",
      location: "Lahore",
      linkedinUrl: "",
      portfolioUrl: "",
      currentTitle: "Product designer",
      experienceLevel: "Mid",
      completion: 20,
      stage: "onboarding",
    },
    preferences: {
      workType: "Remote",
      preferredLocation: "Lahore",
      salaryExpectation: "",
      availability: "",
      willingToRelocate: false,
    },
    experiences: [
      {
        id: "exp-1",
        company: "Northstar",
        title: "Designer",
        location: "Lahore",
        startDate: "2022-01",
        endDate: null,
        current: true,
        description: "",
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "NCA",
        degree: "BFA",
        fieldOfStudy: "Design",
        startYear: 2018,
        endYear: 2022,
        grade: "",
      },
    ],
    skills: ["Figma"],
    onboarding: [
      {
        id: "personal",
        title: "Personal details",
        description: "",
        status: "complete",
      },
      {
        id: "professional",
        title: "Professional details",
        description: "",
        status: "next",
      },
      {
        id: "academic",
        title: "Academic details",
        description: "",
        status: "upcoming",
      },
      {
        id: "documents",
        title: "Documents",
        description: "",
        status: "upcoming",
      },
    ],
    nextSteps: [],
    documents: [],
    onboardingComplete: false,
    referral: null,
    ...overrides,
  };
}

test("completed server steps win over stale local drafts", () => {
  const stored = emptyDraft();
  stored.personal.phone = "draft-phone";
  stored.personal.headline = "Draft headline";
  stored.professional.currentTitle = "Draft title";

  const merged = mergeDraft(workspace(), stored);

  assert.equal(merged.personal.phone, "server-phone");
  assert.equal(merged.personal.headline, "Product designer");
  assert.equal(merged.professional.currentTitle, "Draft title");
  assert.equal(merged.professional.experiences.length, 0);
});

test("step conversions preserve entered values without inventing dates", () => {
  const draft = emptyDraft();
  draft.professional.currentTitle = "Designer";
  draft.professional.skills = "Figma, Research, figma";
  draft.professional.preferences.preferredLocation = "Remote";
  draft.professional.experiences = [
    {
      key: "local-1",
      company: "Acme",
      title: "Designer",
      location: "",
      startDate: "2023-04",
      endDate: "",
      current: true,
      description: "",
    },
  ];
  draft.academic.education = [
    {
      key: "local-2",
      institution: "NCA",
      degree: "BFA",
      fieldOfStudy: "",
      startYear: "2018",
      endYear: "",
      grade: "",
    },
  ];

  const professional = toProfessionalInput(draft);
  assert.equal(professional.experiences[0]?.startDate, "2023-04");
  assert.equal(professional.experiences[0]?.id, undefined);
  assert.deepEqual(professional.skills, ["Figma", "Research", "figma"]);

  const academic = toAcademicInput(draft);
  assert.equal(academic.education[0]?.startYear, 2018);
  assert.equal(academic.education[0]?.endYear, null);
});

test("client validation mirrors the server's step requirements", () => {
  assert.deepEqual(stepIssues(emptyDraft(), "personal"), [
    "Add a phone number.",
    "Add your location.",
    "Add a headline.",
  ]);

  const personal = emptyDraft();
  personal.personal.phone = "0300";
  personal.personal.location = "Lahore";
  personal.personal.headline = "Designer";
  personal.personal.linkedinUrl = "linkedin.com/in/aya";
  assert.match(stepIssues(personal, "personal")[0] ?? "", /http/);

  const incompleteExperience = emptyDraft();
  incompleteExperience.professional.currentTitle = "Designer";
  incompleteExperience.professional.skills = "Figma";
  incompleteExperience.professional.preferences.preferredLocation = "Remote";
  incompleteExperience.professional.experiences = [
    {
      key: "local-1",
      company: "Acme",
      title: "Designer",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ];
  assert.match(
    stepIssues(incompleteExperience, "professional").join(" "),
    /start month/,
  );

  const incompleteEducation = emptyDraft();
  incompleteEducation.academic.education = [
    {
      key: "local-2",
      institution: "NCA",
      degree: "BFA",
      fieldOfStudy: "",
      startYear: "",
      endYear: "",
      grade: "",
    },
  ];
  assert.match(
    stepIssues(incompleteEducation, "academic").join(" "),
    /start year/,
  );

  const valid = emptyDraft();
  valid.personal.phone = "0300";
  valid.personal.location = "Lahore";
  valid.personal.headline = "Designer";
  valid.professional.currentTitle = "Designer";
  valid.professional.skills = "Figma";
  valid.professional.preferences.preferredLocation = "Remote";
  valid.academic.education = [
    {
      key: "local-2",
      institution: "NCA",
      degree: "BFA",
      fieldOfStudy: "",
      startYear: "2018",
      endYear: "2022",
      grade: "",
    },
  ];
  assert.deepEqual(stepIssues(valid, "personal"), []);
  assert.deepEqual(stepIssues(valid, "professional"), []);
  assert.deepEqual(stepIssues(valid, "academic"), []);
});
