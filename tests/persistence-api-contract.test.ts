import { describe, expect, it, vi } from "vitest";
import { POST as postIntent } from "../apps/web/app/api/intents/route";
import { createDemoIntent, resetDemoRuntime } from "../apps/web/lib/demo-runtime";

vi.mock("../apps/web/lib/workspace", () => ({
  getRequiredWorkspaceId: async () => (globalThis as any).__ciaoTestWorkspaceId,
}));

describe("persistence-backed api contract", () => {
  it("keeps the same contract while reading from sqlite", async () => {
    await resetDemoRuntime();

    await postIntent(
      new Request("http://localhost/api/intents", {
        method: "POST",
        body: JSON.stringify({
          rawInput: "Fix OAuth callback test",
          mode: "ship",
          costMode: "frugal",
          autoStart: true,
        }),
        headers: { "content-type": "application/json" },
      }),
    );

    const mod = await import("../apps/web/app/api/home/route");
    const response = await mod.GET();
    const body = await response.json();

    expect(Array.isArray(body.now)).toBe(true);
    expect(body.now).toHaveLength(1);
  });
});
