"use client";

import { useEffect } from "react";
import type { TeamCard as TeamCardType } from "@ciao/shared";
import { useTeamsStore } from "@/stores/teams";
import { TeamCard } from "@/components/team/TeamCard";
import { EmptyState } from "@/components/shared/EmptyState";

export function TeamList() {
  const { teams, loading, fetchTeams, deleteTeam } = useTeamsStore();

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  if (loading && teams.length === 0) {
    return <div className="flex items-center justify-center py-16 text-sm text-muted">Loading teams...</div>;
  }

  if (teams.length === 0) {
    return <EmptyState title="No teams yet" description="Create your first team to combine agents." />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team: TeamCardType) => (
        <TeamCard key={team.id} team={team} onDelete={deleteTeam} />
      ))}
    </div>
  );
}
