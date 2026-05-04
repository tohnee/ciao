"use client";

import { useEffect } from "react";
import type { AgentCard as AgentCardType } from "@ciao/shared";
import { useAgentsStore } from "@/stores/agents";
import { AgentCard } from "@/components/agent/AgentCard";
import { EmptyState } from "@/components/shared/EmptyState";

export function AgentList() {
  const { agents, loading, fetchAgents, deleteAgent } = useAgentsStore();

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  if (loading && agents.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted">
        Loading agents...
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <EmptyState
        title="No agents yet"
        description="Create your first agent to get started."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent: AgentCardType) => (
        <AgentCard key={agent.id} agent={agent} onDelete={deleteAgent} />
      ))}
    </div>
  );
}
