"use client";

import { useEffect, useState } from "react";
import type { TeamWithMembers } from "@ciao/shared";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Users } from "lucide-react";

export function TeamDetail({ teamId }: { teamId: string }) {
  const [team, setTeam] = useState<TeamWithMembers | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/teams/${teamId}`);
        const data = await res.json();
        setTeam(data.team);
      } finally {
        setLoading(false);
      }
    })();
  }, [teamId]);

  if (loading) return <div className="py-16 text-center text-sm text-muted">Loading team...</div>;
  if (!team) return <div className="py-16 text-center text-sm text-muted">Team not found.</div>;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
            <Users className="h-7 w-7 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-gray-900">{team.name}</h1>
            {team.description && <p className="mt-1 text-sm text-muted">{team.description}</p>}
            <p className="mt-1 text-xs text-muted">{team.members.length} member{team.members.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Members</h2>
        {team.members.length === 0 ? (
          <p className="text-sm text-muted">No members yet.</p>
        ) : (
          <div className="space-y-2">
            {team.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{member.agentName}</span>
                  <Badge tone={member.role === "lead" ? "success" : member.role === "observer" ? "neutral" : "warning"}>
                    {member.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
