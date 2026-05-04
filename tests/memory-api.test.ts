import { describe, expect, it, vi } from "vitest";
import { GET as listMemories } from "../apps/web/app/api/memories/route";
import { POST as saveMemory } from "../apps/web/app/api/outcomes/[id]/save-memory/route";
import { createDemoIntent, getOpenDecisions, getOutcomeCards, resolveDecision, resetDemoRuntime } from "../apps/web/lib/demo-runtime";

vi.mock("../apps/web/lib/workspace", () => ({
  getRequiredWorkspaceId: async () => (globalThis as any).__ciaoTestWorkspaceId,
}));

describe("memory api", () => {
  it("persists a memory from an outcome", async () => {
    await resetDemoRuntime();

    await createDemoIntent({
      rawInput: "Fix OAuth callback test",
      mode: "ship",
      costMode: "frugal",
      forceDecision: true,
    });

    const decision = (await getOpenDecisions())[0];
    await resolveDecision(decision.id, "minimal");
    const outcomes = await getOutcomeCards();
    const outcome = outcomes[0];

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
