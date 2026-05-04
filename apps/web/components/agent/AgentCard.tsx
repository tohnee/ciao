import type { AgentCard as AgentCardType } from "@ciao/shared";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Bot, Cpu, Brain } from "lucide-react";

const typeIcons: Record<string, typeof Bot> = {
  system: Cpu,
  custom: Bot,
  marketplace: Brain,
};

const typeLabels: Record<string, string> = {
  system: "System",
  custom: "Custom",
  marketplace: "Marketplace",
};

export function AgentCard({
  agent,
  onDelete,
}: {
  agent: AgentCardType;
  onDelete?: (id: string) => void;
}) {
  const Icon = typeIcons[agent.type] ?? Bot;

  return (
    <a href={`/agents/${agent.id}`} className="block">
      <Card className="group cursor-pointer space-y-3 transition-all hover:border-accent/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              {agent.avatarUrl ? (
                <img
                  src={agent.avatarUrl}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <Icon className="h-5 w-5 text-accent" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {agent.name}
              </h3>
              <p className="text-xs text-muted">{typeLabels[agent.type]}</p>
            </div>
          </div>
          <Badge
            tone={
              agent.status === "active"
                ? "success"
                : agent.status === "inactive"
                  ? "neutral"
                  : "danger"
            }
          >
            {agent.status}
          </Badge>
        </div>

        {agent.description && (
          <p className="text-sm leading-relaxed text-muted line-clamp-2">
            {agent.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted">
          <span>{agent.skillsCount} skills</span>
          <span>{agent.runsCount} runs</span>
        </div>

        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(agent.id);
            }}
            className="text-xs text-rose-500 opacity-0 transition-opacity group-hover:opacity-100"
          >
            Delete
          </button>
        )}
      </Card>
    </a>
  );
}
