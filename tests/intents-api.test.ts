import { describe, expect, it, vi } from "vitest";
import { prisma } from "../apps/web/lib/prisma";

vi.mock("../apps/web/lib/workspace", () => ({
  getRequiredWorkspaceId: async () => (globalThis as any).__ciaoTestWorkspaceId || "intents-test-ws-id",
}));

const TESTS_WORKSPACE_ID = "intents-test-ws-id";

describe("intents api contract", () => {
  it("returns a generated preview from raw input", async () => {
    (globalThis as any).__ciaoTestWorkspaceId = TESTS_WORKSPACE_ID;

    const mod = await import("../apps/web/app/api/intents/route");
    const response = await mod.POST(
      new Request("http://localhost/api/intents", {
        method: "POST",
        body: JSON.stringify({
          rawInput: "Fix OAuth callback test",
          mode: "ship",
          costMode: "frugal",
          autoStart: false,
        }),
        headers: { "content-type": "application/json" },
      }),
    );

    const body = await response.json();

    expect(body.preview.interpretedGoal).toContain("Fix OAuth callback test");
    expect(body.intent.state).toBe("understanding");
  });

  it("auto-starts into a working intent", async () => {
    (globalThis as any).__ciaoTestWorkspaceId = TESTS_WORKSPACE_ID;

    await prisma.workspace.upsert({
      where: { id: TESTS_WORKSPACE_ID },
      update: {},
      create: { id: TESTS_WORKSPACE_ID, name: "Test", slug: "test-intents", settings: "{}" },
    });

    const mod = await import("../apps/web/app/api/intents/route");
    const response = await mod.POST(
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

    const body = await response.json();

    expect(body.intent.state).toBe("working");
  });
});
