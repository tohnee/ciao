export type AgentStatus = "active" | "inactive" | "archived";
export type AgentType = "system" | "custom" | "marketplace";

export interface Agent {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  type: AgentType;
  status: AgentStatus;
  provider: string | null;
  model: string | null;
  systemPrompt: string | null;
  temperature: number | null;
  maxTokens: number | null;
  price: number | null;
  metadata: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentInput {
  name: string;
  description?: string;
  type?: AgentType;
  systemPrompt?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  price?: number;
  avatarUrl?: string;
  metadata?: string;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  status?: AgentStatus;
  systemPrompt?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  price?: number;
  avatarUrl?: string;
  metadata?: string;
}

export interface AgentCard {
  id: string;
  name: string;
  description: string | null;
  type: AgentType;
  status: AgentStatus;
  avatarUrl: string | null;
  skillsCount: number;
  runsCount: number;
  createdAt: string;
}

export interface AgentWithRelations extends Agent {
  skills: { id: string; name: string; enabled: boolean }[];
  runsCount: number;
  memoriesCount: number;
}
