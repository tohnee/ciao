"use client";

import { create } from "zustand";
import type { HomePayload, SSEEvent } from "@ciao/shared";

const EMPTY_HOME: HomePayload = {
  greeting: "Good evening.",
  calmState: "calm",
  summary: "CIAO is calm.",
  now: [],
  backgroundLoopCount: 0,
  decisions: [],
  outcomes: [],
};

type HomeState = HomePayload & {
  isLoading: boolean;
  error: string | null;
  lastEventId?: string;
  fetchHome: () => Promise<void>;
  handleEvent: (event: SSEEvent) => void;
  setLastEventId: (id: string) => void;
};

export const useHomeStore = create<HomeState>((set) => ({
  ...EMPTY_HOME,
  isLoading: false,
  error: null,
  lastEventId: undefined,
  fetchHome: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/home");
      if (!response.ok) {
        throw new Error(`Failed to load home data (${response.status})`);
      }
      const payload = (await response.json()) as HomePayload;
      set({ ...payload, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load home data",
        isLoading: false,
      });
    }
  },
  setLastEventId: (id: string) => set({ lastEventId: id }),
  handleEvent: (event) => {
    if (event.id) {
      set({ lastEventId: event.id });
    }
    if (event.type === "calm_state_changed") {
      set({ calmState: event.data.calmState, summary: event.data.summary });
    }
    if (event.type === "decision_created") {
      set((current) => ({
        calmState: "needs_you",
        summary: "One decision needs you.",
        decisions: [event.data, ...current.decisions.filter((decision) => decision.id !== event.data.id)].slice(0, 5),
      }));
    }
    if (event.type === "outcome_ready") {
      set((current) => ({
        outcomes: [event.data, ...current.outcomes.filter((outcome) => outcome.id !== event.data.id)].slice(0, 5),
      }));
    }
    if (event.type === "loop_progress") {
      set((current) => ({
        now: current.now.map((card) =>
          card.intentId === event.data.intentId ? { ...card, message: event.data.message } : card,
        ),
      }));
    }
  },
}));
