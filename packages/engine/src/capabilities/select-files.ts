import type { ProviderAdapter } from "@ciao/providers";
import { extractJSON } from "../json-utils";

export type FileSelection = {
  files: string[];
  reasoning: string;
};

export async function selectFiles(
  goal: string,
  candidates: string[],
  provider: ProviderAdapter,
): Promise<FileSelection> {
  if (candidates.length === 0) {
    return { files: [], reasoning: "No candidate files provided." };
  }

  if (candidates.length <= 3) {
    return { files: candidates, reasoning: "Few candidates, included all." };
  }

  const prompt = [
    `Goal: ${goal}`,
    `Candidate files:\n${candidates.map((f) => `  - ${f}`).join("\n")}`,
    "",
    "Select the most relevant files to modify (max 5).",
    "Respond in JSON: { files: string[], reasoning: string }",
  ].join("\n");

  const result = await provider.generate({
    system:
      "You select source files most relevant to an engineering goal. Be minimal — only pick files that clearly need changes.",
    messages: [{ role: "user", content: prompt }],
  });

  try {
    const parsed = JSON.parse(extractJSON(result.text)) as FileSelection;
    return {
      files: Array.isArray(parsed.files) ? parsed.files.slice(0, 5) : candidates.slice(0, 3),
      reasoning: parsed.reasoning ?? "Selected by relevance",
    };
  } catch {
    return { files: candidates.slice(0, 3), reasoning: "Fallback: first 3 candidates" };
  }
}
