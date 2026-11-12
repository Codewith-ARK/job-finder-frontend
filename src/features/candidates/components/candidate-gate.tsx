"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Feedback } from "@/components/ui/feedback";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { useCandidateWorkspace } from "../candidate.hooks";

const ONBOARDING_PATH = "/candidate/onboarding";

/**
 * Navigation-only guard: incomplete candidates are sent to onboarding. The API
 * still authorizes every candidate operation regardless of the route.
 */
export function CandidateGate({ children }: { children: React.ReactNode }) {
  const workspace = useCandidateWorkspace();
  const pathname = usePathname();
  const router = useRouter();
  const onOnboarding = pathname.startsWith(ONBOARDING_PATH);
  const incomplete = workspace.data
    ? !workspace.data.onboardingComplete
    : false;

  useEffect(() => {
    if (incomplete && !onOnboarding) router.replace(ONBOARDING_PATH);
  }, [incomplete, onOnboarding, router]);

  if (workspace.isPending) return <PageSkeleton />;

  if (incomplete && !onOnboarding) {
    return (
      <Feedback kind="loading" title="Opening onboarding">
        Your profile needs a few more details before you can use the rest of the
        workspace.
      </Feedback>
    );
  }

  return <>{children}</>;
}
