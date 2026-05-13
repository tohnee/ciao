import type { ProviderAdapter } from "@ciao/providers";
import { extractJSON } from "../json-utils";

export type EditResult = {
  summary: string;
  files: string[];
  changes: string[];
};

export async function editCode(
  goal: string,
  plan: string,
  provider: ProviderAdapter,
): Promise<EditResult> {
  const prompt = [
    `Goal: ${goal}`,
    `Plan:\n${plan}`,
    "",
    "Describe the code changes needed to accomplish this goal.",
    "Respond in JSON: { summary: string, files: string[], changes: string[] }",
  ].join("\n");

  const result = await provider.generate({
    system:
      "You are a focused code editor. Given a goal and plan, describe the minimal code changes needed.",
    messages: [{ role: "user", content: prompt }],
  });

  try {
    return JSON.parse(extractJSON(result.text)) as EditResult;
  } catch {
    return {
      summary: `Edit work for: ${goal}`,
      files: [],
      changes: ["Pending implementation"],
    };
  }
}
