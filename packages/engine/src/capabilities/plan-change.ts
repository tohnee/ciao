import type { ProviderAdapter } from "@ciao/providers";
import { extractJSON } from "../json-utils";

export type ChangePlan = {
  title: string;
  goal: string;
  steps: string[];
};

export async function planChange(
  goal: string,
  provider: ProviderAdapter,
): Promise<ChangePlan> {
  const result = await provider.generate({
    system:
      "You are a precise change planner. Given an engineering goal, produce a minimal set of focused steps to achieve it.\n" +
      "Respond in JSON: { title: string, goal: string, steps: string[] }",
    messages: [{ role: "user", content: goal }],
  });

  try {
    return JSON.parse(extractJSON(result.text)) as ChangePlan;
  } catch {
    return { title: "Focused plan", goal, steps: ["Execute the change"] };
  }
}
