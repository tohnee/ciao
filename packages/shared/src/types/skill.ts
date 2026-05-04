export interface Skill {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  content: string;
  category: string;
  version: string;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSkillInput {
  name: string;
  description?: string;
  content: string;
  category?: string;
  version?: string;
  metadata?: string;
}

export interface UpdateSkillInput {
  name?: string;
  description?: string;
  content?: string;
  category?: string;
  version?: string;
  metadata?: string;
}

export interface AgentSkill {
  agentId: string;
  skillId: string;
  enabled: boolean;
  assignedAt: string;
}

export interface SkillCard {
  id: string;
  name: string;
  description: string | null;
  category: string;
  version: string;
  agentsCount: number;
}
