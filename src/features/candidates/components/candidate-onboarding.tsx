"use client";

import {
  Alert,
  Button,
  Card,
  FileInput,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
} from "flowbite-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Badge } from "@/components/ui/badge";
import { Feedback } from "@/components/ui/feedback";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { formatBytes, formatRelative } from "@/lib/format";
import { apiErrorMessage } from "@/lib/http.client";
import { useSession } from "../../auth/auth.hooks";
import { candidateDocumentUrl } from "../candidate.api";
import {
  useCandidateMutation,
  useCandidateWorkspace,
} from "../candidate.hooks";
import { useOnboardingStore } from "../candidate.store";
import type {
  CandidateWorkspaceData,
  OnboardingStepId,
} from "../candidate.types";
import type { OnboardingDraft } from "../onboarding-draft";
import {
  mergeDraft,
  stepIssues,
  toAcademicInput,
  toPersonalInput,
  toProfessionalInput,
} from "../onboarding-draft";
import {
  AcademicFields,
  PersonalFields,
  ProfessionalFields,
  ReviewSummary,
} from "./onboarding-fields";

type WizardId = "account" | OnboardingStepId | "review";

const WIZARD: { id: WizardId; title: string; description: string }[] = [
  {
    id: "account",
    title: "Account",
    description: "Confirm the account this profile belongs to.",
  },
  {
    id: "personal",
    title: "Personal",
    description: "How teams reach you and the headline they see first.",
  },
  {
    id: "professional",
    title: "Professional",
    description: "Your role, experience, skills, and work preferences.",
  },
  {
    id: "academic",
    title: "Academic",
    description: "Your education and qualifications.",
  },
  {
    id: "documents",
    title: "Documents",
    description: "Upload your CV and any supporting files.",
  },
  {
    id: "review",
    title: "Review",
    description: "Check everything before you finish.",
  },
];

function isServerStep(id: WizardId): id is OnboardingStepId {
  return id !== "account" && id !== "review";
}

function wizardIndex(id: WizardId): number {
  return WIZARD.findIndex((item) => item.id === id);
}

function initialStep(data: CandidateWorkspaceData): WizardId {
  if (data.onboardingComplete) return "review";
  const next = data.onboarding.find((step) => step.status === "next");
  return (next?.id as WizardId | undefined) ?? "review";
}

function firstIncomplete(data: CandidateWorkspaceData): WizardId {
  const next = data.onboarding.find((step) => step.status !== "complete");
  return (next?.id as WizardId | undefined) ?? "review";
}

const serverStepTone = {
  complete: "accent",
  next: "warning",
  upcoming: "neutral",
} as const;

