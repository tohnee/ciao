import type { Intent, Loop, Signal } from "@ciao/shared";

export type GovernorContext = {
  intent: Intent;
  loops: Loop[];
  signals: Signal[];
  confidence: number;
  systemPromptOverride?: string;
};

export type NextStep =
  | { type: "run_capability"; capability: string }
  | { type: "ask_decision"; title: string; question: string }
  | { type: "build_outcome" }
  | { type: "pause"; reason: string };
