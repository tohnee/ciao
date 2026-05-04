import type { DecisionCard } from "./decision";
import type { OutcomeCard } from "./outcome";

export type NowCard = {
  intentId: string;
  title: string;
  state: string;
  message: string;
  costMode: string;
  risk: string;
  confidence: "low" | "medium" | "high";
};

export type HomePayload = {
  greeting: string;
  calmState: "calm" | "working" | "needs_you" | "attention";
  summary: string;
  now: NowCard[];
  backgroundLoopCount: number;
  decisions: DecisionCard[];
  outcomes: OutcomeCard[];
};

export type SSEEvent =
  | { id?: string; type: "signal"; data: unknown }
  | { id?: string; type: "decision_created"; data: DecisionCard }
  | { id?: string; type: "outcome_ready"; data: OutcomeCard }
  | { id?: string; type: "intent_state_changed"; data: { intentId: string; state: string } }
  | { id?: string; type: "calm_state_changed"; data: { calmState: HomePayload["calmState"]; summary: string } }
  | { id?: string; type: "loop_progress"; data: { intentId: string; message: string } };
