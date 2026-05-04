export type Outcome = {
  id: string;
  intentId: string;
  title: string;
  summary: string;
  changed: string[];
  verified: string[];
  risks: string[];
  costSummary: {
    mode: "frugal" | "balanced" | "thorough";
    label: string;
  };
  receipt?: Record<string, unknown>;
  confidence: "low" | "medium" | "high";
  state: "ready" | "accepted" | "reverted" | "archived";
  createdAt: string;
};

export type OutcomeCard = {
  id: string;
  intentId: string;
  title: string;
  summary: string;
  confidence: "low" | "medium" | "high";
  costLabel: string;
  state: string;
  createdAt: string;
};
