"use client";

import {
  Button,
  Checkbox,
  Label,
  Select,
  Textarea,
  TextInput,
} from "flowbite-react";
import { Badge } from "@/components/ui/badge";
import { IconClose, IconPlus } from "@/components/ui/icons";
import type {
  CandidateDocument,
  PersonalStepInput,
} from "../candidate.types.ts";
import type {
  EducationDraft,
  ExperienceDraft,
  OnboardingDraft,
  ProfessionalDraft,
} from "../onboarding-draft.ts";
import { newKey } from "../onboarding-draft.ts";

const EXPERIENCE_LEVELS = [
  "Entry",
  "Junior",
  "Mid",
  "Senior",
  "Lead",
  "Executive",
];

const WORK_TYPES = ["Remote", "Hybrid", "On-site", "Flexible"];

const AVAILABILITY = [
  "Immediately",
  "2 weeks",
  "1 month",
  "2–3 months",
  "Flexible",
];

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2 block">
      <Label htmlFor={htmlFor}>{children}</Label>
    </div>
  );
}

export function PersonalFields({
  value,
  onChange,
}: {
  value: PersonalStepInput;
  onChange: (next: PersonalStepInput) => void;
}) {
  const set = (patch: Partial<PersonalStepInput>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <TextInput
            id="phone"
            value={value.phone}
            maxLength={40}
            placeholder="+92 300 1234567"
            required
            onChange={(event) => set({ phone: event.target.value })}
          />
        </div>
        <div>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          <TextInput
            id="location"
            value={value.location}
            maxLength={160}
            placeholder="Lahore, Pakistan"
            required
            onChange={(event) => set({ location: event.target.value })}
          />
        </div>
      </div>
      <div>
        <FieldLabel htmlFor="headline">Headline</FieldLabel>
        <TextInput
          id="headline"
          value={value.headline}
          maxLength={160}
          placeholder="Product designer focused on research-led teams"
          required
          onChange={(event) => set({ headline: event.target.value })}
        />
        <p className="mt-1 text-xs text-slate-500">
          One line that tells a team what you do.
        </p>
      </div>
      <div>
        <FieldLabel htmlFor="summary">Summary</FieldLabel>
        <Textarea
          id="summary"
          rows={4}
          value={value.summary}
          maxLength={1000}
          placeholder="A short paragraph about your background and what you are looking for."
          onChange={(event) => set({ summary: event.target.value })}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="linkedin">LinkedIn</FieldLabel>
          <TextInput
            id="linkedin"
            type="url"
            value={value.linkedinUrl}
            maxLength={255}
            placeholder="https://linkedin.com/in/you"
            onChange={(event) => set({ linkedinUrl: event.target.value })}
          />
        </div>
        <div>
          <FieldLabel htmlFor="portfolio">Portfolio</FieldLabel>
          <TextInput
            id="portfolio"
            type="url"
            value={value.portfolioUrl}
            maxLength={255}
            placeholder="https://your-portfolio.example.com"
            onChange={(event) => set({ portfolioUrl: event.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export function ProfessionalFields({
  value,
  onChange,
}: {
  value: ProfessionalDraft;
  onChange: (next: ProfessionalDraft) => void;
}) {
  const set = (patch: Partial<ProfessionalDraft>) =>
    onChange({ ...value, ...patch });
  const setPreference = (patch: Partial<ProfessionalDraft["preferences"]>) =>
    onChange({
      ...value,
      preferences: { ...value.preferences, ...patch },
    });

  function updateExperience(index: number, patch: Partial<ExperienceDraft>) {
    set({
      experiences: value.experiences.map((item, position) =>
        position === index ? { ...item, ...patch } : item,
      ),
    });
  }

  function addExperience() {
    set({
      experiences: [
        ...value.experiences,
        {
          key: `local-${newKey()}`,
          company: "",
          title: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    });
  }

  function removeExperience(index: number) {
    set({
      experiences: value.experiences.filter(
        (_item, position) => position !== index,
      ),
    });
  }

  return (
    <div className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="current-title">
            Current or target title
          </FieldLabel>
          <TextInput
            id="current-title"
            value={value.currentTitle}
            maxLength={120}
            placeholder="Product designer"
            required
            onChange={(event) => set({ currentTitle: event.target.value })}
          />
        </div>
        <div>
          <FieldLabel htmlFor="experience-level">Experience level</FieldLabel>
          <Select
            id="experience-level"
            value={value.experienceLevel}
            onChange={(event) =>
              set({
                experienceLevel: event.target
                  .value as ProfessionalDraft["experienceLevel"],
              })
            }
          >
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="skills">Skills</FieldLabel>
        <Textarea
          id="skills"
          rows={2}
          value={value.skills}
          placeholder="Figma, Research, Communication"
          onChange={(event) => set({ skills: event.target.value })}
        />
        <p className="mt-1 text-xs text-slate-500">
          Separate skills with commas. Duplicates are removed when you save.
        </p>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-ink">Experience</h3>
            <p className="mt-1 text-xs text-slate-500">
              Add each role you want a team to see. You can leave this empty if
              you are just starting out.
            </p>
          </div>
          <Button color="light" size="xs" onClick={addExperience}>
            <IconPlus className="mr-1.5 h-3.5 w-3.5" /> Add role
          </Button>
        </div>

        {value.experiences.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-slate-300 px-4 py-5 text-center text-sm text-slate-500">
            No roles added yet.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {value.experiences.map((item, index) => (
              <div
                key={item.key}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                    Role {index + 1}
                  </p>
                  <button
                    type="button"
                    aria-label={`Remove role ${index + 1}`}
                    title="Remove role"
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-coral"
                    onClick={() => removeExperience(index)}
                  >
                    <IconClose className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor={`company-${item.key}`}>
                      Company
                    </FieldLabel>
                    <TextInput
                      id={`company-${item.key}`}
                      value={item.company}
                      maxLength={160}
                      onChange={(event) =>
                        updateExperience(index, { company: event.target.value })
                      }
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor={`title-${item.key}`}>Title</FieldLabel>
                    <TextInput
                      id={`title-${item.key}`}
                      value={item.title}
                      maxLength={160}
                      onChange={(event) =>
                        updateExperience(index, { title: event.target.value })
                      }
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor={`experience-location-${item.key}`}>
                      Location
                    </FieldLabel>
                    <TextInput
                      id={`experience-location-${item.key}`}
                      value={item.location}
                      maxLength={160}
                      onChange={(event) =>
                        updateExperience(index, {
                          location: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel htmlFor={`start-${item.key}`}>
                        Start
                      </FieldLabel>
                      <TextInput
                        id={`start-${item.key}`}
                        type="month"
                        value={item.startDate}
                        onChange={(event) =>
                          updateExperience(index, {
                            startDate: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <FieldLabel htmlFor={`end-${item.key}`}>End</FieldLabel>
                      <TextInput
                        id={`end-${item.key}`}
                        type="month"
                        value={item.endDate}
                        disabled={item.current}
                        onChange={(event) =>
                          updateExperience(index, {
                            endDate: event.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Checkbox
                    id={`current-${item.key}`}
                    checked={item.current}
                    onChange={(event) =>
                      updateExperience(index, {
                        current: event.target.checked,
                        endDate: event.target.checked ? "" : item.endDate,
                      })
                    }
                  />
                  <Label htmlFor={`current-${item.key}`} className="text-sm">
                    I currently work here
                  </Label>
                </div>
                <div className="mt-3">
                  <FieldLabel htmlFor={`description-${item.key}`}>
                    Highlights
                  </FieldLabel>
                  <Textarea
                    id={`description-${item.key}`}
                    rows={2}
                    value={item.description}
                    maxLength={1000}
                    placeholder="What you owned and what changed."
                    onChange={(event) =>
                      updateExperience(index, {
                        description: event.target.value,
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink">Work preferences</h3>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="work-type">Work type</FieldLabel>
            <Select
              id="work-type"
              value={value.preferences.workType}
              onChange={(event) =>
                setPreference({
                  workType: event.target
                    .value as ProfessionalDraft["preferences"]["workType"],
                })
              }
            >
              {WORK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <FieldLabel htmlFor="preferred-location">
              Preferred location
            </FieldLabel>
            <TextInput
              id="preferred-location"
              value={value.preferences.preferredLocation}
              maxLength={160}
              placeholder="Remote, or a city"
              onChange={(event) =>
                setPreference({ preferredLocation: event.target.value })
              }
            />
          </div>
          <div>
            <FieldLabel htmlFor="salary">Salary expectation</FieldLabel>
            <TextInput
              id="salary"
              value={value.preferences.salaryExpectation}
              maxLength={80}
              placeholder="$90k – $120k"
              onChange={(event) =>
                setPreference({ salaryExpectation: event.target.value })
              }
            />
          </div>
          <div>
            <FieldLabel htmlFor="availability">Availability</FieldLabel>
            <Select
              id="availability"
              value={value.preferences.availability}
              onChange={(event) =>
                setPreference({ availability: event.target.value })
              }
            >
              <option value="">Select availability</option>
              {AVAILABILITY.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Checkbox
            id="relocate"
            checked={value.preferences.willingToRelocate}
            onChange={(event) =>
              setPreference({ willingToRelocate: event.target.checked })
            }
          />
          <Label htmlFor="relocate" className="text-sm">
            I am willing to relocate
          </Label>
        </div>
      </div>
    </div>
  );
}

export function AcademicFields({
  value,
  onChange,
}: {
  value: { education: EducationDraft[] };
  onChange: (next: { education: EducationDraft[] }) => void;
}) {
  function update(itemKey: string, patch: Partial<EducationDraft>) {
    onChange({
      education: value.education.map((item) =>
        item.key === itemKey ? { ...item, ...patch } : item,
      ),
    });
  }

  function add() {
    onChange({
      education: [
        ...value.education,
        {
          key: `local-${newKey()}`,
          institution: "",
          degree: "",
          fieldOfStudy: "",
          startYear: "",
          endYear: "",
          grade: "",
        },
      ],
    });
  }

  function remove(itemKey: string) {
    onChange({
      education: value.education.filter((item) => item.key !== itemKey),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">Education</h3>
          <p className="mt-1 text-xs text-slate-500">
            Add at least one qualification. You can add more than one.
          </p>
        </div>
        <Button color="light" size="xs" onClick={add}>
          <IconPlus className="mr-1.5 h-3.5 w-3.5" /> Add education
        </Button>
      </div>

      {value.education.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          No education added yet.
        </p>
      ) : (
        value.education.map((item, index) => (
          <div
            key={item.key}
            className="rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                Qualification {index + 1}
              </p>
              <button
                type="button"
                aria-label={`Remove qualification ${index + 1}`}
                title="Remove qualification"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-coral"
                onClick={() => remove(item.key)}
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor={`institution-${item.key}`}>
                  Institution
                </FieldLabel>
                <TextInput
                  id={`institution-${item.key}`}
                  value={item.institution}
                  maxLength={160}
                  onChange={(event) =>
                    update(item.key, { institution: event.target.value })
                  }
                />
              </div>
              <div>
                <FieldLabel htmlFor={`degree-${item.key}`}>Degree</FieldLabel>
                <TextInput
                  id={`degree-${item.key}`}
                  value={item.degree}
                  maxLength={160}
                  placeholder="BSc"
                  onChange={(event) =>
                    update(item.key, { degree: event.target.value })
                  }
                />
              </div>
              <div>
                <FieldLabel htmlFor={`field-${item.key}`}>
                  Field of study
                </FieldLabel>
                <TextInput
                  id={`field-${item.key}`}
                  value={item.fieldOfStudy}
                  maxLength={160}
                  onChange={(event) =>
                    update(item.key, { fieldOfStudy: event.target.value })
                  }
                />
              </div>
              <div>
                <FieldLabel htmlFor={`grade-${item.key}`}>Grade</FieldLabel>
                <TextInput
                  id={`grade-${item.key}`}
                  value={item.grade}
                  maxLength={40}
                  placeholder="3.6 GPA or Honours"
                  onChange={(event) =>
                    update(item.key, { grade: event.target.value })
                  }
                />
              </div>
              <div>
                <FieldLabel htmlFor={`start-year-${item.key}`}>
                  Start year
                </FieldLabel>
                <TextInput
                  id={`start-year-${item.key}`}
                  type="number"
                  min={1950}
                  max={2100}
                  value={item.startYear}
                  onChange={(event) =>
                    update(item.key, { startYear: event.target.value })
                  }
                />
              </div>
              <div>
                <FieldLabel htmlFor={`end-year-${item.key}`}>
                  End year
                </FieldLabel>
                <TextInput
                  id={`end-year-${item.key}`}
                  type="number"
                  min={1950}
                  max={2100}
                  value={item.endYear}
                  placeholder="Leave blank if ongoing"
                  onChange={(event) =>
                    update(item.key, { endYear: event.target.value })
                  }
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
        {label}
      </dt>
      <dd className="text-sm text-slate-700 sm:text-right">
        {value || <span className="text-slate-400">Not set</span>}
      </dd>
    </div>
  );
}

export function ReviewSummary({
  draft,
  documents,
  name,
  email,
  referral,
}: {
  draft: OnboardingDraft;
  documents: CandidateDocument[];
  name: string;
  email: string;
  referral: { agencyName: string; referrerName: string } | null;
}) {
  const skills = draft.professional.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-ink">Account</h3>
          <dl className="mt-2 divide-y divide-slate-100">
            <SummaryRow label="Name" value={name} />
            <SummaryRow label="Email" value={email} />
            <SummaryRow
              label="Path"
              value={
                referral
                  ? `Referred by ${referral.referrerName} · ${referral.agencyName}`
                  : "Independent candidate"
              }
            />
          </dl>
        </section>
        <section className="rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-ink">Personal</h3>
          <dl className="mt-2 divide-y divide-slate-100">
            <SummaryRow label="Phone" value={draft.personal.phone} />
            <SummaryRow label="Location" value={draft.personal.location} />
            <SummaryRow label="Headline" value={draft.personal.headline} />
          </dl>
        </section>
        <section className="rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-ink">Professional</h3>
          <dl className="mt-2 divide-y divide-slate-100">
            <SummaryRow label="Title" value={draft.professional.currentTitle} />
            <SummaryRow
              label="Level"
              value={draft.professional.experienceLevel}
            />
            <SummaryRow
              label="Work type"
              value={draft.professional.preferences.workType}
            />
            <SummaryRow
              label="Preferred location"
              value={draft.professional.preferences.preferredLocation}
            />
            <SummaryRow
              label="Salary"
              value={draft.professional.preferences.salaryExpectation}
            />
          </dl>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {skills.length === 0 ? (
              <span className="text-xs text-slate-400">No skills added</span>
            ) : (
              skills.map((skill) => (
                <Badge key={skill} tone="neutral">
                  {skill}
                </Badge>
              ))
            )}
          </div>
          <div className="mt-4 space-y-2">
            {draft.professional.experiences.map((item) => (
              <div key={item.key} className="text-xs text-slate-600">
                <p className="font-medium text-slate-800">
                  {item.title || "Role"} · {item.company || "Company"}
                </p>
                <p>
                  {item.startDate || "?"} –{" "}
                  {item.current ? "Present" : item.endDate || "?"}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-ink">Academic</h3>
          <div className="mt-2 divide-y divide-slate-100">
            {draft.academic.education.length === 0 ? (
              <p className="py-2 text-sm text-slate-400">No education added</p>
            ) : (
              draft.academic.education.map((item) => (
                <div key={item.key} className="py-2 text-sm text-slate-700">
                  <p className="font-medium text-slate-800">
                    {item.degree || "Qualification"}
                    {item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ""}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.institution || "Institution"} ·{" "}
                    {item.startYear || "?"}
                    {" – "}
                    {item.endYear || "Present"}
                  </p>
                </div>
              ))
            )}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            {documents.length} document{documents.length === 1 ? "" : "s"}{" "}
            uploaded
          </p>
        </section>
      </div>
    </div>
  );
}
