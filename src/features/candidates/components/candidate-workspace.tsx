"use client";

import {
  Avatar,
  Button,
  Card,
  Label,
  Progress,
  TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Feedback } from "@/components/ui/feedback";
import { useSession } from "../../auth/auth.hooks.ts";
import {
  useCandidateMutation,
  useCandidateWorkspace,
} from "../candidate.hooks.ts";
import type { CandidateProfilePatch } from "../candidate.types.ts";

type CandidateView = "overview" | "profile";

export function CandidateWorkspace() {
  const { data: session } = useSession();
  const workspace = useCandidateWorkspace();
  const mutation = useCandidateMutation();
  const [view, setView] = useState<CandidateView>("overview");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CandidateProfilePatch>({
    headline: "",
    location: "",
    skills: [],
  });

  useEffect(() => {
    if (workspace.data) {
      setForm({
        headline: workspace.data.profile.headline,
        location: workspace.data.profile.location,
        skills: workspace.data.profile.skills,
      });
    }
  }, [workspace.data]);

  if (workspace.isPending) {
    return (
      <Feedback kind="loading" title="Setting up your candidate workspace…">
        Your profile and onboarding steps are loading.
      </Feedback>
    );
  }
  if (workspace.isError) {
    return (
      <Feedback
        kind="error"
        title="We couldn't open your candidate workspace"
        action={
          <Button type="button" onClick={() => workspace.refetch()}>
            Try again
          </Button>
        }
      >
        {workspace.error.message}
      </Feedback>
    );
  }
  if (!workspace.data || !session) {
    return (
      <Feedback title="Choose your candidate perspective">
        Return to the perspective chooser to open this workspace.
      </Feedback>
    );
  }

  const data = workspace.data;
  const completeProfile = () => {
    mutation.mutate({ type: "onboarding", session, stepId: "profile" });
  };
  const saveProfile = () => {
    mutation.mutate(
      { type: "profile", session, patch: form },
      { onSuccess: () => setEditing(false) },
    );
  };

  return (
    <div className="candidate-workspace">
      <section className="candidate-welcome">
        <div>
          <p className="eyebrow">CANDIDATE HOME</p>
          <h1>Good morning, {data.profile.name.split(" ")[0]}.</h1>
          <p>Your next step is clearer when everything is in one place.</p>
        </div>
        <div
          className="candidate-progress"
          role="img"
          aria-label={`${data.profile.completion}% profile complete`}
        >
          <Progress
            color="green"
            progress={data.profile.completion}
            labelProgress
            textLabel="Profile progress"
          />
          <span>Profile progress</span>
        </div>
      </section>

      <nav className="candidate-tabs" aria-label="Candidate workspace sections">
        <Button color="light" type="button" onClick={() => setView("overview")}>
          Overview
        </Button>
        <Button color="light" type="button" onClick={() => setView("profile")}>
          My profile
        </Button>
        <span className="candidate-tab-note">Private demo record</span>
      </nav>

      {mutation.isError && (
        <p className="error-text" role="alert">
          {mutation.error.message}
        </p>
      )}
      {mutation.isSuccess && (
        <output className="success-text">
          Your demo workspace was updated.
        </output>
      )}

      {view === "profile" ? (
        <section className="profile-panel" aria-labelledby="profile-title">
          <div className="profile-panel-heading">
            <div>
              <p className="eyebrow">YOUR PROFILE</p>
              <h2 id="profile-title">The story you want to tell</h2>
              <p>Keep these details ready for your future team.</p>
            </div>
            <Badge tone="accent">{data.profile.completion}% complete</Badge>
          </div>
          {!editing ? (
            <div className="profile-summary">
              <Avatar
                rounded
                placeholderInitials={data.profile.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              />
              <div className="profile-summary-copy">
                <h3>{data.profile.name}</h3>
                <p>{data.profile.headline}</p>
                <span>
                  {data.profile.location} · {data.profile.email}
                </span>
                <div className="skill-list">
                  {data.profile.skills.map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>
              </div>
              <Button
                color="light"
                type="button"
                onClick={() => setEditing(true)}
              >
                Edit details
              </Button>
            </div>
          ) : (
            <form
              className="profile-form"
              onSubmit={(event) => {
                event.preventDefault();
                saveProfile();
              }}
            >
              <Label htmlFor="candidate-headline">Headline</Label>
              <TextInput
                id="candidate-headline"
                type="text"
                value={form.headline}
                onChange={(event) =>
                  setForm({ ...form, headline: event.target.value })
                }
                placeholder="What are you working toward?"
              />
              <Label htmlFor="candidate-location">Location</Label>
              <TextInput
                id="candidate-location"
                type="text"
                value={form.location}
                onChange={(event) =>
                  setForm({ ...form, location: event.target.value })
                }
                placeholder="City, country"
              />
              <Label htmlFor="candidate-skills">
                Skills (separate with commas)
              </Label>
              <TextInput
                id="candidate-skills"
                type="text"
                value={form.skills.join(", ")}
                onChange={(event) =>
                  setForm({
                    ...form,
                    skills: event.target.value
                      .split(",")
                      .map((skill) => skill.trim())
                      .filter(Boolean),
                  })
                }
              />
              <div className="form-actions">
                <Button
                  color="light"
                  type="button"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  color="dark"
                  type="submit"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Saving…" : "Save profile ↗"}
                </Button>
              </div>
            </form>
          )}
        </section>
      ) : (
        <>
          <section className="candidate-grid-top">
            <Card aria-labelledby="onboarding-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">GETTING STARTED</p>
                  <h2 id="onboarding-title">Your onboarding path</h2>
                </div>
                <Badge>
                  {
                    data.onboarding.filter((step) => step.status === "complete")
                      .length
                  }
                  /{data.onboarding.length} done
                </Badge>
              </div>
              <div className="onboarding-list">
                {data.onboarding.map((step, index) => (
                  <div
                    className={`onboarding-step step-${step.status}`}
                    key={step.id}
                  >
                    <span className="step-indicator">
                      {step.status === "complete" ? "✓" : `0${index + 1}`}
                    </span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                    {step.status === "next" ? (
                      <Button
                        color="light"
                        type="button"
                        onClick={
                          step.id === "profile" ? completeProfile : undefined
                        }
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? "Saving…" : "Complete ↗"}
                      </Button>
                    ) : (
                      <span className="step-status">
                        {step.status === "complete" ? "Done" : "Next"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <div className="profile-card-top">
                <Avatar
                  rounded
                  size="sm"
                  placeholderInitials={data.profile.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                />
                <Badge tone="accent">Private profile</Badge>
              </div>
              <p className="eyebrow">YOUR PROFILE</p>
              <h2>{data.profile.name}</h2>
              <p>{data.profile.headline}</p>
              <span className="profile-location">{data.profile.location}</span>
              <Button
                color="light"
                type="button"
                onClick={() => setView("profile")}
              >
                View profile ↗
              </Button>
            </Card>
          </section>
          <section className="candidate-next" aria-labelledby="next-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">A LITTLE DIRECTION</p>
                <h2 id="next-title">What comes next</h2>
              </div>
              <Badge>Shared roadmap</Badge>
            </div>
            <div className="next-step-grid">
              {data.nextSteps.map((step, index) => (
                <div key={step}>
                  <span>0{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
            <div className="candidate-note">
              <span aria-hidden="true">↗</span>
              <p>
                <strong>Your team will see these updates.</strong> In the next
                workflow task, your supervisor and staff perspectives will share
                the same mock records.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
