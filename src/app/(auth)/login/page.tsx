import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; passwordChanged?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your candidate, agency, or platform workspace."
      footer={
        <span>
          Demo accounts are available from the{" "}
          <a className="font-medium text-emerald-700" href="/demo">
            demo entry point
          </a>
          .
        </span>
      }
    >
      <LoginForm
        next={params.next}
        passwordChanged={params.passwordChanged === "1"}
      />
    </AuthShell>
  );
}
