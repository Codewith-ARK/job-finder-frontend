"use client";

import { Alert, Label, TextInput } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { apiErrorMessage } from "@/lib/http.client";
import { useRegister } from "../auth.hooks";

export function RegisterForm() {
  const router = useRouter();
  const register = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();

  const tooShort = password.length > 0 && password.length < 8;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    register.mutate(
      { name, email, password },
      {
        onSuccess: () => router.replace("/candidate"),
        onError: (cause) => setError(apiErrorMessage(cause)),
      },
    );
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      {error && (
        <Alert color="failure" role="alert">
          {error}
        </Alert>
      )}
      <div>
        <div className="mb-2 block">
          <Label htmlFor="name">Full name</Label>
        </div>
        <TextInput
          id="name"
          autoComplete="name"
          placeholder="Aya Khan"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          color={tooShort ? "failure" : undefined}
        />
        {tooShort && (
          <p className="mt-1 text-xs text-red-600">
            Use at least 8 characters.
          </p>
        )}
      </div>
      <ActionButton
        type="submit"
        color="success"
        fullSized
        disabled={register.isPending || password.length < 8}
        pending={register.isPending}
      >
        Create account
      </ActionButton>
      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-emerald-700 hover:text-emerald-800"
        >
          Sign in
        </Link>
      </p>
      <p className="text-xs text-slate-500">
        New candidates join the Northstar Careers agency and start with
        onboarding.
      </p>
    </form>
  );
}