export function CandidateOnboarding() {
  const workspace = useCandidateWorkspace();
  const mutation = useCandidateMutation();
  const { data: session } = useSession();
  const saveDraft = useOnboardingStore((state) => state.saveDraft);
  const clearDraft = useOnboardingStore((state) => state.clearDraft);

  const userId = session?.user.id;
  const [draft, setDraft] = useState<OnboardingDraft>();
  const [active, setActive] = useState<WizardId>("personal");
  const [busy, setBusy] = useState<"save" | "upload" | "delete" | "finish">();
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();
  const [file, setFile] = useState<File>();
  const [pendingDelete, setPendingDelete] = useState<string>();
  const initializedFor = useRef<string | undefined>(undefined);

  const data = workspace.data;

  useEffect(() => {
    if (!data || !userId || initializedFor.current === userId) return;
    // Read the persisted draft directly so keystrokes do not re-run this effect.
    const stored = useOnboardingStore.getState().drafts[userId];
    setDraft(mergeDraft(data, stored));
    setActive(initialStep(data));
    initializedFor.current = userId;
  }, [data, userId]);

  function updateDraft(next: OnboardingDraft) {
    setDraft(next);
    if (userId) saveDraft(userId, next);
  }

  function applyServer(updated: CandidateWorkspaceData) {
    setDraft((current) => {
      const merged = mergeDraft(updated, current);
      if (userId) {
        if (updated.onboardingComplete) {
          clearDraft(userId);
        } else {
          saveDraft(userId, merged);
        }
      }
      return merged;
    });
  }

  if (workspace.isPending || !draft) {
    return (
      <Feedback kind="loading" title="Loading onboarding">
        Restoring your saved steps and local draft.
      </Feedback>
    );
  }

  if (workspace.isError || !data) {
    return (
      <Feedback
        kind="error"
        title="We could not load onboarding"
        action={<Button onClick={() => workspace.refetch()}>Try again</Button>}
      >
        {apiErrorMessage(workspace.error)}
      </Feedback>
    );
  }

  const completed = data.onboarding.filter(
    (step) => step.status === "complete",
  ).length;
  const activeIndex = wizardIndex(active);
  const activeMeta = WIZARD[activeIndex] ?? WIZARD[1];
  const activeServerStep = isServerStep(active)
    ? data.onboarding.find((step) => step.id === active)
    : undefined;
  const activeLocked = activeServerStep?.status === "upcoming";
  const editable =
    active === "personal" || active === "professional" || active === "academic";

  function stepLocked(id: WizardId): boolean {
    if (!isServerStep(id)) return false;
    return (
      data?.onboarding.find((step) => step.id === id)?.status === "upcoming"
    );
  }

  function goTo(id: WizardId) {
    if (busy) return;
    setError(undefined);
    setActive(id);
  }

  async function saveAndContinue(
    step: "personal" | "professional" | "academic",
  ) {
    if (!draft) return;
    if (stepLocked(step)) {
      setError("Complete the previous step first.");
      return;
    }
    const issues = stepIssues(draft, step);
    if (issues.length > 0) {
      setError(issues[0]);
      setNotice(undefined);
      return;
    }
    setBusy("save");
    setError(undefined);
    setNotice(undefined);
    try {
      if (step === "personal") {
        await mutation.mutateAsync({
          type: "personal",
          input: toPersonalInput(draft),
        });
      } else if (step === "professional") {
        await mutation.mutateAsync({
          type: "professional",
          input: toProfessionalInput(draft),
        });
      } else {
        await mutation.mutateAsync({
          type: "academic",
          input: toAcademicInput(draft),
        });
      }
      const updated = await mutation.mutateAsync({
        type: "step",
        stepId: step,
      });
      applyServer(updated);
      setNotice(`${WIZARD[wizardIndex(step)].title} saved.`);
      setActive(WIZARD[wizardIndex(step) + 1]?.id ?? "review");
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(undefined);
    }
  }

  async function finish() {
    if (!data || data.documents.length === 0) {
      setError("Upload at least one document first.");
      return;
    }
    setBusy("finish");
    setError(undefined);
    setNotice(undefined);
    try {
      const updated = await mutation.mutateAsync({
        type: "step",
        stepId: "documents",
      });
      applyServer(updated);
      setNotice("Onboarding complete. Your profile is ready.");
      setActive("review");
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(undefined);
    }
  }

  async function upload() {
    if (!file) return;
    setBusy("upload");
    setError(undefined);
    setNotice(undefined);
    try {
      const updated = await mutation.mutateAsync({ type: "upload", file });
      applyServer(updated);
      setNotice("Document uploaded.");
      setFile(undefined);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(undefined);
    }
  }

  async function remove(documentId: string) {
    setBusy("delete");
    setError(undefined);
    setNotice(undefined);
    try {
      const updated = await mutation.mutateAsync({
        type: "delete-document",
        documentId,
      });
      applyServer(updated);
      setPendingDelete(undefined);
      setNotice("Document removed.");
    } catch (cause) {
      setPendingDelete(undefined);
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(undefined);
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Candidate workspace"
        title="Onboarding"
        description="A complete profile takes a few minutes. Every step saves to your account, and anything typed but not yet saved stays on this device."
      />

      {notice && <Alert color="green">{notice}</Alert>}
      {error && (
        <Alert color="failure" role="alert">
          {error}
        </Alert>
      )}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Your progress</h2>
            <p className="mt-1 text-sm text-slate-600">
              {data.profile.completion}% complete · {completed} of{" "}
              {data.onboarding.length} steps saved
            </p>
          </div>
          <Badge tone={data.onboardingComplete ? "accent" : "info"}>
            {data.onboardingComplete ? "Ready" : "In progress"}
          </Badge>
        </div>
        <Progress
          progress={data.profile.completion}
          color="green"
          size="sm"
          className="mt-4"
        />
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[17rem_1fr]">
        <nav aria-label="Onboarding steps" className="panel p-3">
          <ol className="space-y-1">
            {WIZARD.map((item, index) => {
              const current = item.id === active;
              const step = isServerStep(item.id)
                ? data.onboarding.find((entry) => entry.id === item.id)
                : undefined;
              const complete = step?.status === "complete";
              const locked = step?.status === "upcoming";
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={current ? "step" : undefined}
                    disabled={Boolean(busy) || locked}
                    title={
                      locked ? "Complete the previous step first" : undefined
                    }
                    onClick={() => goTo(item.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      current
                        ? "bg-forest-deep text-white"
                        : locked
                          ? "cursor-not-allowed text-slate-400"
                          : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
                        complete
                          ? "bg-lime text-forest-deep"
                          : current
                            ? "bg-white/15 text-white"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {complete ? (
                        <IconCheck className="h-3.5 w-3.5" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium">
                        {item.title}
                      </span>
                      {step && (
                        <span
                          className={`block text-[10px] uppercase tracking-[0.12em] ${
                            current ? "text-white/55" : "text-slate-400"
                          }`}
                        >
                          {complete
                            ? "Complete"
                            : locked
                              ? "Locked"
                              : "Current"}
                        </span>
                      )}
                    </span>
                    {current && (
                      <IconArrowRight className="h-4 w-4 text-lime" />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 border-t border-slate-200 px-3 pt-3 text-[11px] leading-relaxed text-slate-500">
            Unsaved edits are restored the next time you sign in on this device.
          </p>
        </nav>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
                Step {activeIndex + 1} of {WIZARD.length}
              </p>
              <h2 className="mt-1.5 text-lg font-semibold text-ink">
                {activeMeta.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {activeMeta.description}
              </p>
            </div>
            {activeServerStep && (
              <Badge tone={serverStepTone[activeServerStep.status]}>
                {activeServerStep.status === "complete"
                  ? "Complete"
                  : activeServerStep.status === "next"
                    ? "Next"
                    : "Locked"}
              </Badge>
            )}
          </div>

          <div className="mt-6">
            {activeLocked && (
              <Alert color="warning">
                Complete the previous step before editing this one.
              </Alert>
            )}

            {active === "account" && (
              <div className="space-y-5 text-sm text-slate-600">
                <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">
                  <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:justify-between sm:gap-6">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                      Name
                    </dt>
                    <dd className="text-slate-700">{data.profile.name}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:justify-between sm:gap-6">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                      Email
                    </dt>
                    <dd className="text-slate-700">{data.profile.email}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:justify-between sm:gap-6">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                      Access
                    </dt>
                    <dd className="text-right text-slate-700">
                      {data.referral
                        ? `Referred by ${data.referral.referrerName} · ${data.referral.agencyName}`
                        : "Independent candidate · every open role"}
                    </dd>
                  </div>
                </dl>
                <p className="leading-relaxed">
                  Your name and email come from your account. Use the account
                  menu to change your password. The rest of onboarding is saved
                  to your profile as you go.
                </p>
              </div>
            )}

            {active === "personal" && (
              <PersonalFields
                value={draft.personal}
                onChange={(personal) => updateDraft({ ...draft, personal })}
              />
            )}

            {active === "professional" && (
              <ProfessionalFields
                value={draft.professional}
                onChange={(professional) =>
                  updateDraft({ ...draft, professional })
                }
              />
            )}

            {active === "academic" && (
              <AcademicFields
                value={draft.academic}
                onChange={(academic) => updateDraft({ ...draft, academic })}
              />
            )}

            {active === "documents" && (
              <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <FileInput
                      accept=".pdf,.doc,.docx,application/pdf"
                      onChange={(event) => setFile(event.target.files?.[0])}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      PDF or Word, up to 10 MB. Stored privately and only served
                      to you.
                    </p>
                  </div>
                  <ActionButton
                    color="green"
                    onClick={upload}
                    disabled={!file || Boolean(busy)}
                    pending={busy === "upload"}
                  >
                    Upload document
                  </ActionButton>
                </div>

                {data.documents.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                    No documents yet. Upload at least one file to finish this
                    step.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 px-4">
                    {data.documents.map((document) => (
                      <li
                        key={document.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">
                            {document.filename}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatBytes(document.size)} · uploaded{" "}
                            {formatRelative(document.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={candidateDocumentUrl(document.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Download
                          </a>
                          <Button
                            color="red"
                            size="xs"
                            outline
                            disabled={Boolean(busy)}
                            onClick={() => setPendingDelete(document.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {active === "review" && (
              <div className="space-y-5">
                {!data.onboardingComplete && (
                  <Alert color="warning">
                    Some steps are still open. Finish them in order, then come
                    back here to review.
                  </Alert>
                )}
                <ReviewSummary
                  draft={draft}
                  documents={data.documents}
                  name={data.profile.name}
                  email={data.profile.email}
                  referral={data.referral}
                />
                <p className="text-xs text-slate-500">
                  Your saved profile is the source of truth. Anything edited on
                  this device but not saved is shown here for review only.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <Button
              color="light"
              disabled={activeIndex === 0 || Boolean(busy)}
              onClick={() => goTo(WIZARD[activeIndex - 1].id)}
            >
              Back
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              {active === "account" && (
                <Button
                  color="green"
                  onClick={() => goTo(firstIncomplete(data))}
                >
                  Start onboarding
                  <IconArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              {editable && (
                <ActionButton
                  color="green"
                  onClick={() =>
                    saveAndContinue(
                      active as "personal" | "professional" | "academic",
                    )
                  }
                  disabled={Boolean(busy) || activeLocked}
                  pending={busy === "save"}
                >
                  Save and continue
                </ActionButton>
              )}

              {active === "documents" && (
                <ActionButton
                  color="green"
                  onClick={finish}
                  disabled={Boolean(busy) || data.documents.length === 0}
                  pending={busy === "finish"}
                  title={
                    data.documents.length === 0
                      ? "Upload at least one document first"
                      : undefined
                  }
                >
                  Finish onboarding
                </ActionButton>
              )}

              {active === "review" &&
                (data.onboardingComplete ? (
                  <Button color="green" as={Link} href="/candidate/jobs">
                    Browse open roles
                  </Button>
                ) : (
                  <Button
                    color="green"
                    onClick={() => goTo(firstIncomplete(data))}
                  >
                    Continue onboarding
                  </Button>
                ))}
            </div>
          </div>
        </Card>
      </div>

      <Modal
        show={Boolean(pendingDelete)}
        size="md"
        onClose={() => setPendingDelete(undefined)}
      >
        <ModalHeader>Remove document</ModalHeader>
        <ModalBody>
          <p className="text-sm text-slate-600">
            This removes the file from your onboarding record. You can upload a
            replacement afterwards.
          </p>
        </ModalBody>
        <ModalFooter>
          <ActionButton
            color="red"
            onClick={() => pendingDelete && remove(pendingDelete)}
            pending={busy === "delete"}
          >
            Remove document
          </ActionButton>
          <Button color="light" onClick={() => setPendingDelete(undefined)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
