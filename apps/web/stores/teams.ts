"use client";

import { create } from "zustand";
import type { TeamCard, CreateTeamInput } from "@ciao/shared";

type TeamState = {
  teams: TeamCard[];
  loading: boolean;
  error: string | null;
  fetchTeams: () => Promise<void>;
  createTeam: (input: CreateTeamInput) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
};

export const useTeamsStore = create<TeamState>((set) => ({
  teams: [],
  loading: false,
  error: null,
  fetchTeams: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/teams");
      const data = await res.json();
      set({ teams: data.teams, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  createTeam: async (input: CreateTeamInput) => {
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to create team");
    const teamsRes = await fetch("/api/teams");
    const teamsData = await teamsRes.json();
    set({ teams: teamsData.teams });
  },
  deleteTeam: async (id: string) => {
    await fetch(`/api/teams/${id}`, { method: "DELETE" });
    set((state) => ({ teams: state.teams.filter((t) => t.id !== id) }));
  },
}));
