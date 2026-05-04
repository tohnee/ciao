export type AgentConfig = {
  systemPrompt: string | null;
  provider: string | null;
  model: string | null;
  temperature: number | null;
  maxTokens: number | null;
};

export type AgentSkillDef = {
  name: string;
  content: string;
  version: string;
};

/**
 * Builds a compiled system prompt for an agent by combining its
 * custom system prompt with its enabled skills.
 */
export function buildAgentSystemPrompt(
  agent: AgentConfig,
  skills: AgentSkillDef[],
): string {
  const parts: string[] = [];

  if (agent.systemPrompt) {
    parts.push(agent.systemPrompt);
  }

  if (skills.length > 0) {
    const sections = skills.map(
      (s, i) =>
        `## Skill ${i + 1}: ${s.name} (v${s.version})\n${s.content}`,
    );
    parts.push(
      [
        "## Available Skills",
        "You have the following skills mounted. Follow their instructions when relevant:",
        "",
        ...sections,
      ].join("\n"),
    );
  }

  return parts.join("\n\n---\n\n");
}
