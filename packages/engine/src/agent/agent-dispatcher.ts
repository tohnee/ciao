/**
 * Creates a provider generate wrapper that prepends the agent's compiled
 * system prompt before every provider call.
 */
export function withAgentSystemPrompt(
  baseSystemPrompt: string,
  generate: (prompt: {
    system?: string;
    messages: { role: string; content: string }[];
  }) => Promise<{ text: string; usage?: { inputTokens?: number; outputTokens?: number } }>,
) {
  return async (prompt: {
    system?: string;
    messages: { role: string; content: string }[];
  }) => {
    const augmentedSystem = prompt.system
      ? `${baseSystemPrompt}\n\n${prompt.system}`
      : baseSystemPrompt;
    return generate({ ...prompt, system: augmentedSystem });
  };
}
