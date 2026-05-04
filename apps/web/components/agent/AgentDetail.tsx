"use client";

import { useState } from "react";
import type { AgentWithRelations } from "@ciao/shared";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { AgentSkillManager } from "@/components/skill/AgentSkillManager";
import { AgentRunInput } from "@/components/agent/AgentRunInput";
import { AgentRunHistory } from "@/components/agent/AgentRunHistory";
import { AgentMemoryPanel } from "@/components/agent/AgentMemoryPanel";
import { Bot, Bookmark, Play, Activity, Terminal, History } from "lucide-react";

type Tab = "overview" | "run" | "history" | "memories";

const tabs: { id: Tab; label: string; icon: typeof Bot }[] = [
  { id: "overview", label: "Overview", icon: Bot },
  { id: "run", label: "Run", icon: Terminal },
  { id: "history", label: "History", icon: History },
  { id: "memories", label: "Memories", icon: Bookmark },
];

export function AgentDetail({ agent }: { agent: AgentWithRelations }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [runsRefreshKey, setRunsRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
            <Bot className="h-7 w-7 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">
                {agent.name}
              </h1>
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
              <p className="mt-1 text-sm text-muted">{agent.description}</p>
            )}
          </div>
        </div>
      </Card>

      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-white text-accent shadow-sm"
                  : "text-muted hover:text-gray-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <Activity className="mx-auto h-5 w-5 text-accent" />
              <p className="mt-2 text-lg font-semibold">{agent.runsCount}</p>
              <p className="text-xs text-muted">Runs</p>
            </Card>
            <Card className="text-center">
              <Bookmark className="mx-auto h-5 w-5 text-accent" />
              <p className="mt-2 text-lg font-semibold">{agent.memoriesCount}</p>
              <p className="text-xs text-muted">Memories</p>
            </Card>
            <Card className="text-center">
              <Play className="mx-auto h-5 w-5 text-accent" />
              <p className="mt-2 text-lg font-semibold">{agent.skills.length}</p>
              <p className="text-xs text-muted">Skills</p>
            </Card>
          </div>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Skills</h2>
            <AgentSkillManager agentId={agent.id} />
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-gray-900">
              Configuration
            </h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {agent.provider && (
                <>
                  <dt className="text-muted">Provider</dt>
                  <dd>{agent.provider}</dd>
                </>
              )}
              {agent.model && (
                <>
                  <dt className="text-muted">Model</dt>
                  <dd>{agent.model}</dd>
                </>
              )}
              {agent.temperature && (
                <>
                  <dt className="text-muted">Temperature</dt>
                  <dd>{agent.temperature}</dd>
                </>
              )}
              {agent.maxTokens && (
                <>
                  <dt className="text-muted">Max Tokens</dt>
                  <dd>{agent.maxTokens}</dd>
                </>
              )}
            </dl>
            {agent.systemPrompt && (
              <div className="mt-4">
                <dt className="mb-1 text-sm text-muted">System Prompt</dt>
                <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                  {agent.systemPrompt}
                </pre>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "run" && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Run Agent</h2>
          <p className="mb-4 text-sm text-muted">
            Describe what you want this agent to do. The agent will execute using its
            configured prompt and skills.
          </p>
          <AgentRunInput
            agentId={agent.id}
            onRunStarted={() => {
              setRunsRefreshKey((k) => k + 1);
              setActiveTab("history");
            }}
          />
        </Card>
      )}

      {activeTab === "history" && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Run History</h2>
          <AgentRunHistory agentId={agent.id} refreshKey={runsRefreshKey} />
        </Card>
      )}

      {activeTab === "memories" && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Memories</h2>
          <AgentMemoryPanel agentId={agent.id} />
        </Card>
      )}
    </div>
  );
}
