import type { CostMode, ModelTier } from "./cost";

export type LoopKind = "understand" | "plan" | "search" | "edit" | "test" | "review" | "summarize" | "remember" | "monitor";

export type Loop = {
  id: string;
  intentId: string;
  kind: LoopKind;
  state: "queued" | "running" | "completed" | "failed" | "paused";
  costMode: CostMode;
  modelTier?: ModelTier;
};
