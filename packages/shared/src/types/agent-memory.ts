export type MemoryType = "observation" | "skill" | "reflection";

export interface AgentMemory {
  id: string;
  agentId: string;
  content: string;
  type: MemoryType;
  source: string | null;
  confidence: number;
  tags: string | null;
  createdAt: string;
  lastAccess: string;
}

export interface CreateAgentMemoryInput {
  content: string;
  type?: MemoryType;
  source?: string;
  confidence?: number;
  tags?: string[];
}
