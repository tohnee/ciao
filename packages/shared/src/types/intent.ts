import type { CostMode } from "./cost";

export type IntentMode = "ask" | "draft" | "act" | "ship" | "watch" | "review";
export type IntentState =
  | "understanding"
  | "working"
  | "needs_decision"
  | "ready"
  | "accepted"
  | "paused"
  | "blocked"
  | "archived";

export type Intent = {
  id: string;
  workspaceId: string;
  rawInput: string;
  title: string;
  interpretedGoal: string;
  constraints: string[];
  desiredOutcome?: string;
  mode: IntentMode;
  costMode: CostMode;
  state: IntentState;
  importance: "low" | "normal" | "high";
  riskLevel: "unknown" | "low" | "medium" | "high";
  previewMessage?: string;
  createdAt: string;
  updatedAt: string;
};

export type IntentPreview = {
  title: string;
  interpretedGoal: string;
  mode: IntentMode;
  costMode: CostMode;
  constraints: string[];
  riskHints: string[];
  previewMessage: string;
};
