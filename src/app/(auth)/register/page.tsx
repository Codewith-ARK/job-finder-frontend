import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your candidate account"
      subtitle="Start with a profile, then work through onboarding at your own pace."
    >
      <RegisterForm />
    </AuthShell>
  );
}
