import { AgentList } from "@/components/agent/AgentList";
import { Button } from "@/components/shared/Button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-stone-800">Agents</h1>
          <p className="mt-1 text-sm text-stone-500">
            Create and manage your AI agents.
          </p>
        </div>
        <Link href="/agents/new">
          <Button variant="primary">
            <Plus className="mr-1.5 h-4 w-4" />
            New Agent
          </Button>
        </Link>
      </div>
      <AgentList />
    </div>
  );
}
