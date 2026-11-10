"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clearPrivateQueries } from "../../lib/query.client.ts";
import {
  changePassword,
  demoLogin,
  getDemoPersonas,
  getSession,
  login,
  logout,
  register,
  switchAgency,
} from "./auth.api.ts";
import { authKeys } from "./auth.keys.ts";
import type {
  LoginInput,
  PasswordChangeInput,
  RegisterInput,
  Session,
} from "./auth.types.ts";

export function useSession() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: ({ signal }) => getSession(signal),
    staleTime: 30_000,
    retry: false,
  });
}

export function useDemoPersonas() {
  return useQuery({
    queryKey: authKeys.personas,
    queryFn: ({ signal }) => getDemoPersonas(signal),
    staleTime: 5 * 60_000,
    retry: false,
  });
}

function useSessionMutation<TInput>(
  mutationFn: (input: TInput) => Promise<Session>,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (session) => {
      await clearPrivateQueries(client);
      client.setQueryData(authKeys.session, session);
    },
  });
}

export function useLogin() {
  return useSessionMutation<LoginInput>(login);
}

export function useRegister() {
  return useSessionMutation<RegisterInput>(register);
}

export function useDemoLogin() {
  return useSessionMutation<string>(demoLogin);
}

export function useSwitchAgency() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: switchAgency,
    onSuccess: async (session) => {
      await clearPrivateQueries(client);
      client.setQueryData(authKeys.session, session);
    },
  });
}

export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await clearPrivateQueries(client);
      client.setQueryData(authKeys.session, null);
    },
  });
}

export function useChangePassword() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: PasswordChangeInput) => changePassword(input),
    onSuccess: async () => {
      await clearPrivateQueries(client);
      client.setQueryData(authKeys.session, null);
    },
  });
}
