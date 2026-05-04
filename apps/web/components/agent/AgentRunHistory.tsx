"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/shared/Badge";
import { Play } from "lucide-react";

type RunCard = {
  id: string;
  intentTitle: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
};

export function AgentRunHistory({ agentId, refreshKey }: { agentId: string; refreshKey?: number }) {
  const [runs, setRuns] = useState<RunCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/agents/${agentId}/runs`);
        const data = await res.json();
        setRuns(data.runs ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [agentId, refreshKey]);

  if (loading) {
    return <div className="py-8 text-center text-sm text-muted">Loading runs...</div>;
  }

  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted">
        <Play className="h-5 w-5" />
        <p>No runs yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {runs.map((run) => (
        <div key={run.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-700 truncate">{run.intentTitle}</p>
            <p className="text-xs text-muted">
              {new Date(run.startedAt).toLocaleDateString()}
              {run.duration !== null && ` · ${run.duration}s`}
            </p>
          </div>
          <Badge
            tone={
              run.status === "completed"
                ? "success"
                : run.status === "running"
                  ? "warning"
                  : run.status === "failed"
                    ? "danger"
                    : "neutral"
            }
          >
            {run.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}
