import type { ProviderAdapter } from "./types";

export const mockProvider: ProviderAdapter = {
  name: "mock",
  async generate(prompt) {
    const fullText = [prompt.system, ...prompt.messages.map((m) => `${m.role}: ${m.content}`)]
      .filter(Boolean)
      .join("\n");

    return {
      text: `Mock response for: ${fullText}`,
      usage: {
        inputTokens: Math.max(1, fullText.length / 4),
        outputTokens: 42,
      },
    };
  },
};
