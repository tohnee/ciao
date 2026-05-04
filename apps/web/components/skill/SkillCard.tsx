import type { SkillCard as SkillCardType } from "@ciao/shared";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { BookOpen, Trash2 } from "lucide-react";

export function SkillCard({
  skill,
  onDelete,
}: {
  skill: SkillCardType;
  onDelete?: (id: string) => void;
}) {
  return (
    <Card className="group space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <BookOpen className="h-5 w-5 text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{skill.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <Badge tone="neutral">{skill.category}</Badge>
            <span className="text-xs text-muted">v{skill.version}</span>
          </div>
        </div>
      </div>

      {skill.description && (
        <p className="text-sm leading-relaxed text-muted line-clamp-2">
          {skill.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted">
        <span>{skill.agentsCount} agent{skill.agentsCount !== 1 ? "s" : ""} using</span>
        {onDelete && (
          <button
            onClick={() => onDelete(skill.id)}
            className="flex items-center gap-1 text-rose-500 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        )}
      </div>
    </Card>
  );
}
