import { describe, expect, it, vi } from "vitest";
import { createDemoIntent, resetDemoRuntime } from "../apps/web/lib/demo-runtime";

vi.mock("../apps/web/lib/workspace", () => ({
  getRequiredWorkspaceId: async () => (globalThis as any).__ciaoTestWorkspaceId,
}));

describe("home api", () => {
  it("returns the latest runtime snapshot", async () => {
    await resetDemoRuntime();
    await createDemoIntent({
      rawInput: "Fix OAuth callback test",
      mode: "ship",
      costMode: "frugal",
    });

    const mod = await import("../apps/web/app/api/home/route");
    const response = await mod.GET();
    const body = await response.json();

    expect(body.calmState).toBe("working");
    expect(body.now).toHaveLength(1);
  });
});
