export type DecisionOption = {
  id: string;
  label: string;
  description?: string;
  impact?: {
    cost?: "lower" | "normal" | "higher";
    risk?: "lower" | "normal" | "higher";
    speed?: "slower" | "normal" | "faster";
  };
};

export type Decision = {
  id: string;
  intentId: string;
  title: string;
  question: string;
  recommendation?: string | null;
  options: DecisionOption[];
  severity: "low" | "medium" | "high";
  state: "open" | "resolved" | "dismissed" | "expired";
  createdAt: string;
};

export type DecisionCard = Decision & {
  intentTitle: string;
};
