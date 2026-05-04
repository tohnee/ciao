import { describe, expect, it } from "vitest";
import {
  createDemoIntent,
  getOpenDecisions,
  getOutcomeCards,
  resetDemoRuntime,
  resolveDecision,
} from "../apps/web/lib/demo-runtime";

describe("sqlite decision resolution", () => {
  it("marks the decision resolved and persists an outcome", async () => {
    await resetDemoRuntime();

    await createDemoIntent({
      rawInput: "Fix OAuth callback test",
      mode: "ship",
      costMode: "frugal",
      forceDecision: true,
    });

    const decision = (await getOpenDecisions())[0];
    await resolveDecision(decision.id, "minimal");

    expect(await getOpenDecisions()).toHaveLength(0);
    expect(await getOutcomeCards()).toHaveLength(1);
  });
});
