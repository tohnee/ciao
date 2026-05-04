"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/shared/Badge";
import { Bookmark, Trash2 } from "lucide-react";

type MemoryItem = {
  id: string;
  content: string;
  type: string;
  source: string | null;
  confidence: number;
  createdAt: string;
};

export function AgentMemoryPanel({ agentId }: { agentId: string }) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/memories`);
      const data = await res.json();
      setMemories(data.memories ?? []);
    } finally {
      setLoading(false);
    }
  };

  const deleteMemory = async (memoryId: string) => {
    await fetch(`/api/agents/${agentId}/memories`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ memoryId }),
    });
    fetchMemories();
  };

  useEffect(() => {
    fetchMemories();
  }, [agentId]);

  if (loading) {
    return <div className="py-8 text-center text-sm text-muted">Loading memories...</div>;
  }

  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted">
        <Bookmark className="h-5 w-5" />
        <p>No memories yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {memories.map((memory) => (
        <div key={memory.id} className="rounded-lg bg-gray-50 px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-gray-700 whitespace-pre-wrap flex-1">{memory.content}</p>
            <button
              onClick={() => deleteMemory(memory.id)}
              className="shrink-0 text-rose-500 hover:text-rose-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Badge tone="neutral">{memory.type}</Badge>
            {memory.source && <span className="text-xs text-muted">from: {memory.source}</span>}
            <span className="text-xs text-muted">confidence: {memory.confidence}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
