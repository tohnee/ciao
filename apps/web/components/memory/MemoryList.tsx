import type { Memory } from "@ciao/shared";
import { Card } from "@/components/shared/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bookmark } from "lucide-react";

export function MemoryList({ memories }: { memories: Memory[] }) {
  if (memories.length === 0) {
    return (
      <EmptyState
        title="No learned patterns yet"
        description="Memory suggestions appear after successful outcomes."
      />
    );
  }
  return (
    <div className="space-y-4">
      {memories.map((memory) => (
        <Card key={memory.id} className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
            <Bookmark className="h-4 w-4 text-accent" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-gray-900">
              {memory.title}
            </h3>
            <p className="mt-0.5 text-sm text-muted">{memory.compactRule}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
