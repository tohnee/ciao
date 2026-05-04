import { describe, expect, it } from "vitest";
import { createDemoIntent, resetDemoRuntime } from "../apps/web/lib/demo-runtime";
import { listSignalsForIntent } from "../apps/web/lib/runtime-repository";

describe("runtime repository signals", () => {
  it("persists a signal when a started intent is created", async () => {
    await resetDemoRuntime();

    const { intent } = await createDemoIntent({
      rawInput: "Fix OAuth callback test",
      mode: "ship",
      costMode: "frugal",
      forceDecision: false,
    });

    const signals = await listSignalsForIntent(intent.id);

    expect(signals.some((signal) => signal.kind === "progress")).toBe(true);
  });
});
