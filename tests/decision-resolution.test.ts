import { describe, expect, it } from "vitest";
import {
  createDemoIntent,
  getOpenDecisions,
  getOutcomeCards,
  resetDemoRuntime,
  resolveDecision,
} from "../apps/web/lib/demo-runtime";

describe("decision resolution", () => {
  it("resolves a decision and resumes the intent", async () => {
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
    // Decision resolution no longer creates fake outcome — orchestrator resumes async
    expect(await getOutcomeCards()).toHaveLength(0);
  });
});
