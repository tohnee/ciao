/**
 * Build a prompt for the LLM to summarize execution signals into a
 * calm, human-readable status update.
 */
export function buildSignalSummarizerPrompt(state: string) {
  return [
    `You are CIAO's signal summarizer. Your job is to take raw execution signals`,
    `and produce a calm, informative status message for the human.`,
    ``,
    `Current state / signals: ${state}`,
    ``,
    `Generate a JSON response with:`,
    `  status: "calm" | "working" | "needs_you" | "attention"`,
    `    - "calm": Nothing is happening. Idle state.`,
    `    - "working": CIAO is actively executing. Mention what's happening.`,
    `    - "needs_you": A decision or input is required from the human.`,
    `    - "attention": Something went wrong or needs review.`,
    `  message: A one-sentence plain-language update for the human.`,
    `    - No technical jargon unless necessary.`,
    `    - Honest about blockers but never alarmist.`,
    `  action: Optional suggested next action for the human.`,
    `    - Only include if status is "needs_you" or "attention".`,
    ``,
    `Guidelines:`,
    `- Be brief. The human glances at this on a dashboard.`,
    `- Don't overwhelm with detail. One clear message is enough.`,
    `- If there are multiple signals, summarize the most important one.`,
    ``,
    `Output ONLY valid JSON, no markdown, no extra text.`,
  ].join("\n");
}
