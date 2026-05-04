"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { useSkillsStore } from "@/stores/skills";
import { useRouter } from "next/navigation";

export function SkillForm() {
  const router = useRouter();
  const { createSkill } = useSkillsStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [version, setVersion] = useState("1.0");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await createSkill({ name, description: description || undefined, content, category, version });
      router.push("/skills");
    } catch {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:shadow-[0_0_0_3px_rgba(16,163,127,0.08)] focus:border-accent"
          placeholder="e.g. Code Review"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:shadow-[0_0_0_3px_rgba(16,163,127,0.08)] focus:border-accent"
        >
          <option value="general">General</option>
          <option value="coding">Coding</option>
          <option value="writing">Writing</option>
          <option value="analysis">Analysis</option>
          <option value="research">Research</option>
          <option value="integration">Integration</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">Version</label>
        <input
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:shadow-[0_0_0_3px_rgba(16,163,127,0.08)] focus:border-accent"
          placeholder="1.0"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:shadow-[0_0_0_3px_rgba(16,163,127,0.08)] focus:border-accent"
          placeholder="What this skill does"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">
          Skill Content (system prompt fragment) *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:shadow-[0_0_0_3px_rgba(16,163,127,0.08)] focus:border-accent font-mono"
          placeholder="Instructions that will be injected into the agent's system prompt..."
          required
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving..." : "Create Skill"}
        </Button>
        <Button type="button" onClick={() => router.push("/skills")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
