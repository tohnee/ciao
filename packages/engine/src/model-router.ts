import type { ModelTier } from "@ciao/shared";

const MODEL_MAP: Record<string, Record<ModelTier, string>> = {
  openai: {
    small: "gpt-4o-mini",
    medium: "gpt-4o",
    strong: "o1",
  },
  anthropic: {
    small: "claude-3-haiku-20240307",
    medium: "claude-sonnet-4-20250514",
    strong: "claude-opus-4-20250514",
  },
};

export function selectModel(provider: string, preferredTier: ModelTier, confidence: number) {
  const resolvedTier = confidence < 0.4 && preferredTier !== "strong"
    ? preferredTier === "small"
      ? "medium"
      : "strong"
    : preferredTier;

  return {
    tier: resolvedTier,
    model: MODEL_MAP[provider]?.[resolvedTier] ?? MODEL_MAP.openai[resolvedTier],
  };
}
