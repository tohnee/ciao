export type Memory = {
  id: string;
  workspaceId: string;
  outcomeId?: string;
  title: string;
  trigger: string;
  compactRule: string;
  fullProcedure?: string;
  examples?: string[];
  confidence: number;
  status: "active" | "disabled" | "archived";
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
};
