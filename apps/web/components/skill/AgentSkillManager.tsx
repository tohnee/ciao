"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/shared/Badge";
import { BookOpen } from "lucide-react";

type AgentSkill = {
  skillId: string;
  enabled: boolean;
  skill: {
    id: string;
    name: string;
    description: string | null;
    category: string;
  };
};

export function AgentSkillManager({ agentId }: { agentId: string }) {
  const [skills, setSkills] = useState<AgentSkill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/skills`);
      const data = await res.json();
      setSkills(data.skills ?? []);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = async (skillId: string, currentlyEnabled: boolean) => {
    if (currentlyEnabled) {
      await fetch(`/api/agents/${agentId}/skills`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ skillId }),
      });
    } else {
      await fetch(`/api/agents/${agentId}/skills`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ skillId }),
      });
    }
    fetchSkills();
  };

  useEffect(() => {
    fetchSkills();
  }, [agentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted">
        Loading skills...
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-sm text-muted">
        <BookOpen className="h-5 w-5" />
        <p>No skills assigned. Create skills in the Skills library first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {skills.map((agentSkill) => (
        <div
          key={agentSkill.skillId}
          className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
        >
          <div className="min-w-0 flex-1">
            <span className="text-sm text-gray-700">{agentSkill.skill.name}</span>
            {agentSkill.skill.description && (
              <p className="mt-0.5 text-xs text-muted truncate">
                {agentSkill.skill.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-3">
            <Badge tone={agentSkill.enabled ? "success" : "neutral"}>
              {agentSkill.enabled ? "Enabled" : "Disabled"}
            </Badge>
            <button
              onClick={() => toggleSkill(agentSkill.skillId, agentSkill.enabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                agentSkill.enabled ? "bg-accent" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  agentSkill.enabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
