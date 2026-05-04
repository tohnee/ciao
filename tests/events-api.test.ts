import { describe, expect, it, vi } from "vitest";
import { appendEvent, resetEventLog } from "../apps/web/lib/event-repository";
import { prisma } from "../apps/web/lib/prisma";

const TEST_WORKSPACE_ID = "events-test-ws-uuid";

vi.mock("../apps/web/lib/workspace", () => ({
  getRequiredWorkspaceId: async () => TEST_WORKSPACE_ID,
}));

async function ensureWorkspace(): Promise<string> {
  await prisma.workspace.upsert({
    where: { id: TEST_WORKSPACE_ID },
    update: {},
    create: { id: TEST_WORKSPACE_ID, name: "Test Workspace", slug: "events-test-ws", settings: "{}" },
  });
  return TEST_WORKSPACE_ID;
}

describe("events api", () => {
  it("accepts lastEventId and returns newer persisted events", async () => {
    await resetEventLog();
    const workspaceId = await ensureWorkspace();

    const first = await appendEvent({
      workspaceId,
      stream: "home",
      type: "calm_state_changed",
      payload: { calmState: "working", summary: "CIAO is working quietly." },
    });

    await appendEvent({
      workspaceId,
      stream: "home",
      type: "loop_progress",
      payload: { intentId: "intent_1", message: "Running" },
    });

    const mod = await import("../apps/web/app/api/events/route");
    const response = await mod.GET(
      new Request(`http://localhost/api/events?stream=home&lastEventId=${first.id}`),
    );

    const body = await response.text();

    expect(response.headers.get("Content-Type")).toContain("text/event-stream");
    expect(body).toContain("Running");
    expect(body).not.toContain("CIAO is working quietly.");
  });
});
