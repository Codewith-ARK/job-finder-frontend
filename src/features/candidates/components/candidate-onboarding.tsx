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
import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Badge } from "@/components/ui/badge";
import { Feedback } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { formatBytes, formatRelative } from "@/lib/format";
import { apiErrorMessage } from "@/lib/http.client";
import { candidateDocumentUrl } from "../candidate.api";
import {
  useCandidateMutation,
  useCandidateWorkspace,
} from "../candidate.hooks";

const statusTone = {
  complete: "accent",
  next: "warning",
  upcoming: "neutral",
} as const;

export function CandidateOnboarding() {
  const workspace = useCandidateWorkspace();
  const mutation = useCandidateMutation();
  const [file, setFile] = useState<File>();
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();
  const [pendingDelete, setPendingDelete] = useState<string>();

  if (workspace.isPending) {
    return (
      <Feedback kind="loading" title="Loading onboarding">
        Fetching your steps and documents.
      </Feedback>
    );
  }

  if (workspace.isError) {
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

  const data = workspace.data;
  const hasDocuments = data.documents.length > 0;
  const nextStep = data.onboarding.find((step) => step.status === "next");

  function complete(stepId: string) {
    setNotice(undefined);
    setError(undefined);
    mutation.mutate(
      { type: "step", stepId },
      {
        onSuccess: (updated) => {
          const finished = updated.onboarding.find(
            (item) => item.id === stepId,
          );
          setNotice(`${finished?.title ?? "Step"} marked complete.`);
        },
        onError: (cause) => setError(apiErrorMessage(cause)),
      },
    );
  }

  function upload() {
    if (!file) return;
    setNotice(undefined);
    setError(undefined);
    mutation.mutate(
      { type: "upload", file },
      {
        onSuccess: () => {
          setNotice("Document uploaded.");
          setFile(undefined);
        },
        onError: (cause) => setError(apiErrorMessage(cause)),
      },
    );
  }

  function remove(documentId: string) {
    mutation.mutate(
      { type: "delete-document", documentId },
      {
        onSuccess: () => {
          setPendingDelete(undefined);
          setNotice("Document removed.");
        },
        onError: (cause) => {
          setPendingDelete(undefined);
          setError(apiErrorMessage(cause));
        },
      },
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Candidate workspace"
        title="Onboarding"
        description="Three short steps. Each one unlocks the next, and your team sees progress as you go."
      />

      {notice && <Alert color="success">{notice}</Alert>}
      {error && (
        <Alert color="failure" role="alert">
          {error}
        </Alert>
      )}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Your progress
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {data.profile.completion}% complete
              {nextStep ? ` · next: ${nextStep.title}` : " · all steps done"}
            </p>
          </div>
          <Badge tone={data.profile.completion === 100 ? "accent" : "info"}>
            {
              data.onboarding.filter((step) => step.status === "complete")
                .length
            }{" "}
            / {data.onboarding.length} steps
          </Badge>
        </div>
        <Progress
          progress={data.profile.completion}
          color="success"
          size="sm"
          className="mt-4"
        />
        <ol className="mt-6 space-y-3">
          {data.onboarding.map((step, index) => (
            <li
              key={step.id}
              className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 pl-11 sm:pl-0">
                <Badge tone={statusTone[step.status]}>
                  {step.status === "complete"
                    ? "Complete"
                    : step.status === "next"
                      ? "Next"
                      : "Locked"}
                </Badge>
                {step.status === "next" && step.id !== "documents" && (
                  <ActionButton
                    size="xs"
                    color="success"
                    onClick={() => complete(step.id)}
                    disabled={mutation.isPending}
                    pending={
                      mutation.isPending &&
                      mutation.variables?.type === "step" &&
                      mutation.variables.stepId === step.id
                    }
                  >
                    Mark complete
                  </ActionButton>
                )}
                {step.status === "next" && step.id === "documents" && (
                  <Button
                    size="xs"
                    color="success"
                    onClick={() => complete(step.id)}
                    disabled={mutation.isPending || !hasDocuments}
                    title={
                      hasDocuments
                        ? undefined
                        : "Upload at least one document first"
                    }
                  >
                    Finish onboarding
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Documents
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              PDF or Word files, up to 10 MB. Stored privately and only served
              to you.
            </p>
          </div>
          <Badge tone={hasDocuments ? "accent" : "neutral"}>
            {data.documents.length} uploaded
          </Badge>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <FileInput
              accept=".pdf,.doc,.docx,application/pdf"
              onChange={(event) => setFile(event.target.files?.[0])}
            />
          </div>
          <ActionButton
            color="success"
            onClick={upload}
            disabled={!file || mutation.isPending}
            pending={
              mutation.isPending && mutation.variables?.type === "upload"
            }
          >
            Upload document
          </ActionButton>
        </div>

        {data.documents.length === 0 ? (
          <p className="mt-5 rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-600">
            No documents yet. Upload your CV to complete the final step.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-slate-200">
            {data.documents.map((document) => (
              <li
                key={document.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
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
                    color="failure"
                    size="xs"
                    outline
                    onClick={() => setPendingDelete(document.id)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

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
            color="failure"
            onClick={() => pendingDelete && remove(pendingDelete)}
            pending={mutation.isPending}
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
