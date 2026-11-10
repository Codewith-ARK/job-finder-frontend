"use client";

import {
  Alert,
  Button,
  Card,
  Label,
  Select,
  Textarea,
  TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Feedback } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { apiErrorMessage } from "@/lib/http.client";
import {
  useCandidateMutation,
  useCandidateWorkspace,
} from "../candidate.hooks";

export function CandidateProfile() {
  const workspace = useCandidateWorkspace();
  const mutation = useCandidateMutation();
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [workType, setWorkType] = useState("Hybrid");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();

  const profile = workspace.data?.profile;

  useEffect(() => {
    if (!profile) return;
    setHeadline(profile.headline);
    setLocation(profile.location);
    setSkills(profile.skills.join(", "));
    setWorkType(profile.preferredWorkType || "Hybrid");
    setPreferredLocation(profile.preferredLocation);
    setSalary(profile.salaryExpectation);
  }, [profile]);

  if (workspace.isPending) {
    return (
      <Feedback kind="loading" title="Loading your profile">
        Fetching your current details.
      </Feedback>
    );
  }

  if (workspace.isError || !profile) {
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

  function save(kind: "profile" | "preferences") {
    setNotice(undefined);
    setError(undefined);
    const action =
      kind === "profile"
        ? {
            type: "profile" as const,
            patch: {
              headline,
              location,
              skills: skills
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            },
          }
        : {
            type: "preferences" as const,
            patch: {
              preferredWorkType: workType,
              preferredLocation,
              salaryExpectation: salary,
            },
          };
    mutation.mutate(action, {
      onSuccess: () =>
        setNotice(
          kind === "profile"
            ? "Profile details saved."
            : "Work preferences saved.",
        ),
      onError: (cause) => setError(apiErrorMessage(cause)),
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Candidate workspace"
        title="Profile and preferences"
        description="Keep these details current — your agency team uses them to match you with the right roles."
      />

      {notice && <Alert color="green">{notice}</Alert>}
      {error && (
        <Alert color="failure" role="alert">
          {error}
        </Alert>
      )}

      <Card>
        <h2 className="text-base font-semibold text-slate-900">
          Professional details
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          A short headline, your location, and the skills you want to lead with.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="headline">Headline</Label>
            </div>
            <TextInput
              id="headline"
              value={headline}
              maxLength={160}
              placeholder="Product designer focused on research-led teams"
              onChange={(event) => setHeadline(event.target.value)}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="location">Location</Label>
            </div>
            <TextInput
              id="location"
              value={location}
              maxLength={160}
              placeholder="Lahore, Pakistan"
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-2 block">
            <Label htmlFor="skills">Skills</Label>
          </div>
          <Textarea
            id="skills"
            rows={2}
            value={skills}
            placeholder="Figma, Research, Communication"
            onChange={(event) => setSkills(event.target.value)}
          />
          <p className="mt-1 text-xs text-slate-500">
            Separate skills with commas.
          </p>
        </div>
        <div className="mt-5 flex justify-end">
          <ActionButton
            color="green"
            onClick={() => save("profile")}
            disabled={mutation.isPending}
            pending={
              mutation.isPending && mutation.variables?.type === "profile"
            }
          >
            Save profile
          </ActionButton>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-900">
          Work preferences
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Tell your team what kind of opportunity feels right.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="work-type">Work type</Label>
            </div>
            <Select
              id="work-type"
              value={workType}
              onChange={(event) => setWorkType(event.target.value)}
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </Select>
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="preferred-location">Preferred location</Label>
            </div>
            <TextInput
              id="preferred-location"
              value={preferredLocation}
              maxLength={160}
              placeholder="Remote, or a city"
              onChange={(event) => setPreferredLocation(event.target.value)}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="salary">Salary expectation</Label>
            </div>
            <TextInput
              id="salary"
              value={salary}
              maxLength={80}
              placeholder="$90k – $120k"
              onChange={(event) => setSalary(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <ActionButton
            color="green"
            onClick={() => save("preferences")}
            disabled={mutation.isPending}
            pending={
              mutation.isPending && mutation.variables?.type === "preferences"
            }
          >
            Save preferences
          </ActionButton>
        </div>
      </Card>
    </div>
  );
}
