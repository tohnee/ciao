export type AgentMemoryItem = {
  content: string;
  type: string;
  source: string | null;
  confidence: number;
  tags: string | null;
};

/**
 * Formats relevant agent memories into a prompt fragment for injection
 * into the governor context.
 */
export function formatMemoriesForContext(
  memories: AgentMemoryItem[],
  maxMemories = 5,
): string {
  if (memories.length === 0) return "";

  const top = memories.slice(0, maxMemories);

  const entries = top.map(
    (m, i) =>
      `[${i + 1}] (${m.type}, confidence: ${m.confidence})${m.source ? ` from: ${m.source}` : ""}\n${m.content}`,
  );

  return [
    "## Related Memories",
    "The following memories are relevant to the current task:",
    "",
    ...entries,
  ].join("\n");
}
