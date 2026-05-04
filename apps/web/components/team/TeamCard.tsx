import type { TeamCard as TeamCardType } from "@ciao/shared";
import { Card } from "@/components/shared/Card";
import { Users, Trash2 } from "lucide-react";

export function TeamCard({
  team,
  onDelete,
}: {
  team: TeamCardType;
  onDelete?: (id: string) => void;
}) {
  return (
    <a href={`/teams/${team.id}`} className="block">
      <Card className="group cursor-pointer space-y-3 transition-all hover:border-accent/30">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
            <Users className="h-5 w-5 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900">{team.name}</h3>
            {team.description && (
              <p className="mt-0.5 text-sm text-muted line-clamp-2">{team.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{team.membersCount} member{team.membersCount !== 1 ? "s" : ""}</span>
          {onDelete && (
            <button
              onClick={(e) => { e.preventDefault(); onDelete(team.id); }}
              className="flex items-center gap-1 text-rose-500 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          )}
        </div>
      </Card>
    </a>
  );
}
