"use client";

import { create } from "zustand";
import type { SkillCard, CreateSkillInput } from "@ciao/shared";

type SkillState = {
  skills: SkillCard[];
  loading: boolean;
  error: string | null;
  fetchSkills: () => Promise<void>;
  createSkill: (input: CreateSkillInput) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
};

export const useSkillsStore = create<SkillState>((set) => ({
  skills: [],
  loading: false,
  error: null,
  fetchSkills: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/skills");
      const data = await res.json();
      set({ skills: data.skills, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  createSkill: async (input: CreateSkillInput) => {
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to create skill");
    const skillsRes = await fetch("/api/skills");
    const skillsData = await skillsRes.json();
    set({ skills: skillsData.skills });
  },
  deleteSkill: async (id: string) => {
    await fetch(`/api/skills/${id}`, { method: "DELETE" });
    set((state) => ({
      skills: state.skills.filter((s) => s.id !== id),
    }));
  },
}));
