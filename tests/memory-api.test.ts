import { describe, expect, it, vi } from "vitest";
import { GET as listMemories } from "../apps/web/app/api/memories/route";
import { POST as saveMemory } from "../apps/web/app/api/outcomes/[id]/save-memory/route";
import { resetDemoRuntime } from "../apps/web/lib/demo-runtime";
import { prisma } from "../apps/web/lib/prisma";

vi.mock("../apps/web/lib/workspace", () => ({
  getRequiredWorkspaceId: async () => (globalThis as any).__ciaoTestWorkspaceId,
}));

describe("memory api", () => {
  it("persists a memory from an outcome", async () => {
    await resetDemoRuntime();
    const workspaceId = (globalThis as any).__ciaoTestWorkspaceId as string;

    // Create a real intent + outcome so FK constraints are satisfied
    const intent = await prisma.intent.create({
      data: {
        workspaceId,
        rawInput: "Test memory flow",
        title: "Test memory",
        interpretedGoal: "Test memory flow",
        mode: "ship",
        state: "ready",
      },
    });

    const outcome = await prisma.outcome.create({
      data: {
        intentId: intent.id,
        title: "Test memory",
        summary: "A test outcome",
        changed: JSON.stringify(["file.ts"]),
        verified: JSON.stringify([]),
        risks: JSON.stringify([]),
        confidence: "high",
        state: "ready",
      },
    });

    const saveResponse = await saveMemory(
      new Request(`http://localhost/api/outcomes/${outcome.id}/save-memory`, {
        method: "POST",
        body: JSON.stringify({ title: "Use the smaller auth fix first" }),
        headers: { "content-type": "application/json" },
      }),
      { params: { id: outcome.id } },
    );

    const listResponse = await listMemories();
    const payload = await listResponse.json();

    expect(saveResponse.status).toBe(200);
    expect(payload.total).toBe(1);
    expect(payload.memories[0].title).toBe("Use the smaller auth fix first");
  });
});
