import { describe, expect, it } from "vitest";
import { appendEvent, listEventsAfter, resetEventLog } from "../apps/web/lib/event-repository";
import { prisma } from "../apps/web/lib/prisma";

const TEST_WORKSPACE_SLUG = "test-workspace";

async function ensureWorkspace(): Promise<string> {
  const ws = await prisma.workspace.upsert({
    where: { slug: TEST_WORKSPACE_SLUG },
    update: {},
    create: { name: "Test Workspace", slug: TEST_WORKSPACE_SLUG, settings: "{}" },
  });
  return ws.id;
}

describe("event repository", () => {
  it("stores and replays events after a lastEventId cursor", async () => {
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

    const replay = await listEventsAfter({
      workspaceId,
      stream: "home",
      lastEventId: first.id,
    });

    expect(replay).toHaveLength(1);
  });
});
