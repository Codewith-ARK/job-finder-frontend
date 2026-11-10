"use client";

import { Alert, Label, TextInput } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { apiErrorMessage } from "@/lib/http.client";
import { useLogin } from "../auth.hooks";
import { safeRedirect } from "../redirect";

export function LoginForm({
  next,
  passwordChanged,
}: {
  next?: string;
  passwordChanged?: boolean;
}) {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    login.mutate(
      { email, password },
      {
        onSuccess: (session) => router.replace(safeRedirect(next, session)),
        onError: (cause) => setError(apiErrorMessage(cause)),
      },
    );
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      {passwordChanged && (
        <Alert color="success">
          Your password was updated. Sign in with the new password.
        </Alert>
      )}
      {error && (
        <Alert color="failure" role="alert">
          {error}
        </Alert>
      )}
      <div>
        <div className="mb-2 block">
          <Label htmlFor="email">Email address</Label>
        </div>
        <TextInput
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="password">Password</Label>
        </div>
        <TextInput
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <ActionButton
        type="submit"
        color="success"
        fullSized
        disabled={login.isPending}
        pending={login.isPending}
      >
        Sign in
      </ActionButton>
      <div className="flex items-center justify-between text-sm">
        <Link
          href="/register"
          className="font-medium text-emerald-700 hover:text-emerald-800"
        >
          Create an account
        </Link>
        <Link
          href="/demo"
          className="font-medium text-slate-600 hover:text-slate-900"
        >
          Explore demo accounts
        </Link>
      </div>
    </form>
  );
}
