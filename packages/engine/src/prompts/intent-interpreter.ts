/**
 * Build a prompt for the LLM to interpret raw user input into a structured intent.
 */
export function buildIntentInterpreterPrompt(rawInput: string) {
  return [
    `You are CIAO's intent interpreter. Your job is to parse raw user input`,
    `into a structured, actionable engineering goal.`,
    ``,
    `Raw input: "${rawInput}"`,
    ``,
    `Analyze it and produce a JSON object with:`,
    `  interpretedGoal: A clear, focused restatement of what the user wants done.`,
    `    - Remove filler words, assumptions, and ambiguous phrasing.`,
    `    - Frame it as a concrete engineering task (e.g. "Add OAuth2 callback handler").`,
    `    - Max 200 characters.`,
    `  title: A short label (under 60 chars) for the intent card.`,
    `    - Capture the core action, not the full description.`,
    `  constraints: Array of strings listing implicit guardrails.`,
    `    - What should NOT be changed or touched.`,
    `    - Security, performance, or style considerations.`,
    `    - If the input mentions "minimal" or "small", include a constraint like "Prefer smallest possible change".`,
    `    - Include at least 1 constraint, at most 4.`,
    `  riskLevel: "low" | "medium" | "high"`,
    `    - "high" if the input touches auth, billing, data loss, or security.`,
    `    - "medium" if it modifies core business logic or shared code.`,
    `    - "low" for cosmetic, docs, or isolated changes.`,
    `  mode: "ask" | "draft" | "act" | "ship" | "watch" | "review"`,
    `    - "ask" if the user is asking a question or exploring.`,
    `    - "ship" if they want changes made and tested (default for action requests).`,
    `    - "review" if they want feedback on existing code.`,
    `    - "watch" if they want monitoring or observation.`,
    `    - "draft" if they want a proposal without execution.`,
    `    - "act" if they want direct execution with minimal oversight.`,
    ``,
    `Output ONLY valid JSON, no markdown, no extra text.`,
  ].join("\n");
}
