"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingDraft } from "./onboarding-draft.ts";

interface OnboardingState {
  drafts: Record<string, OnboardingDraft>;
  saveDraft: (userId: string, draft: OnboardingDraft) => void;
  clearDraft: (userId: string) => void;
}

/**
 * Local-only onboarding draft. Keys are candidate user ids so one browser can
 * hold work for more than one account. Passwords and uploaded files are never
 * stored here; only text fields that also exist in the server contract.
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      drafts: {},
      saveDraft: (userId, draft) =>
        set((state) => ({
          drafts: { ...state.drafts, [userId]: draft },
        })),
      clearDraft: (userId) =>
        set((state) => {
          const drafts = { ...state.drafts };
          delete drafts[userId];
          return { drafts };
        }),
    }),
    {
      name: "jf-onboarding-drafts",
      version: 1,
      partialize: (state) => ({ drafts: state.drafts }),
    },
  ),
);
