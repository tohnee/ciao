import type { CostMode, ModelTier } from "@ciao/shared";

export type CostPolicy = {
  maxContextTokens: number;
  preferredModelTier: ModelTier;
  maxLoopsPerIntent: number;
  allowModelEscalation: boolean;
  reviewRequired: boolean;
};

export function getCostPolicy(costMode: CostMode): CostPolicy {
  if (costMode === "frugal") {
    return {
      maxContextTokens: 4000,
      preferredModelTier: "small",
      maxLoopsPerIntent: 5,
      allowModelEscalation: false,
      reviewRequired: false,
    };
  }

  if (costMode === "thorough") {
    return {
      maxContextTokens: 64000,
      preferredModelTier: "strong",
      maxLoopsPerIntent: 25,
      allowModelEscalation: true,
      reviewRequired: true,
    };
  }

  return {
    maxContextTokens: 16000,
    preferredModelTier: "medium",
    maxLoopsPerIntent: 12,
    allowModelEscalation: true,
    reviewRequired: false,
  };
}
