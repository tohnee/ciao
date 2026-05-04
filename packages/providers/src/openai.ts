import OpenAI from "openai";
import type { ProviderAdapter } from "./types";

export const openAIProvider: ProviderAdapter = {
  name: "openai",
  async generate(prompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const mockText = [
        prompt.system,
        ...prompt.messages.map((m) => `${m.role}: ${m.content}`),
      ]
        .filter(Boolean)
        .join("\n");
      return {
        text: `[OPENAI_API_KEY not set — using fallback]\nMock response for: ${mockText}`,
        usage: { inputTokens: 42, outputTokens: 16 },
      };
    }

    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o",
      max_tokens: 4096,
      messages: [
        ...(prompt.system ? [{ role: "system" as const, content: prompt.system }] : []),
        ...prompt.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
    });

    return {
      text: completion.choices[0]?.message?.content ?? "",
      usage: {
        inputTokens: completion.usage?.prompt_tokens ?? 0,
        outputTokens: completion.usage?.completion_tokens ?? 0,
      },
    };
  },
};
