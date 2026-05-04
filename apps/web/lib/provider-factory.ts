import type { ProviderAdapter } from "@ciao/providers";
import { anthropicProvider } from "@ciao/providers";
import { openAIProvider } from "@ciao/providers";
import { mockProvider } from "@ciao/providers";

export function getBestProvider(): ProviderAdapter {
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropicProvider;
  }
  if (process.env.OPENAI_API_KEY) {
    return openAIProvider;
  }
  return mockProvider;
}
