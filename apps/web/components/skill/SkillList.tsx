"use client";

import { useEffect } from "react";
import type { SkillCard as SkillCardType } from "@ciao/shared";
import { useSkillsStore } from "@/stores/skills";
import { SkillCard } from "@/components/skill/SkillCard";
import { EmptyState } from "@/components/shared/EmptyState";

export function SkillList() {
  const { skills, loading, fetchSkills, deleteSkill } = useSkillsStore();

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  if (loading && skills.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted">
        Loading skills...
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <EmptyState
        title="No skills yet"
        description="Create your first reusable skill to get started."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill: SkillCardType) => (
        <SkillCard key={skill.id} skill={skill} onDelete={deleteSkill} />
      ))}
    </div>
  );
}
