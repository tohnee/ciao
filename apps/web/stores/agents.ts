"use client";

import { create } from "zustand";
import type { AgentCard, CreateAgentInput } from "@ciao/shared";

type AgentState = {
  agents: AgentCard[];
  loading: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>;
  createAgent: (input: CreateAgentInput) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
};

export const useAgentsStore = create<AgentState>((set) => ({
  agents: [],
  loading: false,
  error: null,
  fetchAgents: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      set({ agents: data.agents, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  createAgent: async (input: CreateAgentInput) => {
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to create agent");
    const agentsRes = await fetch("/api/agents");
    const agentsData = await agentsRes.json();
    set({ agents: agentsData.agents });
  },
  deleteAgent: async (id: string) => {
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
    }));
  },
}));
