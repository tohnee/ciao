"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { useTeamsStore } from "@/stores/teams";
import { useRouter } from "next/navigation";

export function TeamForm() {
  const router = useRouter();
  const { createTeam } = useTeamsStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createTeam({ name, description: description || undefined });
      router.push("/teams");
    } catch {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:shadow-[0_0_0_3px_rgba(16,163,127,0.08)] focus:border-accent"
          placeholder="e.g. Frontend Team"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:shadow-[0_0_0_3px_rgba(16,163,127,0.08)] focus:border-accent"
          placeholder="What this team does"
        />
      </div>
      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving..." : "Create Team"}
        </Button>
        <Button type="button" onClick={() => router.push("/teams")}>Cancel</Button>
      </div>
    </form>
  );
}
