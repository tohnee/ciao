import { AgentForm } from "@/components/agent/AgentForm";

export default function NewAgentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">New Agent</h1>
        <p className="mt-1 text-sm text-muted">
          Configure a new AI agent with custom instructions.
        </p>
      </div>
      <AgentForm />
    </div>
  );
}
