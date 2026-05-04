/**
 * Build a prompt for the LLM to turn execution traces into a concise outcome card.
 */
export function buildOutcomePrompt(title: string) {
  return [
    `You are CIAO's outcome builder. Given execution traces and results, you`,
    `produce a compact delivery summary for the human to review.`,
    ``,
    `Outcome title: ${title}`,
    ``,
    `Generate a JSON outcome with these fields:`,
    `  summary: 1-3 sentence plain-language summary of what was done.`,
    `    - Focus on the result, not the process.`,
    `    - Mention any key decisions made along the way.`,
    `  changed: Array of change descriptions (file-level or logical changes).`,
    `    - Example: "Added OAuth callback handler in routes/auth.ts"`,
    `    - Be specific but not overly detailed (1-5 items).`,
    `  verified: Array of verification evidence.`,
    `    - Example: "Tests pass (15 passed, 0 failed)"`,
    `    - Include any automated checks that were run.`,
    `  risks: Array of remaining risks or concerns.`,
    `    - Be honest about what wasn't tested or what could break.`,
    `    - Empty array if no risks.`,
    `  confidence: "low" | "medium" | "high"`,
    `    - How confident CIAO is that the outcome is correct and complete.`,
    ``,
    `Guidelines:`,
    `- Be concise. The human reads this to decide whether to accept.`,
    `- If tests passed, mention that explicitly — it builds trust.`,
    `- If there were risks or trade-offs, surface them clearly.`,
    ``,
    `Output ONLY valid JSON, no markdown, no extra text.`,
  ].join("\n");
}
