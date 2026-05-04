import { describe, expect, it } from "vitest";
import { createDemoIntent, getHomeSnapshot, resetDemoRuntime } from "../apps/web/lib/demo-runtime";

describe("runtime repository", () => {
  it("persists a started intent and returns it in the home snapshot", async () => {
    await resetDemoRuntime();

    const { intent } = await createDemoIntent({
      rawInput: "Fix OAuth callback test",
      mode: "ship",
      costMode: "frugal",
      forceDecision: false,
    });

    const snapshot = await getHomeSnapshot();

    expect(intent.state).toBe("working");
    expect(snapshot.now.some((card) => card.intentId === intent.id)).toBe(true);
  });
});
