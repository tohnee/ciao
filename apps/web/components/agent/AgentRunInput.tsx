"use client";

import { useState } from "react";
import { Play } from "lucide-react";

export function AgentRunInput({ agentId, onRunStarted }: { agentId: string; onRunStarted?: () => void }) {
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    if (!input.trim()) return;
    setRunning(true);
    try {
      await fetch("/api/intents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          rawInput: input,
          mode: "act",
          costMode: "balanced",
          autoStart: true,
          agentId,
        }),
      });
      setInput("");
      onRunStarted?.();
    } catch {
      // ignore
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="min-h-24 w-full resize-none rounded-lg border border-border bg-gray-50 p-3 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-light focus:border-accent focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,163,127,0.08)]"
        placeholder="What should this agent do?"
      />
      <div className="flex justify-end">
        <button
          onClick={handleRun}
          disabled={running || !input.trim()}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-hover disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          {running ? "Running..." : "Execute"}
        </button>
      </div>
    </div>
  );
}
