import type { ProviderAdapter } from "@ciao/providers";
import { extractJSON } from "../json-utils";

export type Interpretation = {
  title: string;
  interpretedGoal: string;
  constraints: string[];
  riskHints: string[];
};

export async function interpretIntent(
  input: string,
  provider: ProviderAdapter,
): Promise<Interpretation> {
  const result = await provider.generate({
    system:
      "You are a precise intent interpreter. Given a user's raw request, extract:\n" +
      "1. A concise title (under 60 chars)\n" +
      "2. The interpreted goal (one clear sentence)\n" +
      "3. Constraints (list of strings)\n" +
      "4. Risk hints (list of risk domains if any)\n\n" +
      "Respond in JSON format only, no markdown.",
    messages: [{ role: "user", content: input }],
  });

  try {
    const json = extractJSON(result.text);
    const parsed = JSON.parse(json) as Interpretation;
    return {
      title: parsed.title ?? input.trim().slice(0, 60),
      interpretedGoal: parsed.interpretedGoal ?? input.trim(),
      constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
      riskHints: Array.isArray(parsed.riskHints) ? parsed.riskHints : [],
    };
  } catch {
    return {
      title: input.trim().slice(0, 60) || "Untitled intent",
      interpretedGoal: input.trim(),
      constraints: [],
      riskHints: [],
    };
  }
}
