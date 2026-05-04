import type { ProviderAdapter } from "@ciao/providers";

export type ResultSummary = {
  summary: string;
  changed: string[];
  verified: string[];
  risks: string[];
  confidence: "low" | "medium" | "high";
};

export async function summarizeResult(
  context: { goal: string; plan: string; output: string },
  provider: ProviderAdapter,
): Promise<ResultSummary> {
  const prompt = [
    `Goal: ${context.goal}`,
    `Plan: ${context.plan}`,
    `Output: ${context.output}`,
  ].join("\n");

  const result = await provider.generate({
    system:
      "You summarize engineering work into concise outcomes. Given a goal, plan, and execution output, produce:\n" +
      "- summary: one sentence\n" +
      "- changed: list of what was modified\n" +
      "- verified: list of verification evidence\n" +
      "- risks: list of remaining risks\n" +
      '- confidence: "low" | "medium" | "high"\n\n' +
      "Respond in JSON only.",
    messages: [{ role: "user", content: prompt }],
  });

  try {
    return JSON.parse(result.text) as ResultSummary;
  } catch {
    return {
      summary: "CIAO processed the intent.",
      changed: [],
      verified: [],
      risks: [],
      confidence: "medium",
    };
  }
}
