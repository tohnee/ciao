export type SkillDef = {
  id: string;
  name: string;
  content: string;
  category: string;
  version: string;
};

export type AgentSkillBinding = {
  skill: SkillDef;
};

/**
 * Builds a system prompt fragment from a list of enabled agent skills.
 * Formats each skill's content as a named section that the agent should follow.
 */
export function buildSkillsPrompt(agentSkills: AgentSkillBinding[]): string {
  if (agentSkills.length === 0) return "";

  const sections = agentSkills.map(
    (binding, i) =>
      `## Skill ${i + 1}: ${binding.skill.name} (v${binding.skill.version})\n${binding.skill.content}`,
  );

  return [
    "## Available Skills",
    "You have the following skills mounted. Follow their instructions when relevant:",
    "",
    sections.join("\n\n"),
  ].join("\n");
}
