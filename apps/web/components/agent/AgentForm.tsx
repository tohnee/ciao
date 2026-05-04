"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";

export function AgentForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        description: description || undefined,
        systemPrompt: systemPrompt || undefined,
        provider: provider || undefined,
        model: model || undefined,
      }),
    });

    if (res.ok) {
      router.push("/agents");
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Novel Writer"
          className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm focus:shadow-[0_0_0_3px_rgba(16,163,127,0.08)] focus:outline-none focus:ring-0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this agent do?"
          rows={3}
          className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm focus:shadow-[0_0_0_3px_rgba(16,163,127,0.08)] focus:outline-none focus:ring-0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">
          System Prompt
        </label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="You are a helpful agent that..."
          rows={6}
          className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-mono shadow-sm focus:shadow-[0_0_0_3px_rgba(16,163,127,0.08)] focus:outline-none focus:ring-0"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Provider
          </label>
          <input
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="anthropic / openai"
            className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm focus:shadow-[0_0_0_3px_rgba(16,163,127,0.08)] focus:outline-none focus:ring-0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Model
          </label>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="claude-sonnet-4-20250514"
            className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm focus:shadow-[0_0_0_3px_rgba(16,163,127,0.08)] focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Creating..." : "Create Agent"}
        </Button>
        <Button type="button" onClick={() => router.push("/agents")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
