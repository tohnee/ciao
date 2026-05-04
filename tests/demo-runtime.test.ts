import { describe, expect, it } from "vitest";
import { createDemoIntent, getHomeSnapshot, resetDemoRuntime } from "../apps/web/lib/demo-runtime";

describe("demo runtime", () => {
  it("creates a working intent and exposes it in the home snapshot", async () => {
    await resetDemoRuntime();

    const created = await createDemoIntent({
      rawInput: "Fix OAuth callback test without changing public API",
      mode: "ship",
      costMode: "frugal",
    });

    const snapshot = await getHomeSnapshot();

    expect(created.intent.state).toBe("working");
    expect(snapshot.now.some((card) => card.intentId === created.intent.id)).toBe(true);
  });
});
