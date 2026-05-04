export type ReviewResult = {
  approved: boolean;
  feedback: string[];
  risks: string[];
};

export function reviewDiff(
  diff: string,
): ReviewResult {
  if (!diff || diff.trim().length === 0) {
    return {
      approved: true,
      feedback: ["No changes to review."],
      risks: [],
    };
  }

  const lines = diff.split("\n");
  const additions = lines.filter((l) => l.startsWith("+") && !l.startsWith("+++")).length;
  const deletions = lines.filter((l) => l.startsWith("-") && !l.startsWith("---")).length;

  const risks: string[] = [];
  if (lines.some((l) => l.includes("apiKey") || l.includes("secret") || l.includes("password"))) {
    risks.push("Potential secret exposure detected");
  }
  if (additions > 200) {
    risks.push("Large diff — recommend incremental review");
  }

  return {
    approved: risks.length === 0,
    feedback: [`${additions} additions, ${deletions} deletions across ${lines.filter((l) => l.startsWith("diff")).length} files`],
    risks,
  };
}
