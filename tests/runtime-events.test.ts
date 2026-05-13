import { describe, expect, it } from "vitest";
import { createDemoIntent, drainDemoEvents, resetDemoRuntime, resolveDecision, getOpenDecisions } from "../apps/web/lib/demo-runtime";

describe("demo runtime events", () => {
  it("emits decision and outcome events as the loop advances", async () => {
    await resetDemoRuntime();

    await createDemoIntent({
      rawInput: "Fix OAuth callback test",
      mode: "ship",
      costMode: "frugal",
      forceDecision: true,
    });

    const createdEvents = drainDemoEvents();
    expect(createdEvents.some((event) => event.type === "decision_created")).toBe(true);

    const decision = (await getOpenDecisions())[0];
    await resolveDecision(decision.id, "minimal");

    const resolvedEvents = drainDemoEvents();
    // Outcome is NOT created on resolve — orchestrator resumes asynchronously
    expect(resolvedEvents.some((event) => event.type === "calm_state_changed")).toBe(true);
  });
});
