"use client";

import { create } from "zustand";
import type { CostMode, IntentMode, IntentPreview } from "@ciao/shared";

type CommandState = {
  rawInput: string;
  mode: IntentMode | null;
  costMode: CostMode;
  preview: IntentPreview | null;
  isSubmitting: boolean;
  error: string | null;
  setInput: (value: string) => void;
  setMode: (value: IntentMode) => void;
  setCostMode: (value: CostMode) => void;
  setPreview: (preview: IntentPreview | null) => void;
  requestPreview: () => Promise<void>;
  startIntent: (options?: { forceDecision?: boolean }) => Promise<void>;
  reset: () => void;
  clearError: () => void;
};

export const useCommandStore = create<CommandState>((set) => ({
  rawInput: "",
  mode: null,
  costMode: "balanced",
  preview: null,
  isSubmitting: false,
  error: null,
  setInput: (rawInput) => set({ rawInput, preview: null, error: null }),
  setMode: (mode) => set({ mode }),
  setCostMode: (costMode) => set({ costMode }),
  setPreview: (preview) => set({ preview }),
  clearError: () => set({ error: null }),
  requestPreview: async () => {
    set({ isSubmitting: true, error: null });
    try {
      const state = useCommandStore.getState();
      const response = await fetch("/api/intents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          rawInput: state.rawInput,
          mode: state.mode ?? "ship",
          costMode: state.costMode,
          autoStart: false,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${response.status})`);
      }

      const data = (await response.json()) as { preview: IntentPreview };
      set({ preview: data.preview, isSubmitting: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to get preview",
        isSubmitting: false,
      });
    }
  },
  startIntent: async (options) => {
    set({ isSubmitting: true, error: null });
    try {
      const state = useCommandStore.getState();
      const response = await fetch("/api/intents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          rawInput: state.rawInput,
          mode: state.mode ?? "ship",
          costMode: state.costMode,
          autoStart: true,
          forceDecision: options?.forceDecision ?? (state.preview?.riskHints.length ?? 0) > 0,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${response.status})`);
      }

      set({
        rawInput: "",
        mode: null,
        costMode: "balanced",
        preview: null,
        isSubmitting: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to start intent",
        isSubmitting: false,
      });
    }
  },
  reset: () => set({ rawInput: "", mode: null, costMode: "balanced", preview: null, isSubmitting: false, error: null }),
}));
