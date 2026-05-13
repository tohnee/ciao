import type { IntentMode, LoopKind } from "@ciao/shared";
import type { GovernorContext, NextStep } from "./types";

function hasCompletedLoop(context: GovernorContext, kind: LoopKind) {
  return context.loops.some((loop) => loop.kind === kind && loop.state === "completed");
}

function handleShipMode(context: GovernorContext): NextStep {
  if (!hasCompletedLoop(context, "plan")) {
    return { type: "run_capability", capability: "plan_change" };
  }
  if (!hasCompletedLoop(context, "edit")) {
    return { type: "run_capability", capability: "edit_code" };
  }
  if (!hasCompletedLoop(context, "test")) {
    return { type: "run_capability", capability: "run_tests" };
  }
  if (!hasCompletedLoop(context, "review")) {
    return { type: "run_capability", capability: "review_diff" };
  }
  return { type: "build_outcome" };
}

function handleMode(mode: IntentMode, context: GovernorContext): NextStep {
  if (mode === "ask") {
    if (!hasCompletedLoop(context, "summarize")) {
      return { type: "run_capability", capability: "summarize_result" };
    }
    return { type: "build_outcome" };
  }
  if (mode === "review") {
    if (!hasCompletedLoop(context, "review")) {
      return { type: "run_capability", capability: "review_diff" };
    }
    return { type: "build_outcome" };
  }
  if (mode === "watch") {
    if (!hasCompletedLoop(context, "monitor")) {
      return { type: "run_capability", capability: "monitor_signal" };
    }
    return { type: "build_outcome" };
  }
  return handleShipMode(context);
}

export function determineNextStep(context: GovernorContext): NextStep {
  if (context.intent.riskLevel === "high" && context.intent.state !== "needs_decision") {
    return {
      type: "ask_decision",
      title: "High-risk area detected",
      question: "Should CIAO take the smaller path first?",
    };
  }

  return handleMode(context.intent.mode, context);
}
