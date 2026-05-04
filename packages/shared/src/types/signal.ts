export type SignalKind = "progress" | "risk" | "cost" | "confidence" | "blocker" | "decision" | "result";
export type SignalLevel = "low" | "medium" | "high";

export type Signal = {
  id: string;
  intentId: string;
  kind: SignalKind;
  level: SignalLevel;
  message: string;
  compact: boolean;
  createdAt: string;
};
