import { NextRequest } from "next/server";
import { ok } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { getBestProvider } from "@/lib/provider-factory";
import { interpretIntent } from "@ciao/engine/src/capabilities/interpret-intent";
import { planChange } from "@ciao/engine/src/capabilities/plan-change";
import { editCode } from "@ciao/engine/src/capabilities/edit-code";
import { runTests } from "@ciao/engine/src/capabilities/run-tests";
import { reviewDiff } from "@ciao/engine/src/capabilities/review-diff";
import { selectFiles } from "@ciao/engine/src/capabilities/select-files";
import { monitorSignal } from "@ciao/engine/src/capabilities/monitor-signal";
import { summarizeResult } from "@ciao/engine/src/capabilities/summarize-result";

const capabilities: Record<string, Function> = {
  interpret_intent: interpretIntent,
  plan_change: planChange,
  edit_code: editCode,
  run_tests: runTests,
  review_diff: reviewDiff,
  select_files: selectFiles,
  monitor_signal: monitorSignal,
  summarize_result: summarizeResult,
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { intentId, capability, args } = body as {
    intentId?: string;
    capability?: string;
    args?: Record<string, unknown>;
  };

  if (!intentId || !capability) {
    return ok({ ok: false, error: "intentId and capability are required" }, { status: 400 });
  }

  const fn = capabilities[capability];
  if (!fn) {
    return ok({ ok: false, error: `Unknown capability: ${capability}` }, { status: 400 });
  }

  const provider = getBestProvider();
  const intent = await prisma.intent.findUnique({ where: { id: intentId } });
  if (!intent) {
    return ok({ ok: false, error: "Intent not found" }, { status: 404 });
  }

  const goal = intent.interpretedGoal || intent.rawInput;
  const result = await fn(goal, args?.plan as string ?? "", provider);

  return ok({ ok: true, intentId, capability, result });
}
