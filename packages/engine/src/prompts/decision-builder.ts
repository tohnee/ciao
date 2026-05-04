/**
 * Build a prompt for the LLM to generate a structured decision card
 * when the execution loop encounters ambiguity or risk.
 */
export function buildDecisionPrompt(question: string) {
  return [
    `You are CIAO's decision engine. When the execution loop hits a point where`,
    `a human judgment call would help, you produce a compact decision card.`,
    ``,
    `The question to present: ${question}`,
    ``,
    `Generate a JSON decision card with these fields:`,
    `  title: Short label for the decision (under 60 chars)`,
    `  question: The exact question the human needs to answer`,
    `  context: 1-2 sentence summary of why this decision matters`,
    `  options: Array of { id, label, description, recommendation }`,
    `    - Each option should be a distinct path the human can choose`,
    `    - recommendation (optional): which option you suggest and why`,
    `  severity: "low" | "medium" | "high" (how critical this decision is)`,
    ``,
    `Guidelines:`,
    `- Keep it small. A decision should unblock the loop, not stall it.`,
    `- Offer 2-3 clear options. Avoid analysis paralysis.`,
    `- If the risk is low, recommend a default path so the loop can continue.`,
    `- If the risk is high, frame the trade-offs honestly.`,
    ``,
    `Output ONLY valid JSON, no markdown, no extra text.`,
  ].join("\n");
}
