export type AgentRunStatus = "running" | "completed" | "failed" | "paused";

export interface AgentRun {
  id: string;
  agentId: string;
  intentId: string;
  status: AgentRunStatus;
  startedAt: string;
  completedAt: string | null;
}

export interface AgentRunCard {
  id: string;
  agentId: string;
  agentName: string;
  intentTitle: string;
  status: AgentRunStatus;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
}
