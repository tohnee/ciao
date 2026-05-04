import Anthropic from "@anthropic-ai/sdk";
import type { ProviderAdapter } from "./types";

function buildMessages(prompt: Parameters<ProviderAdapter["generate"]>[0]) {
  const messages: Anthropic.MessageParam[] = prompt.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  return messages;
}

export const anthropicProvider: ProviderAdapter = {
  name: "anthropic",
  async generate(prompt) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const mockText = [
        prompt.system,
        ...prompt.messages.map((m) => `${m.role}: ${m.content}`),
      ]
        .filter(Boolean)
        .join("\n");
      return {
        text: `[ANTHROPIC_API_KEY not set — using fallback]\nMock response for: ${mockText}`,
        usage: { inputTokens: 42, outputTokens: 16 },
      };
    }

    const client = new Anthropic({
      apiKey,
      baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
    });

    const msg = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: prompt.system,
      messages: buildMessages(prompt),
    });

    const text = msg.content
      .filter((block) => block.type === "text")
      .map((block) => (block as Anthropic.TextBlock).text)
      .join("\n");

    return {
      text,
      usage: {
        inputTokens: msg.usage.input_tokens,
        outputTokens: msg.usage.output_tokens,
      },
    };
  },
};
