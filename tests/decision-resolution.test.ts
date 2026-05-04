import { describe, expect, it } from "vitest";
import {
  createDemoIntent,
  getOpenDecisions,
  getOutcomeCards,
  resetDemoRuntime,
  resolveDecision,
} from "../apps/web/lib/demo-runtime";

describe("decision resolution", () => {
  it("moves an intent from needs_decision to ready and creates an outcome", async () => {
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
