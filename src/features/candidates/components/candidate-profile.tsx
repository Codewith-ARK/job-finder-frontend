"use client";

import { Alert, Button, Card } from "flowbite-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Feedback } from "@/components/ui/feedback";
import {
  IconBriefcase,
  IconCalendar,
  IconChecklist,
  IconMapPin,
  IconUser,
} from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { apiErrorMessage } from "@/lib/http.client";
import { candidateDocumentUrl } from "../candidate.api";
import { useCandidateWorkspace } from "../candidate.hooks";

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
        {label}
      </dt>
      <dd className="text-sm text-slate-700 sm:text-right">
        {value || <span className="text-slate-400">Not set</span>}
      </dd>
    </div>
  );
}

export function CandidateProfile() {
  const workspace = useCandidateWorkspace();

  if (workspace.isPending) {
    return (
      <Feedback kind="loading" title="Loading your profile">
        Fetching your current details.
      </Feedback>
    );
  }

  if (workspace.isError) {
    return (
      <Feedback
        kind="error"
        title="We could not load your profile"
        action={<Button onClick={() => workspace.refetch()}>Try again</Button>}
      >
        {apiErrorMessage(workspace.error)}
      </Feedback>
    );
  }

  const data = workspace.data;
  const preferences = data.preferences;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Candidate workspace"
        title="Your profile"
        description="This is what teams see when they review your applications. Edit everything in onboarding."
        actions={
          <Button color="green" as={Link} href="/candidate/onboarding">
            Edit in onboarding
          </Button>
        }
      />

      {!data.onboardingComplete && (
        <Alert color="warning">
          Your onboarding is still in progress. Finish the remaining steps to
          make your profile ready for review.
        </Alert>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-ink">
                  {data.profile.name}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {data.profile.headline || "Add a headline in onboarding"}
                </p>
              </div>
              <Badge tone={data.onboardingComplete ? "accent" : "warning"}>
                {data.onboardingComplete ? "Ready" : "In progress"}
              </Badge>
            </div>
            {data.profile.summary && (
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {data.profile.summary}
              </p>
            )}
            <dl className="mt-5 divide-y divide-slate-100">
              <Detail
                label="Location"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <IconMapPin className="h-3.5 w-3.5 text-slate-400" />
                    {data.profile.location}
                  </span>
                }
              />
              <Detail label="Email" value={data.profile.email} />
              <Detail label="Phone" value={data.profile.phone} />
              <Detail
                label="Path"
                value={
                  data.referral
                    ? `Referred by ${data.referral.referrerName} · ${data.referral.agencyName}`
                    : "Independent candidate"
                }
              />
            </dl>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {data.profile.linkedinUrl && (
                <a
                  href={data.profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-emerald-700 hover:text-emerald-800"
                >
                  LinkedIn
                </a>
              )}
              {data.profile.portfolioUrl && (
                <a
                  href={data.profile.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-emerald-700 hover:text-emerald-800"
                >
                  Portfolio
                </a>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <IconBriefcase className="h-4 w-4 text-emerald-700" />
              <h2 className="text-base font-semibold text-ink">
                Professional details
              </h2>
            </div>
            <dl className="mt-3 divide-y divide-slate-100">
              <Detail
                label="Current or target title"
                value={data.profile.currentTitle}
              />
              <Detail
                label="Experience level"
                value={data.profile.experienceLevel}
              />
              <Detail label="Work type" value={preferences?.workType} />
              <Detail
                label="Preferred location"
                value={preferences?.preferredLocation}
              />
              <Detail
                label="Salary expectation"
                value={preferences?.salaryExpectation}
              />
              <Detail label="Availability" value={preferences?.availability} />
              <Detail
                label="Willing to relocate"
                value={preferences?.willingToRelocate ? "Yes" : "No"}
              />
            </dl>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {data.skills.length === 0 ? (
                <p className="text-xs text-slate-500">No skills added yet.</p>
              ) : (
                data.skills.map((skill) => (
                  <Badge key={skill} tone="neutral">
                    {skill}
                  </Badge>
                ))
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <IconCalendar className="h-4 w-4 text-emerald-700" />
              <h2 className="text-base font-semibold text-ink">Experience</h2>
            </div>
            {data.experiences.length === 0 ? (
              <EmptyState
                title="No roles added yet"
                description="Add roles in onboarding so teams can see what you have worked on."
              />
            ) : (
              <ul className="mt-4 space-y-4">
                {data.experiences.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="text-sm font-semibold text-ink">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.company}
                      {item.location ? ` · ${item.location}` : ""}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
                      {item.startDate} –{" "}
                      {item.current ? "Present" : item.endDate || "—"}
                    </p>
                    {item.description && (
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <IconChecklist className="h-4 w-4 text-emerald-700" />
              <h2 className="text-base font-semibold text-ink">Education</h2>
            </div>
            {data.education.length === 0 ? (
              <EmptyState
                title="No education added yet"
                description="Add your qualifications in onboarding to complete this section."
              />
            ) : (
              <ul className="mt-4 space-y-4">
                {data.education.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="text-sm font-semibold text-ink">
                      {item.degree}
                      {item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ""}
                    </p>
                    <p className="text-xs text-slate-500">{item.institution}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
                      {item.startYear} – {item.endYear ?? "Present"}
                      {item.grade ? ` · ${item.grade}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2">
              <IconUser className="h-4 w-4 text-emerald-700" />
              <h2 className="text-base font-semibold text-ink">Documents</h2>
            </div>
            {data.documents.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-slate-300 px-4 py-5 text-center text-sm text-slate-500">
                No documents uploaded yet.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {data.documents.map((document) => (
                  <li
                    key={document.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <span className="min-w-0 truncate text-sm text-slate-700">
                      {document.filename}
                    </span>
                    <a
                      href={candidateDocumentUrl(document.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <Button
              color="light"
              size="xs"
              className="mt-4"
              as={Link}
              href="/candidate/onboarding"
            >
              Manage documents
            </Button>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-ink">
              Suggested next steps
            </h2>
            <ul className="mt-3 space-y-3">
              {data.nextSteps.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-3 text-sm leading-relaxed text-slate-600"
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-100 font-mono text-[9px] font-semibold text-emerald-800">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
