export function buildDecision(question: string) {
  return {
    title: "Decision needed",
    question,
    recommendation: "minimal",
  };
}
