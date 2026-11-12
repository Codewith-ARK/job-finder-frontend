"use client";

import { Button } from "flowbite-react";
import Link from "next/link";
import { Feedback } from "@/components/ui/feedback";
import { apiErrorMessage } from "@/lib/http.client";
import { AuthShell } from "../../auth/components/auth-shell";
import { RegisterForm } from "../../auth/components/register-form";
import { useReferralResolve } from "../referrals.hooks";

export function ReferralJoin({ token }: { token: string }) {
  const referral = useReferralResolve(token);

  if (referral.isPending) {
    return (
      <AuthShell
        title="Checking your invitation"
        subtitle="One moment while we confirm this referral link."
      >
        <Feedback kind="loading" title="Validating referral link">
          This usually takes a second.
        </Feedback>
      </AuthShell>
    );
  }

  if (referral.isError) {
    return (
      <AuthShell
        title="We could not check this link"
        subtitle="The referral service is not responding. You can still create an account."
      >
        <Feedback
          kind="error"
          title="Referral link unavailable"
          action={
            <Button color="green" as={Link} href="/register">
              Create an account
            </Button>
          }
        >
          {apiErrorMessage(referral.error)}
        </Feedback>
      </AuthShell>
    );
  }

  const data = referral.data;

  if (!data.valid) {
    return (
      <AuthShell
        title="This invitation is not available"
        subtitle={
          data.reason ||
          "This referral link has already been used, expired, or was revoked."
        }
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-slate-600">
            You can still create an independent candidate account and browse
            every open role. If you expected an agency referral, ask the person
            who invited you for a new link.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button color="green" as={Link} href="/register">
              Create an account
            </Button>
            <Button color="light" as={Link} href="/login">
              Sign in
            </Button>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={`Join ${data.agencyName || "your agency"}`}
      subtitle={
        data.referrerName
          ? `${data.referrerName} invited you to create a candidate account.`
          : "Create a candidate account through this invitation."
      }
      footer={
        <span>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            Sign in
          </Link>
        </span>
      }
    >
      <RegisterForm
        referralToken={token}
        referral={{
          agencyName: data.agencyName,
          referrerName: data.referrerName,
        }}
      />
    </AuthShell>
  );
}
